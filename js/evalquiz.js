/**
 * Created by Daniel on 20.01.2015.
 */
///<reference path="./definitions/angularjs/angular.d.ts" />
///<reference path="./definitions/angularjs/angular-route.d.ts" />
///<reference path="./definitions/angular-material/angular-material.d.ts" />
///<reference path="./riddleManager.ts" />
var evalquiz;
(function (evalquiz) {
    var EvalQuizController = (function () {
        function EvalQuizController($mdDialog) {
            this.$mdDialog = $mdDialog;
        }
        EvalQuizController.prototype.showRiddles = function ($event) {
            this.$mdDialog.show({
                templateUrl: 'templates/riddles.html',
                targetEvent: $event,
                controller: 'ShowRiddlesController as ctrl'
            });
        };
        EvalQuizController.prototype.showCredits = function ($event) {
            this.$mdDialog.show({
                templateUrl: 'templates/credits.html',
                targetEvent: $event
            });
        };
        EvalQuizController.$inject = ['$mdDialog'];
        return EvalQuizController;
    })();
    var ShowRiddlesController = (function () {
        function ShowRiddlesController(riddleManager, $mdDialog) {
            this.riddleManager = riddleManager;
            this.loading = true;
            this.$mdDialog = $mdDialog;
            var ctrl = this;
            this.riddleManager.getRiddleData().then(function (riddles) {
                ctrl.riddles = riddles;
                ctrl.loading = false;
            });
        }
        ShowRiddlesController.prototype.closeDialog = function () {
            this.$mdDialog.hide();
        };
        ShowRiddlesController.$inject = ['riddleManager', '$mdDialog'];
        return ShowRiddlesController;
    })();
    var RiddleController = (function () {
        function RiddleController($routeParams, riddleManager) {
            this.riddleManager = riddleManager;
            var ctrl = this;
            this.loading = true;
            riddleManager.startRiddle(parseInt($routeParams['riddleId'])).then(function (riddle) {
                ctrl.riddle = riddle;
                ctrl.loading = false;
            });
        }
        RiddleController.prototype.solve = function ($event) {
            this.riddleManager.solveRiddle(this.riddle, this.code);
        };
        RiddleController.$inject = ['$routeParams', 'riddleManager'];
        return RiddleController;
    })();
    angular.module('evalquiz', ['ngRoute', 'ngMaterial', 'btford.markdown']).controller('EvalQuizController', EvalQuizController).controller('ShowRiddlesController', ShowRiddlesController).controller('RiddleController', RiddleController).run(['riddleManager', function (riddleManager) {
        riddleManager.setupRiddles();
    }]).config(['$mdThemingProvider', '$routeProvider', function ($mdThemingProvider, $routeProvider) {
        console.log('Hmmm... I dont\'t think you need the console right now ;)');
        $mdThemingProvider.theme('default').accentPalette('lime');
        $routeProvider.when('/riddles/:riddleId', {
            templateUrl: 'templates/riddle.html',
            controller: 'RiddleController',
            controllerAs: 'riddleCtrl'
        });
        $routeProvider.otherwise({
            redirectTo: '/riddles/0'
        });
    }]);
})(evalquiz || (evalquiz = {}));
