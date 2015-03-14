/// <reference path="./definitions/angularjs/angular.d.ts" />
/// <reference path="./definitions/angularLocalStorage/angularLocalStorage.d.ts" />
/// <reference path="./definitions/esprima/esprima.d.ts" />
/// <reference path="./definitions/jquery/jquery.d.ts" />
/// <reference path="./asyncHelper.ts" />
module riddle {
    var SAVE_GAME_KEY = 'riddleQuiz.saveGames';
    var LAST_RIDDLE_KEY = 'riddleQuiz.lastPlayedRiddle';

    export interface RiddleData {
        level: number;
        title: string;
        shortDescription: string;
        goals: Array<String>;
        solvedMessage:string;
        finished: boolean;
        score: number;
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
        solved: boolean;
        score: number;
        riddle: Riddle;
        nextLevel?: number;
        solvedMessage?: string;
        failedMessage?: string;
    }

    interface FullRiddle extends Riddle {
        location:string;
        initialized: boolean;
    }

    interface SaveGame {
        level:number;
        finished:boolean;
        score?:number;
        code?:string;
    }

    class Syntax {
        // for tests see: http://esprima.org/demo/parse.html

        private syntax: any;

        constructor(code: string) {
               this.syntax = esprima.parse(code);
        }

        public countTypes(...types: string[]): number {
            var count = 0;

            this.crawl(this.syntax, function(node: any) {
                if (types.indexOf(node.type) >= 0) {
                    count++;
                }
            });

            return count;
        }

        public countLoops(): number {
            return this.countTypes('ForStatement', 'WhileStatement', 'DoWhileStatement');
        }

        public countConditions(): number {
            return this.countTypes('IfStatement', 'SwitchStatement', 'ConditionalExpression');
        }

        public countCalculations(): number {
            return this.countTypes('BinaryExpression', 'AssignmentExpression');
        }

        public countLogicals(): number {
            return this.countTypes('LogicalExpression');
        }

        public countOperators(...operators: string[]): number {
            var count = 0;

            this.crawl(this.syntax, function(node: any) {
                if ((node.type == 'BinaryExpression') || (node.type == 'UpdateExpression') || (node.type == 'AssignmentExpression')) {
                    if (operators.indexOf(node.operator) >= 0) {
                       count++; 
                    }
                }
            });

            return count;
        }

        private crawl(node: any, callback: any): void {
            if (node instanceof Array) {
                for (var i = 0; i < node.length; i++) {
                    this.crawl(node[i], callback);
                }
            }
            else {
                callback(node);

                if (node.body) {
                    this.crawl(node.body, callback);
                }
                
                if (node.test) {
                    this.crawl(node.test, callback);
                }
                
                if (node.left) {
                    this.crawl(node.left, callback);
                }
                
                if (node.right) {
                    this.crawl(node.right, callback);
                }
                
                if (node.consequent) {
                    this.crawl(node.consequent, callback);
                }
                
                if (node.expression) {
                    this.crawl(node.expression, callback);
                }
                
                if (node.argument) {
                    this.crawl(node.argument, callback);
                }
                
                if (node.arguments) {
                    this.crawl(node.arguments, callback);
                }
                
                if (node.declaration) {
                    this.crawl(node.declaration, callback);
                }
            }
        }
    }
    
    export class RiddleManager {
        private riddles:Array<FullRiddle>;
        private riddleMap:{[key: number] : FullRiddle};
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
                    riddleManager.prepareRiddles(riddles);
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
            var riddle = this.initializeRiddle(riddleId);

            if (riddle) {
                //Save the last started riddle so we can restart it when the page is opened again
                this.storage.set(LAST_RIDDLE_KEY, riddleId);
            }

            return riddle;
        }

        private getRiddle(riddleId:number):ng.IPromise<Riddle> {
            return this.asyncHelper.call(function (riddleManager) {
                if (!riddleManager.riddleMap || !riddleManager.riddleMap[riddleId]) {
                    return;
                }

                return riddleManager.riddleMap[riddleId];
            });
        }

        private initializeRiddle(riddleId:number):ng.IPromise<FullRiddle> {
            var defered = this.$q.defer();
            var riddleManager = this;

            this.getRiddle(riddleId).then(function (riddle:FullRiddle) {
                if (!riddle || riddle.initialized) {
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

        public prepareCode(riddle:Riddle):void {
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

        private prepareRiddles(riddles:Array<FullRiddle>):void {
            if (!riddles) {
                return;
            }

            var saveGames = this.loadGames(),
                saveGame:SaveGame;
            this.riddleMap = {};
            var riddleMap  = this.riddleMap;

            riddles.forEach(function (riddle) {
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

                riddleMap[riddle.level] = riddle;
            });

            this.riddles = riddles;
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
            var syntax = this.analyzeCode(riddle);
            var riddleEngine = this.buildEngine(riddle);

            riddleEngine.init();

            var score = riddleEngine.run(solve, syntax);
            var solved = score > 0;

            var result:Result = {
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
                    score: riddle.score
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

        private nextRiddle(riddle:FullRiddle):FullRiddle {
            //Get the position of the actual riddle
            var pos = this.riddles.indexOf(riddle);

            //If more riddles are available --> return the next one.
            if (this.riddles.length > pos + 1) {
                return this.riddles[pos + 1];
            }
        }

        private parseCode(riddle:Riddle):any {
            var create = new Function('return ' + riddle.functionData.code.trim());

            return create();
        }

        private analyzeCode(riddle:Riddle):Syntax {
            var syntax = new Syntax(riddle.functionData.code);

            return syntax;
        }

        private buildEngine(riddle:Riddle):any {
            var factory = new Function('return ' + riddle.engine);

            return factory();
        }

        public lastPlayedRiddle():ng.IPromise<number> {
            var riddleManager = this;

            return this.asyncHelper.call(function (riddleManager) {
                var last = riddleManager.storage.get(LAST_RIDDLE_KEY);

                if (!last) {
                    return 0;
                }

                return last;
            });
        }
    }

    angular.module('evalquiz')
        .service('riddleManager', RiddleManager);
}