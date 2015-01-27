/**
 * Created by Daniel on 20.01.2015.
 */
///<reference path="./definitions/angularjs/angular.d.ts" />
    ///<reference path="./definitions/angularjs/angular-route.d.ts" />
///<reference path="./definitions/angular-material/angular-material.d.ts" />
///<reference path="./riddleManager.ts" />

module evalquiz {

    class EvalQuizController {
        private $mdDialog:ng.material.ModalService;
        static $inject = ['$mdDialog'];

        constructor($mdDialog:ng.material.ModalService) {
            this.$mdDialog = $mdDialog;
        }

        public showRiddles($event:any):void {
            this.$mdDialog.show({
                templateUrl: 'templates/riddles.html',
                targetEvent: $event,
                controller: 'ShowRiddlesController as ctrl'
            });
        }

        public showCredits($event:any):void {
            this.$mdDialog.show({
                templateUrl: 'templates/credits.html',
                targetEvent: $event
            });
        }
    }

    class ShowRiddlesController {
        private riddleManager:riddle.RiddleManager;
        private $mdDialog:ng.material.ModalService;
        public riddles:Array<riddle.RiddleData>;
        public loading:boolean;

        static $inject = ['riddleManager', '$mdDialog'];

        constructor(riddleManager:riddle.RiddleManager, $mdDialog:ng.material.ModalService) {
            this.riddleManager = riddleManager;
            this.loading = true;
            this.$mdDialog = $mdDialog;

            var ctrl = this;

            this.riddleManager.getRiddleData().then(function (riddles) {
                ctrl.riddles = riddles;
                ctrl.loading = false;
            });
        }

        public closeDialog():void {
            this.$mdDialog.hide();
        }
    }

    class RiddleController {
        public riddle:riddle.Riddle;
        public paramsString:string;
        public code:string;
        public loading:boolean;

        private riddleManager:riddle.RiddleManager;

        static $inject = ['$routeParams', 'riddleManager'];

        constructor($routeParams:ng.route.IRouteParamsService, riddleManager:riddle.RiddleManager) {
            this.riddleManager = riddleManager;

            var ctrl = this;

            this.loading = true;

            riddleManager.startRiddle(parseInt($routeParams['riddleId'])).then(function (riddle) {
                ctrl.riddle = riddle;
                ctrl.loading = false;
            });
        }

        public solve($event:any):void {
            this.riddleManager.solveRiddle(this.riddle, this.code);
        }
    }

    angular.module('evalquiz', ['ngRoute', 'ngMaterial', 'btford.markdown'])
        .controller('EvalQuizController', EvalQuizController)
        .controller('ShowRiddlesController', ShowRiddlesController)
        .controller('RiddleController', RiddleController)
        .run(['riddleManager', function (riddleManager:riddle.RiddleManager) {
            riddleManager.setupRiddles();
        }])
        .config(['$mdThemingProvider', '$routeProvider', function ($mdThemingProvider:ng.material.ThemingProvider,
                                                                   $routeProvider:ng.route.IRouteProvider) {
            console.log('Hmmm... I dont\'t think you need the console right now ;)');

            $mdThemingProvider.theme('default')
                .accentPalette('lime');

            $routeProvider.when('/riddles/:riddleId', {
                templateUrl: 'templates/riddle.html',
                controller: 'RiddleController',
                controllerAs: 'riddleCtrl'
            });

            $routeProvider.otherwise({
                redirectTo: '/riddles/0'
            });
        }]);
}