/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import {Riddle} from './RiddleManager';
import {Service} from './Utils';

export interface SaveGame {
    finished: boolean;
    score?: number;
    code?: string;
}

type SaveGames = { [riddleId: string]: SaveGame };

const SAVE_GAME_KEY = 'evalQuiz.saveGames';
const LAST_PLAYED_RIDDLE_ID = 'evalQuiz.lastPlayedRiddleId';

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
    public loadSaveGames(): SaveGames {
        return this.storage.get(SAVE_GAME_KEY) as SaveGames || {};
    }

    /**
     * Stores the specified riddles to the local storage.
     * 
     * @param {Riddle[]} riddles the riddles to save
     * 
     * @memberOf StorageService
     */
    public storeSaveGames(...riddles: Riddle[]): void {
        let saveGames: SaveGames = this.loadSaveGames();

        riddles.forEach((riddle) => {
            let saveGame: SaveGame = {
                finished: riddle.finished,
                score: riddle.score
            };

            if (riddle.functionData && riddle.functionData.code) {
                saveGame.code = riddle.functionData.code;
            }

            saveGames[riddle.id] = saveGame;
        });

        this.storage.set(SAVE_GAME_KEY, saveGames);
    }

    /**
     * Save the id of the last started riddle so we can restart it when the page is opened again.
     * 
     * @param {string} riddleId the id of the riddle
     * 
     * @memberOf StorageService
     */
    public storeLastPlayedRiddleId(riddleId: string): void {
        this.storage.set(LAST_PLAYED_RIDDLE_ID, riddleId);
    }

    /**
     * Loads the id of the last started riddle.
     * 
     * @returns {string} the id of the riddle
     * 
     * @memberOf StorageService
     */
    public loadLastPlayedRiddleId(): string {
        return this.storage.get<string>(LAST_PLAYED_RIDDLE_ID) || 'intro';
    }

}
