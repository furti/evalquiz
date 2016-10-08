/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import { Riddle, RiddleState } from './riddle';
import { Injectable } from './utils';

export type RiddleStateMap = { [riddleId: string]: RiddleState };

const STATE_KEY = 'evalQuiz.state';
const PATH_KEY = 'evalQuiz.path';
const LAST_RIDDLE_ID_KEY = 'evalQuiz.lastRiddleId';

@Injectable(module, 'storageService')
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
     * Loads the last path
     * 
     * @returns {string} the path
     * 
     * @memberOf StorageService
     */
    public loadPath(): string {
        return this.storage.get<string>(PATH_KEY) || '/riddles/' + this.loadLastRiddleId();
    }

    /**
     * Save the path so we can restart it when the page is opened again.
     * 
     * @param {string} path the path
     * 
     * @memberOf StorageService
     */
    public savePath(path: string): void {
        this.storage.set(PATH_KEY, path);
    }

    /**
     * Loads the last riddleId
     * 
     * @returns {string} the id of the last riddle
     * 
     * @memberOf StorageService
     */
    public loadLastRiddleId(): string {
        return this.storage.get<string>(LAST_RIDDLE_ID_KEY) || 'intro';
    }

    /**
     * Save the lastRiddleId so we can restart it when the page is opened again.
     * 
     * @param {string} lastRiddleId the id of the last riddle
     * 
     * @memberOf StorageService
     */
    public saveLastRiddleId(lastRiddleId: string): void {
        this.storage.set(LAST_RIDDLE_ID_KEY, lastRiddleId);
    }

}
