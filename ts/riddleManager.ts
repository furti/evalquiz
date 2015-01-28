/// <reference path="./definitions/angularjs/angular.d.ts" />
/// <reference path="./asyncHelper.ts" />
module riddle {
    export interface RiddleData {
        level: number;
        title: string;
        shortDescription: string;
        unlocked: boolean;
        finished: boolean;
    }

    export interface Riddle extends RiddleData {
        description: string;
        functionDescription: string;
        functionData: FunctionData;
    }

    export interface FunctionData {
        name: string;
        paramsString:string;
        code:string;
        params: Array<FunctionParam>;
    }

    export interface FunctionParam {
        name: string;
        type: string;
        description: string;
    }

    interface FullRiddle extends Riddle {
        location:string;
        initialized: boolean;
    }

    export class RiddleManager {
        private riddles:Array<FullRiddle>;
        private $http:ng.IHttpService;
        private $q:ng.IQService;
        private asyncHelper:util.AsyncHelper<RiddleManager>;

        static $inject = ['$http', '$q'];

        constructor($http:ng.IHttpService, $q:ng.IQService) {
            this.$http = $http;
            this.asyncHelper = new util.AsyncHelper(this, $q);
            this.$q = $q;
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

                //Wait until all data is available
                riddleManager.$q.all({
                    'description': descriptionPromise,
                    'functionData': functionPromise,
                    'functionDescription': functionDescriptionPromise
                }).then(function (data:any) {
                    riddle.description = data.description.data;
                    riddle.functionData = data.functionData.data;
                    riddle.functionDescription = data.functionDescription.data;

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

            riddle.functionData.code = 'function ' + riddle.functionData.name + '(';

            if (riddle.functionData.paramsString) {
                riddle.functionData.code += riddle.functionData.paramsString;
            }

            riddle.functionData.code += ') {\n\n}';
        }

        private prepareRiddles(riddles:Array<FullRiddle>):Array<FullRiddle> {
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
        }

        public solveRiddle(riddle:Riddle):void {
            var solution = this.parseSolution(riddle);
            var riddleEngine = new Function();

            alert(solution(Math.random(), Math.random()));
        }

        private parseSolution(riddle:Riddle):any {
            var create = new Function(riddle.functionData.paramsString, 'return ' + riddle.functionData.code);

            return create();
        }
    }

    angular.module('evalquiz')
        .service('riddleManager', RiddleManager);
}