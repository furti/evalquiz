/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import { Riddle, RiddleState } from './riddle';
import { Injectable } from './utils';

export type RiddleStateMap = { [riddleId: string]: RiddleState };

const STATE_KEY = 'evalQuiz.state';
const PATH_KEY = 'evalQuiz.path';
const LAST_RIDDLE_ID_KEY = 'evalQuiz.lastRiddleId';
const DATA_STORAGE_ALLOWED_KEY = 'evalQuiz.agreement';

@Injectable(module, 'storageService')
export class StorageService {
    static $inject = ['localStorageService'];

    private _dataStorageAllowed: boolean | undefined;

    constructor(private storage: angular.local.storage.ILocalStorageService) {
    }

    /**
     * Loads all save games from the local storage.
     * 
     * @returns {SaveGames} a map of SaveGame objects with the id of the riddle as key
     * 
     * @memberOf StorageService
     */
    loadRiddles(): RiddleStateMap {
        return this.storage.get(STATE_KEY) as RiddleStateMap || {};
    }

    /**
     * Stores the specified riddles to the local storage.
     * 
     * @param {Riddle[]} riddles the riddles to save
     * 
     * @memberOf StorageService
     */
    saveRiddles(...riddles: Riddle[]): void {
        let map: RiddleStateMap = this.loadRiddles();

        riddles.forEach((riddle) => {
            if (!riddle.state) {
                console.error("Riddle is missing state:", riddle);
                return;
            }

            map[riddle.id] = angular.copy(riddle.state);
        });

        if (!this.dataStorageAllowed) {
            this.storage.set(STATE_KEY, map);
        }
    }

    /**
     * Clears all saved data.
     * 
     * @memberOf StorageService
     */
    clear(): void {
        this.storage.clearAll();
    }

    /**
     * Loads the last path
     * 
     * @returns {string} the path
     * 
     * @memberOf StorageService
     */
    loadPath(): string {
        return this.storage.get<string>(PATH_KEY) || '/riddles/' + this.loadLastRiddleId();
    }

    /**
     * Save the path so we can restart it when the page is opened again.
     * 
     * @param {string} path the path
     * 
     * @memberOf StorageService
     */
    savePath(path: string): void {
        if (!this.dataStorageAllowed) {
            this.storage.set(PATH_KEY, path);
        }
    }

    /**
     * Loads the last riddleId
     * 
     * @returns {string} the id of the last riddle
     * 
     * @memberOf StorageService
     */
    loadLastRiddleId(): string {
        return this.storage.get<string>(LAST_RIDDLE_ID_KEY) || 'intro';
    }

    /**
     * Save the lastRiddleId so we can restart it when the page is opened again.
     * 
     * @param {string} lastRiddleId the id of the last riddle
     * 
     * @memberOf StorageService
     */
    saveLastRiddleId(lastRiddleId: string): void {
        if (!this.dataStorageAllowed) {
            this.storage.set(LAST_RIDDLE_ID_KEY, lastRiddleId);
        }
    }

    /**
     * Loads the storage agreement.
     * 
     * @returns {string} the path
     * 
     * @memberOf StorageService
     */
    get dataStorageAllowed(): boolean {
        if (this._dataStorageAllowed !== undefined) {
            return !!this._dataStorageAllowed;
        }

        return this._dataStorageAllowed = (this.storage.get<boolean>(DATA_STORAGE_ALLOWED_KEY) || false);
    }

    /**
     * Save the the storage agreement. If false, the whole storage will be cleared.
     * 
     * @param {string} allowed true if allowed
     * 
     * @memberOf StorageService
     */
    saveDataStorageAllowed(dataStorageAllowed: boolean): void {
        this._dataStorageAllowed = dataStorageAllowed;

        if (dataStorageAllowed) {
            this.storage.set(DATA_STORAGE_ALLOWED_KEY, dataStorageAllowed);
        }
        else {
            this.clear();
        }
    }

}
