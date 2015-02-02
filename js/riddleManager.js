/// <reference path="./definitions/angularjs/angular.d.ts" />
/// <reference path="./definitions/angularLocalStorage/angularLocalStorage.d.ts" />
/// <reference path="./asyncHelper.ts" />
var riddle;
(function (_riddle) {
    var SAVE_GAME_KEY = 'riddleQuiz.saveGames';
    var RiddleManager = (function () {
        function RiddleManager($http, $q, storage) {
            this.$http = $http;
            this.asyncHelper = new util.AsyncHelper(this, $q);
            this.$q = $q;
            this.storage = storage;
        }
        RiddleManager.prototype.setupRiddles = function () {
            var riddleManager = this;
            this.$http.get('riddles/riddles.json').success(function (riddles) {
                riddleManager.riddles = riddleManager.prepareRiddles(riddles);
                riddleManager.asyncHelper.init();
            });
        };
        /**
         * Returns the name and id of all available riddles
         *
         * @returns {ng.IPromise<Array<riddle.FullRiddle>>}
         */
        RiddleManager.prototype.getRiddleData = function () {
            return this.asyncHelper.call(function (riddleManager) {
                return riddleManager.riddles;
            });
        };
        RiddleManager.prototype.startRiddle = function (riddleId) {
            return this.initializeRiddle(riddleId);
        };
        RiddleManager.prototype.getRiddle = function (riddleId) {
            return this.asyncHelper.call(function (riddleManager) {
                if (!riddleManager.riddles) {
                    return;
                }
                var riddle;
                for (var index in riddleManager.riddles) {
                    riddle = riddleManager.riddles[index];
                    if (riddle.level === riddleId) {
                        return riddle;
                    }
                }
            });
        };
        RiddleManager.prototype.initializeRiddle = function (riddleId) {
            var defered = this.$q.defer();
            var riddleManager = this;
            this.getRiddle(riddleId).then(function (riddle) {
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
                }).then(function (data) {
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
        };
        RiddleManager.prototype.prepareCode = function (riddle) {
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
        };
        RiddleManager.prototype.prepareRiddles = function (riddles) {
            if (!riddles) {
                return;
            }
            var saveGames = this.loadGames(), saveGame;
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
        };
        RiddleManager.prototype.loadGames = function () {
            var saveGames = this.storage.get(SAVE_GAME_KEY);
            var prepared = {};
            angular.forEach(saveGames, function (save) {
                prepared[save.level] = save;
            });
            return prepared;
        };
        RiddleManager.prototype.solveRiddle = function (riddle) {
            var solve = this.parseCode(riddle);
            var riddleEngine = this.buildEngine(riddle);
            var solved = riddleEngine.run(solve);
            var result = {
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
            return result;
        };
        RiddleManager.prototype.persist = function (riddles) {
            var saveGames = [];
            angular.forEach(riddles, function (riddle) {
                var saveGame = {
                    level: riddle.level,
                    finished: riddle.finished,
                    unlocked: riddle.unlocked
                };
                if (riddle.functionData && riddle.functionData.code) {
                    saveGame.code = riddle.functionData.code;
                }
                saveGames.push(saveGame);
            });
            this.storage.set(SAVE_GAME_KEY, saveGames);
        };
        RiddleManager.prototype.unlockNextRiddle = function (level) {
            //If more riddles are available --> return the next one.
            if (this.riddles.length > level + 1) {
                var next = this.riddles[level + 1];
                next.unlocked = true;
                return next;
            }
        };
        RiddleManager.prototype.parseCode = function (riddle) {
            var create = new Function('return ' + riddle.functionData.code);
            return create();
        };
        RiddleManager.prototype.buildEngine = function (riddle) {
            var factory = new Function('return ' + riddle.engine);
            return factory();
        };
        RiddleManager.$inject = ['$http', '$q', 'storage'];
        return RiddleManager;
    })();
    _riddle.RiddleManager = RiddleManager;
    angular.module('evalquiz').service('riddleManager', RiddleManager);
})(riddle || (riddle = {}));
