/// <reference path="./definitions/angularjs/angular.d.ts" />
/// <reference path="./definitions/angularLocalStorage/angularLocalStorage.d.ts" />
/// <reference path="./asyncHelper.ts" />
module riddle {
    var SAVE_GAME_KEY = 'riddleQuiz.saveGames';

    export interface RiddleData {
        level: number;
        title: string;
        shortDescription: string;
        solvedMessage:string;
        unlocked: boolean;
        finished: boolean;
    }

    export interface Riddle extends RiddleData {
        description: string;
        functionDescription: string;
        functionData: FunctionData;
        engine:string;
    }

    export interface FunctionData {
        name?: string;
        paramsString?:string;
        code?:string;
        params?: Array<FunctionParam>;
    }

    export interface FunctionParam {
        name: string;
        type: string;
        description: string;
    }

    export interface Result {
        solved:boolean;
        nextLevel?:number;
        failedMessage?:string;
    }

    interface FullRiddle extends Riddle {
        location:string;
        initialized: boolean;
    }

    interface SaveGame {
        level:number;
        unlocked:boolean;
        finished:boolean;
        code?:string;
    }

    export class RiddleManager {
        private riddles:Array<FullRiddle>;
        private $http:ng.IHttpService;
        private $q:ng.IQService;
        private asyncHelper:util.AsyncHelper<RiddleManager>;
        private storage:ng.localStorage.ILocalStorageService;

        static $inject = ['$http', '$q', 'storage'];

        constructor($http:ng.IHttpService, $q:ng.IQService, storage:ng.localStorage.ILocalStorageService) {
            this.$http = $http;
            this.asyncHelper = new util.AsyncHelper(this, $q);
            this.$q = $q;
            this.storage = storage;
        }

        public setupRiddles():void {
            var riddleManager = this;

            this.$http.get('riddles/riddles.json')
                .success(function (riddles:Array<FullRiddle>) {
                    riddleManager.riddles = riddleManager.prepareRiddles(riddles);
                    riddleManager.asyncHelper.init();
                });
        }

        /**
         * Returns the name and id of all available riddles
         *
         * @returns {ng.IPromise<Array<riddle.FullRiddle>>}
         */
        public getRiddleData():ng.IPromise<Array<RiddleData>> {
            return this.asyncHelper.call(function (riddleManager) {
                return riddleManager.riddles;
            });
        }

        public startRiddle(riddleId:number):ng.IPromise<Riddle> {
            return this.initializeRiddle(riddleId);
        }

        private getRiddle(riddleId:number):ng.IPromise<Riddle> {
            return this.asyncHelper.call(function (riddleManager) {
                if (!riddleManager.riddles) {
                    return;
                }

                var riddle:FullRiddle;

                for (var index in riddleManager.riddles) {
                    riddle = riddleManager.riddles[index];

                    if (riddle.level === riddleId) {
                        return riddle;
                    }
                }
            });
        }

        private initializeRiddle(riddleId:number):ng.IPromise<FullRiddle> {
            var defered = this.$q.defer();
            var riddleManager = this;

            this.getRiddle(riddleId).then(function (riddle:FullRiddle) {
                if (!riddle || riddle.initialized || !riddle.unlocked) {
                    defered.resolve(riddle);
                    return;
                }

                //Load the description
                var descriptionPromise = riddleManager.$http.get('riddles/' + riddle.location + "/description.md");
                var functionPromise = riddleManager.$http.get('riddles/' + riddle.location + "/function.json");
                var functionDescriptionPromise = riddleManager.$http.get('riddles/' + riddle.location + "/functionDescription.md");
                var functionEnginePromise = riddleManager.$http.get('riddles/' + riddle.location + "/engine.js");

                //Wait until all data is available
                riddleManager.$q.all({
                    'description': descriptionPromise,
                    'functionData': functionPromise,
                    'functionDescription': functionDescriptionPromise,
                    'functionEngine': functionEnginePromise
                }).then(function (data:any) {
                    riddle.description = data.description.data;
                    riddle.functionDescription = data.functionDescription.data;
                    riddle.engine = data.functionEngine.data;

                    /*
                     * If the riddle was saved before the code is already set.
                     * so we only create the functionData if it is not there already
                     */
                    var functionData = data.functionData.data;
                    if (!riddle.functionData) {
                        riddle.functionData = {};
                    }

                    riddle.functionData.name = functionData.name;
                    riddle.functionData.params = functionData.params;

                    riddleManager.prepareCode(riddle);

                    riddle.initialized = true;
                    defered.resolve(riddle);
                });
            });

            return defered.promise;
        }

        private prepareCode(riddle:FullRiddle):void {
            if (riddle.functionData.params) {
                riddle.functionData.paramsString = '';

                riddle.functionData.params.forEach(function (param) {
                    if (riddle.functionData.paramsString.length >= 1) {
                        riddle.functionData.paramsString += ', ';
                    }

                    riddle.functionData.paramsString += param.name;
                });
            }

            if (!riddle.functionData.code) {
                riddle.functionData.code = 'function ' + riddle.functionData.name + '(';

                if (riddle.functionData.paramsString) {
                    riddle.functionData.code += riddle.functionData.paramsString;
                }

                riddle.functionData.code += ') {\n  "use strict";\n  \n}';
            }
        }

        private prepareRiddles(riddles:Array<FullRiddle>):Array<FullRiddle> {
            if (!riddles) {
                return;
            }

            var saveGames = this.loadGames(),
                saveGame:SaveGame;

            riddles.forEach(function (riddle) {
                //The intro must be unlocked
                if (riddle.level === 0) {
                    riddle.unlocked = true;
                }

                if (saveGames[riddle.level]) {
                    saveGame = saveGames[riddle.level];

                    riddle.unlocked = saveGame.unlocked;
                    riddle.finished = saveGame.finished;

                    if (saveGame.code) {
                        riddle.functionData = {
                            code: saveGame.code
                        };
                    }
                }
            });


            return riddles;
        }

        private loadGames():{[level:number]: SaveGame} {
            var saveGames:Array<SaveGame> = this.storage.get(SAVE_GAME_KEY);
            var prepared:{[level:number]: SaveGame} = {};

            angular.forEach(saveGames, function (save) {
                prepared[save.level] = save;
            });

            return prepared;
        }

        public solveRiddle(riddle:Riddle):Result {
            var solve = this.parseCode(riddle);
            var riddleEngine = this.buildEngine(riddle);

            riddleEngine.init();

            var solved = riddleEngine.run(solve);

            var result:Result = {
                solved: solved
            };

            if (solved) {
                riddle.finished = true;

                var next = this.unlockNextRiddle(riddle.level);

                if (next) {
                    result.nextLevel = next.level;

                    this.persist([riddle, next]);
                }
                else {
                    this.persist([riddle]);
                }
            }
            else {
                result.failedMessage = riddleEngine.failedMessage();
                this.persist([riddle]);
            }

            return result;
        }

        public persist(riddles:Array<Riddle>):void {
            var saveGames:Array<SaveGame> = [],
                toSave:Array<number> = [];

            angular.forEach(riddles, function (riddle) {
                var saveGame:SaveGame = {
                    level: riddle.level,
                    finished: riddle.finished,
                    unlocked: riddle.unlocked
                };

                if (riddle.functionData && riddle.functionData.code) {
                    saveGame.code = riddle.functionData.code;
                }

                saveGames.push(saveGame);
                toSave.push(riddle.level);
            });

            //Merge the actualSavegames into the new ones
            var actualSavegames:Array<SaveGame> = this.storage.get(SAVE_GAME_KEY);
            angular.forEach(actualSavegames, function (saveGame:SaveGame) {
                //If the level is not into the riddles to save --> add the actual saved one
                if (toSave.indexOf(saveGame.level) === -1) {
                    saveGames.push(saveGame);
                }
            });

            this.storage.set(SAVE_GAME_KEY, saveGames);
        }

        private unlockNextRiddle(level:number):FullRiddle {
            //If more riddles are available --> return the next one.
            if (this.riddles.length > level + 1) {
                var next = this.riddles[level + 1];

                next.unlocked = true;

                return next;
            }
        }

        private parseCode(riddle:Riddle):any {
            var create = new Function('return ' + riddle.functionData.code);

            return create();
        }

        private buildEngine(riddle:Riddle):any {
            var factory = new Function('return ' + riddle.engine);

            return factory();
        }

        public lastUnlockedRiddle():ng.IPromise<number> {
            return this.asyncHelper.call(function (riddleManager) {
                var index:any, last:FullRiddle;

                for (index in riddleManager.riddles) {
                    var riddle = riddleManager.riddles[index];

                    if (!riddle.unlocked) {
                        return last.level;
                    }
                    else {
                        last = riddle;
                    }
                }

                return last.level;
            });
        }
    }

    angular.module('evalquiz')
        .service('riddleManager', RiddleManager);
}