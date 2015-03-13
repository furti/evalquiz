/// <reference path="./definitions/angularjs/angular.d.ts" />
/// <reference path="./definitions/angularLocalStorage/angularLocalStorage.d.ts" />
/// <reference path="./definitions/esprima/esprima.d.ts" />
/// <reference path="./definitions/jquery/jquery.d.ts" />
/// <reference path="./asyncHelper.ts" />
var riddle;
(function (_riddle) {
    var SAVE_GAME_KEY = 'riddleQuiz.saveGames';
    var LAST_RIDDLE_KEY = 'riddleQuiz.lastPlayedRiddle';
    var Syntax = (function () {
        function Syntax(code) {
            this.syntax = esprima.parse(code);
        }
        Syntax.prototype.countTypes = function () {
            var types = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                types[_i - 0] = arguments[_i];
            }
            var count = 0;
            this.crawl(this.syntax, function (node) {
                if (types.indexOf(node.type) >= 0) {
                    count++;
                }
            });
            return count;
        };
        Syntax.prototype.countOperators = function () {
            var operators = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                operators[_i - 0] = arguments[_i];
            }
            var count = 0;
            this.crawl(this.syntax, function (node) {
                if ((node.type == 'BinaryExpression') || (node.type == 'UpdateExpression') || (node.type == 'AssignmentExpression')) {
                    if (operators.indexOf(node.operator) >= 0) {
                        count++;
                    }
                }
            });
            return count;
        };
        Syntax.prototype.crawl = function (node, callback) {
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
        };
        return Syntax;
    })();
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
                riddleManager.prepareRiddles(riddles);
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
            var riddle = this.initializeRiddle(riddleId);
            if (riddle) {
                //Save the last started riddle so we can restart it when the page is opened again
                this.storage.set(LAST_RIDDLE_KEY, riddleId);
            }
            return riddle;
        };
        RiddleManager.prototype.getRiddle = function (riddleId) {
            return this.asyncHelper.call(function (riddleManager) {
                if (!riddleManager.riddleMap || !riddleManager.riddleMap[riddleId]) {
                    return;
                }
                return riddleManager.riddleMap[riddleId];
            });
        };
        RiddleManager.prototype.initializeRiddle = function (riddleId) {
            var defered = this.$q.defer();
            var riddleManager = this;
            this.getRiddle(riddleId).then(function (riddle) {
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
            this.riddleMap = {};
            var riddleMap = this.riddleMap;
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
            var syntax = this.analyzeCode(riddle);
            var riddleEngine = this.buildEngine(riddle);
            riddleEngine.init();
            var score = riddleEngine.run(solve, syntax);
            var solved = score > 0;
            var result = {
                solved: solved,
                score: score,
                riddle: riddle
            };
            if (solved) {
                result.solvedMessage = riddleEngine.solvedMessage();
                riddle.finished = true;
                if (score >= riddle.score) {
                    riddle.score = score;
                }
                var next = this.nextRiddle(riddle);
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
        };
        RiddleManager.prototype.persist = function (riddles) {
            var saveGames = [], toSave = [];
            angular.forEach(riddles, function (riddle) {
                var saveGame = {
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
            var actualSavegames = this.storage.get(SAVE_GAME_KEY);
            angular.forEach(actualSavegames, function (saveGame) {
                //If the level is not into the riddles to save --> add the actual saved one
                if (toSave.indexOf(saveGame.level) === -1) {
                    saveGames.push(saveGame);
                }
            });
            this.storage.set(SAVE_GAME_KEY, saveGames);
        };
        RiddleManager.prototype.nextRiddle = function (riddle) {
            //Get the position of the actual riddle
            var pos = this.riddles.indexOf(riddle);
            //If more riddles are available --> return the next one.
            if (this.riddles.length > pos + 1) {
                return this.riddles[pos + 1];
            }
        };
        RiddleManager.prototype.parseCode = function (riddle) {
            var create = new Function('return ' + riddle.functionData.code);
            return create();
        };
        RiddleManager.prototype.analyzeCode = function (riddle) {
            var syntax = new Syntax(riddle.functionData.code);
            return syntax;
        };
        RiddleManager.prototype.buildEngine = function (riddle) {
            var factory = new Function('return ' + riddle.engine);
            return factory();
        };
        RiddleManager.prototype.lastPlayedRiddle = function () {
            var riddleManager = this;
            return this.asyncHelper.call(function (riddleManager) {
                var last = riddleManager.storage.get(LAST_RIDDLE_KEY);
                if (!last) {
                    return 0;
                }
                return last;
            });
        };
        RiddleManager.$inject = ['$http', '$q', 'storage'];
        return RiddleManager;
    })();
    _riddle.RiddleManager = RiddleManager;
    angular.module('evalquiz').service('riddleManager', RiddleManager);
})(riddle || (riddle = {}));
