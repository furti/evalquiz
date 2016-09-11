/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import * as Async from './Async';
import {Program} from './Program';
import {SaveGame, StorageService} from './StorageService';
import UIService from './UIService';
import {Service} from './Utils';

var SAVE_GAME_KEY = 'riddleQuiz.saveGames';
var LAST_RIDDLE_KEY = 'riddleQuiz.lastPlayedRiddle';

export interface RiddleData {
    level: number;
    title: string;
    shortDescription: string;
    goals: Array<String>;
    minScoreToSolve: number;
    finished: boolean;
    score: number;
}

export interface Riddle extends RiddleData {
    description: string;
    functionDescription: string;
    functionData: FunctionData;
    engine: string;
}

interface FullRiddle extends Riddle {
    location: string;
    initialized: boolean;
}

export interface FunctionData {
    name?: string;
    paramsString?: string;
    code?: string;
    params?: FunctionParam[];
}

export interface FunctionParam {
    name: string;
    type: string;
    description: string;
}

export interface Result {
    solved: boolean;
    score: number;
    riddle: Riddle;
    nextLevel?: number;
    solvedMessage?: string;
    failedMessage?: string;
}

@Service(module, 'riddleManager')
export class RiddleManager {
    public initialized: boolean = false;

    protected riddles: FullRiddle[];
    protected riddleMap: { [level: number]: FullRiddle };
    protected asyncHelper: Async.Helper<RiddleManager>;

    static $inject = ['$http', '$q', 'storageService', 'uiService'];

    constructor(protected $http: ng.IHttpService, protected $q: ng.IQService, protected storageService: StorageService, protected uiService: UIService) {
        this.asyncHelper = new Async.Helper(this, $q);
    }

    /**
     * Loads the index of the riddles from the the riddle.json file.
     * 
     * @memberOf RiddleManager
     */
    public setupRiddles(): angular.IPromise<any> {
        let deferred = this.$q.defer();

        this.initialized = false;

        this.uiService.alert('Loading', 'Doing the load now').then(() => {
            this.$http.get('riddles/riddles.json').then(response => {
                let riddles: FullRiddle[] = response.data as FullRiddle[];

                this.prepareRiddles(riddles);
                this.asyncHelper.init();

                deferred.resolve();
            }, (error: any) => {
                this.uiService.alert('Loading Riddles', 'Unfortunately, the index file of the riddles could not be loaded. This is a show stopper. Sorry.');

                deferred.reject();
            });
        })

        return deferred.promise;
    }

    /**
     * Load the saved games and add the data to the riddle index. Additionally it initilized the local riddle map
     * that holds all the riddles with the level as key.
     * 
     * @private
     * @param {FullRiddle[]} riddles the riddle index
     * @returns {void}
     * 
     * @memberOf RiddleManager
     */
    private prepareRiddles(riddles: FullRiddle[]): void {
        if (!riddles) {
            return;
        }

        let saveGames = this.storageService.loadSaveGames();
        let saveGame: SaveGame;

        this.riddleMap = {};

        riddles.forEach((riddle) => {
            if (saveGames[riddle.level]) {
                saveGame = saveGames[riddle.level];

                riddle.finished = saveGame.finished;
                riddle.score = saveGame.score;

                if (saveGame.code) {
                    riddle.functionData = {
                        code: saveGame.code
                    };
                }
            }

            riddle.score = riddle.score || (riddle.finished ? 1 : 0);
            this.riddleMap[riddle.level] = riddle;
        });

        this.riddles = riddles;
        this.initialized = true;
    }

    /**
     * Returns the name and id of all available riddles
     *
     * @returns {ng.IPromise<Array<riddle.FullRiddle>>}
     */
    public getRiddleData(): ng.IPromise<RiddleData[]> {
        return this.asyncHelper.call(function (riddleManager) {
            return riddleManager.riddles;
        });
    }

    public startRiddle(level: number): angular.IPromise<Riddle> {
        var riddle = this.initializeRiddle(level);

        if (riddle) {
            this.storageService.storeLastPlayedRiddle(level);
        }

        return riddle;
    }

    private getRiddle(riddleId: number): ng.IPromise<Riddle> {
        return this.asyncHelper.call(function (riddleManager) {
            if (!riddleManager.riddleMap || !riddleManager.riddleMap[riddleId]) {
                return;
            }

            return riddleManager.riddleMap[riddleId];
        });
    }

    /**
     * Loads the riddle data from the site. Initialized all the necessary information for playing this level.
     * 
     * @private
     * @param {number} level the level
     * @returns {angular.IPromise<FullRiddle>} a promise delivering the riddle
     * 
     * @memberOf RiddleManager
     */
    private initializeRiddle(level: number): angular.IPromise<FullRiddle> {
        var defered = this.$q.defer();

        this.getRiddle(level).then((riddle: FullRiddle) => {
            if (!riddle || riddle.initialized) {
                defered.resolve(riddle);
                return;
            }

            //Load the description
            let descriptionPromise = this.$http.get('riddles/' + riddle.location + '/description.md');
            let functionPromise = this.$http.get('riddles/' + riddle.location + '/function.json');
            let functionDescriptionPromise = this.$http.get('riddles/' + riddle.location + '/functionDescription.md');
            let functionEnginePromise = this.$http.get('riddles/' + riddle.location + '/engine.js');

            //Wait until all data is available
            this.$q.all({
                'description': descriptionPromise,
                'functionData': functionPromise,
                'functionDescription': functionDescriptionPromise,
                'functionEngine': functionEnginePromise
            }).then((data: any) => {
                riddle.description = data.description.data;
                riddle.functionDescription = data.functionDescription.data;
                riddle.engine = data.functionEngine.data;

                /*
                 * If the riddle was saved before the code is already set.
                 * so we only create the functionData if it is not there already
                 */
                let functionData = data.functionData.data;

                if (!riddle.functionData) {
                    riddle.functionData = {};
                }

                riddle.functionData.name = functionData.name;
                riddle.functionData.params = functionData.params;

                this.prepareCode(riddle);

                riddle.initialized = true;
                defered.resolve(riddle);
            });
        });

        return defered.promise;
    }

    /**
     * Prepares the code of the riddle by settings the function header and the curly braces.
     * 
     * @param {Riddle} riddle the riddle
     * 
     * @memberOf RiddleManager
     */
    public prepareCode(riddle: Riddle): void {
        if (riddle.functionData.params) {
            riddle.functionData.paramsString = riddle.functionData.params.map(param => param.name).join(', ');
        }

        if (!riddle.functionData.code) {
            riddle.functionData.code = 'function ' + riddle.functionData.name + '(';

            if (riddle.functionData.paramsString) {
                riddle.functionData.code += riddle.functionData.paramsString;
            }

            riddle.functionData.code += ') {\n  "use strict";\n  \n}';
        }
    }

    public saveRiddle(riddle: Riddle): void {
        this.storageService.storeSaveGames(riddle);
    }

    public solveRiddle(riddle: Riddle): Result {
        var solve = this.parseCode(riddle);
        var syntax = this.analyzeCode(riddle);
        var riddleEngine = this.buildEngine(riddle);

        riddleEngine.init();

        var score = riddleEngine.run(solve, syntax);
        var solved = score > 0;

        var result: Result = {
            solved: solved,
            score: score,
            riddle: riddle
        };

        if (solved) {
            result.solvedMessage = riddleEngine.solvedMessage(result.score);
            riddle.finished = true;

            if (score >= riddle.score) {
                riddle.score = score;
            }

            var next = this.nextRiddle(<FullRiddle>riddle);

            if (next) {
                result.nextLevel = next.level;

                this.storageService.storeSaveGames(riddle, next);
            }
            else {
                this.storageService.storeSaveGames(riddle);
            }
        }
        else {
            result.failedMessage = riddleEngine.failedMessage();

            this.storageService.storeSaveGames(riddle);
        }

        return result;
    }

    private nextRiddle(riddle: FullRiddle): FullRiddle {
        //Get the position of the actual riddle
        var pos = this.riddles.indexOf(riddle);

        //If more riddles are available --> return the next one.
        if (this.riddles.length > pos + 1) {
            return this.riddles[pos + 1];
        }
    }

    private parseCode(riddle: Riddle): any {
        var create = new Function('return ' + riddle.functionData.code.trim());

        return create();
    }

    private analyzeCode(riddle: Riddle): Program {
        var syntax = new Program(riddle.functionData.code);

        return syntax;
    }

    private buildEngine(riddle: Riddle): any {
        var factory = new Function('return ' + riddle.engine);

        return factory();
    }

}


