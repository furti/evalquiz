/// <reference path="./definitions/angularjs/angular.d.ts" />
/// <reference path="./asyncHelper.ts" />
var riddle;
(function (_riddle) {
    var RiddleManager = (function () {
        function RiddleManager($http, $q) {
            this.$http = $http;
            this.asyncHelper = new util.AsyncHelper(this, $q);
            this.$q = $q;
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
                //Wait until all data is available
                riddleManager.$q.all({
                    'description': descriptionPromise,
                    'functionData': functionPromise,
                    'functionDescription': functionDescriptionPromise
                }).then(function (data) {
                    riddle.description = data.description.data;
                    riddle.functionData = data.functionData.data;
                    riddle.functionDescription = data.functionDescription.data;
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
            riddle.functionData.code = 'function ' + riddle.functionData.name + '(';
            if (riddle.functionData.paramsString) {
                riddle.functionData.code += riddle.functionData.paramsString;
            }
            riddle.functionData.code += ') {\n\n}';
        };
        RiddleManager.prototype.prepareRiddles = function (riddles) {
            if (!riddles) {
                return;
            }
            riddles.forEach(function (riddle) {
                //The intro must be unlocked
                if (riddle.level === 0) {
                    riddle.unlocked = true;
                }
            });
            return riddles;
        };
        RiddleManager.prototype.solveRiddle = function (riddle) {
            var solution = new Function(riddle.functionData.paramsString, riddle.functionData.code);
            var riddleEngine = new Function();
            alert(solution(Math.random(), Math.random()));
        };
        RiddleManager.$inject = ['$http', '$q'];
        return RiddleManager;
    })();
    _riddle.RiddleManager = RiddleManager;
    angular.module('evalquiz').service('riddleManager', RiddleManager);
})(riddle || (riddle = {}));
