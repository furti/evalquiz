/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import {Riddle, RiddleState} from './riddle';
import {Service} from './utils';

export type RiddleStateMap = { [riddleId: string]: RiddleState };

const STATE_KEY = 'evalQuiz.state';
const SELECTED_RIDDLE_ID_KEY = 'evalQuiz.selectedRiddleId';

@Service(module, 'storageService')
export class StorageService {
    static $inject = ['localStorageService'];

    constructor(private storage: angular.local.storage.ILocalStorageService) {
    }

    /**
     * Loads all save games from the local storage.
     * 
     * @returns {SaveGames} a map of SaveGame objects with the id of the riddle as key
     * 
     * @memberOf StorageService
     */
    public load(): RiddleStateMap {
        return this.storage.get(STATE_KEY) as RiddleStateMap || {};
    }

    /**
     * Stores the specified riddles to the local storage.
     * 
     * @param {Riddle[]} riddles the riddles to save
     * 
     * @memberOf StorageService
     */
    public save(...riddles: Riddle[]): void {
        let map: RiddleStateMap = this.load();

        riddles.forEach((riddle) => {
            if (!riddle.state) {
                console.error("Riddle is missing state: %o", riddle);
                return;
            }

            map[riddle.id] = angular.copy(riddle.state);
        });

        this.storage.set(STATE_KEY, map);
    }

    /**
     * Clears all saved data.
     * 
     * @memberOf StorageService
     */
    public clear(): void {
        this.storage.clearAll();
    }

    /**
     * Loads the id of the last started riddle.
     * 
     * @returns {string} the id of the riddle
     * 
     * @memberOf StorageService
     */
    public loadSelectedRiddleId(): string {
        return this.storage.get<string>(SELECTED_RIDDLE_ID_KEY) || 'intro';
    }

    /**
     * Save the id of the last started riddle so we can restart it when the page is opened again.
     * 
     * @param {string} riddleId the id of the riddle
     * 
     * @memberOf StorageService
     */
    public saveSelectedRiddleId(riddleId: string): void {
        this.storage.set(SELECTED_RIDDLE_ID_KEY, riddleId);
    }


}
