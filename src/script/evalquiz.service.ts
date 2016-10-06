/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import { Riddle, RiddleDetail, RiddleState, Member } from './riddle';
import { StorageService } from './storage.service';
import { UIService } from './ui.service';
import { Injectable } from './utils';

@Injectable(module, 'evalQuizService')
export class EvalQuizService {

    protected _initialized: boolean = false;
    protected _initializeCallbacks: (() => void)[] = [];
    protected _selectedRiddleId: string;
    protected _totalScore: number = 0;

    protected riddles: Riddle[];
    protected riddleMap: { [id: string]: Riddle };

    static $inject = ['$location', '$http', '$q', 'storageService', 'uiService'];

    constructor(protected $location: ng.ILocationService, protected $http: ng.IHttpService, protected $q: ng.IQService, protected storageService: StorageService, protected uiService: UIService) {
    }

    /**
     * Loads the index of the riddles from the the riddle.json file.
     */
    initialize(): angular.IPromise<any> {
        let deferred = this.$q.defer();

        this._initialized = false;
        this._selectedRiddleId;

        this.riddles = [];
        this.riddleMap = {};

        this.$http.get('riddles/riddles.json').then(response => {
            let riddles: Riddle[] = response.data as Riddle[];

            for (let i = 0; i < riddles.length; i++) {
                riddles[i].level = i + 1;
            }

            this.prepare(riddles);

            deferred.resolve();
        }, (error: any) => {
            this.uiService.alert('Loading Riddles', 'Unfortunately, the index file of the riddles could not be loaded. This is a show stopper. Sorry.');

            deferred.reject();
        });

        return deferred.promise;
    }

    /**
     * Load the saved games and add the data to the riddle index. Additionally it initilizes the local riddle map
     * that holds all the riddles with the id as key.
     * 
     * @private
     * @param {Riddle[]} riddles the riddles
     * @returns {void}
     */
    private prepare(riddles: Riddle[]): void {
        if (!riddles) {
            return;
        }

        this.riddles = riddles;
        this.riddleMap = {};

        riddles.forEach((riddle) => {
            riddle.state = {
                score: 0
            };

            riddle.detail = null;

            this.riddleMap![riddle.id] = riddle;
        });

        let persistedRiddleStates = this.storageService.load();

        for (let id in persistedRiddleStates) {
            let riddle = this.riddleMap[id];

            if (riddle) {
                riddle.state = angular.copy(persistedRiddleStates[id]);
            }
        }

        this.updateStatistics();

        this._initialized = true;
        this._initializeCallbacks.forEach(fn => fn());
    }

    get initialized(): boolean {
        return this._initialized;
    }

    whenInitialized(fn: () => void): void {
        if (this._initialized) {
            fn();
        }
        else {
            this._initializeCallbacks.push(fn);
        }
    }

    reset(clear: boolean): void {
        if (clear) {
            this.storageService.clear();
        }

        this.initialize().then(() => {
            this.gotoRiddle('intro');
        });
    }

    get selectedRiddleId(): string {
        if (!this._selectedRiddleId) {
            this._selectedRiddleId = this.storageService.loadSelectedRiddleId() || 'intro';

        }

        return this._selectedRiddleId;
    }

    set selectedRiddleId(selectedRiddleId: string) {
        if (this._selectedRiddleId !== selectedRiddleId) {
            this._selectedRiddleId = selectedRiddleId;
            this.storageService.saveSelectedRiddleId(selectedRiddleId);
        }
    }

    gotoRiddle(riddleId: string): void {
        this.$location.path('/riddles/' + riddleId);
        this.selectedRiddleId = riddleId;
    }

    gotoOverview(): void {
        this.$location.path('/overview');
    }

    getRiddles(): Riddle[] {
        return this.riddles;
    }

    getRiddle(riddleId: string): Riddle | undefined {
        return this.riddleMap[riddleId];
    }

    getNextRiddle(riddle: Riddle): Riddle | undefined {
        let pos = this.riddles.indexOf(riddle);

        if (this.riddles.length > pos + 1) {
            return this.riddles[pos + 1];
        }

        return undefined;
    }

    getNextRiddleId(riddleId: string): string | undefined {
        for (let i = 0; i < this.riddles.length; i++) {
            if (this.riddles[i].id === riddleId) {
                if (i + 1 >= this.riddles.length) {
                    return undefined;
                }

                return this.riddles[i + 1].id;
            }
        }

        return undefined;
    }

    saveRiddle(...riddles: Riddle[]): void {
        this.storageService.save(...riddles);
        this.updateStatistics();
    }

    updateStatistics(): void {
        this._totalScore = this.riddles.map(riddle => riddle.state.score).reduce((a, b) => a + b, 0)
    }

    get totalScore(): number {
        return this._totalScore;
    }
}


