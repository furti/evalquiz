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
            //After the value of the editor is set we mark the first and last line as readonly
            var cmChange = function (editor, change) {
                if (change.origin === 'setValue') {
                    editor.markText({ line: 0, ch: 0 }, { line: 1 }, { readOnly: true });
                    editor.markText({ line: editor.lastLine(), ch: 0 }, {
                        line: editor.lastLine(),
                        ch: 2
                    }, { readOnly: true });
                    //Remove the change listener as we do not need it anymore
                    editor.off('change', cmChange);
                }
            };
            this.editorOptions = {
                lineNumbers: true,
                mode: 'javascript',
                gutters: ["CodeMirror-lint-markers"],
                lint: true,
                onLoad: function (cm) {
                    cm.on('change', cmChange);
                    //TOOD: A litte bit hacky. Find a better way to set the height
                    cm.getWrapperElement().style.height = (cm.getWrapperElement().parentNode.clientHeight - 20) + 'px';
                }
            };
            riddleManager.startRiddle(parseInt($routeParams['riddleId'])).then(function (riddle) {
                ctrl.riddle = riddle;
                ctrl.loading = false;
            });
        }
        RiddleController.prototype.solve = function ($event) {
            try {
                this.riddleManager.solveRiddle(this.riddle);
            }
            catch (e) {
                console.log(e);
            }
        };
        RiddleController.$inject = ['$routeParams', 'riddleManager'];
        return RiddleController;
    })();
    angular.module('evalquiz', ['ngRoute', 'ngMaterial', 'btford.markdown', 'ui.codemirror']).controller('EvalQuizController', EvalQuizController).controller('ShowRiddlesController', ShowRiddlesController).controller('RiddleController', RiddleController).run(['riddleManager', function (riddleManager) {
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
