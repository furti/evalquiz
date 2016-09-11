/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import {Riddle} from './RiddleManager';
import {Service} from './Utils';

export interface SaveGame {
    level: number;
    finished: boolean;
    score?: number;
    code?: string;
}

const SAVE_GAME_KEY = 'riddleQuiz.saveGames';
const LAST_PLAYED_RIDDLE_KEY = 'riddleQuiz.lastPlayedRiddle';

@Service(module, 'storageService')
export class StorageService {
    static $inject = ['localStorageService'];

    constructor(private storage: angular.local.storage.ILocalStorageService) {
    }

    /**
     * Loads all save games from the local storage.
     * 
     * @private
     * @returns {{ [level: number]: SaveGame }} a map of SaveGames with the level as key
     * 
     * @memberOf RiddleManager
     */
    public loadSaveGames(): { [level: number]: SaveGame } {
        var saveGames: SaveGame[] = this.storage.get(SAVE_GAME_KEY) as SaveGame[];
        var prepared: { [level: number]: SaveGame } = {};

        if (saveGames) {
            saveGames.forEach((saveGame) => {
                prepared[saveGame.level] = saveGame;
            });
        }

        return prepared;
    }

    /**
     * Stores the specified riddles to the local storage.
     * 
     * @param {Riddle[]} riddles the riddles
     * 
     * @memberOf StorageService
     */
    public storeSaveGames(...riddles: Riddle[]): void {
        var saveGames: SaveGame[] = [],
            toSave: number[] = [];

        riddles.forEach((riddle) => {
            var saveGame: SaveGame = {
                level: riddle.level,
                finished: riddle.finished,
                score: riddle.score
            };

            if (riddle.functionData && riddle.functionData.code) {
                saveGame.code = riddle.functionData.code;
            }

            saveGames.push(saveGame);
            toSave.push(riddle.level);
        });

        //Merge the actualSavegames into the new ones
        var actualSaveGames: SaveGame[] = this.storage.get(SAVE_GAME_KEY) as SaveGame[];

        if (actualSaveGames) {
            actualSaveGames.forEach((saveGame: SaveGame) => {
                //If the level is not into the riddles to save --> add the actual saved one
                if (toSave.indexOf(saveGame.level) === -1) {
                    saveGames.push(saveGame);
                }
            });
        }

        this.storage.set(SAVE_GAME_KEY, saveGames);
    }

    /**
     * Save the last started riddle so we can restart it when the page is opened again
     * 
     * @param {number} level the level
     * 
     * @memberOf StorageService
     */
    public storeLastPlayedRiddle(level: number): void {
        this.storage.set(LAST_PLAYED_RIDDLE_KEY, level);
    }

    /**
     * Loads the last started riddle
     * 
     * @returns {number} the level
     * 
     * @memberOf StorageService
     */
    public loadLastPlayedRiddle(): number {
        return this.storage.get<number>(LAST_PLAYED_RIDDLE_KEY) || 0;
    }

}
