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
        public loading:boolean;
        public editorOptions:any;

        private riddleManager:riddle.RiddleManager;
        private $mdDialog:ng.material.ModalService;
        private $location:ng.ILocationService;

        static $inject = ['$routeParams', 'riddleManager', '$mdDialog', '$location'];

        constructor($routeParams:ng.route.IRouteParamsService, riddleManager:riddle.RiddleManager,
                    $mdDialog:ng.material.ModalService, $location:ng.ILocationService) {
            this.riddleManager = riddleManager;
            this.$mdDialog = $mdDialog;
            this.$location = $location;

            var ctrl = this;

            this.loading = true;

            //After the value of the editor is set we mark the first and last line as readonly
            var cmChange = function (editor:any, change:any) {
                if (change.origin === 'setValue') {
                    editor.markText({line: 0, ch: 0}, {line: 1}, {readOnly: true});
                    editor.markText({line: editor.lastLine(), ch: 0}, {
                        line: editor.lastLine(),
                        ch: 2
                    }, {readOnly: true});

                    //Remove the change listener as we do not need it anymore
                    editor.off('change', cmChange);
                }
            };

            this.editorOptions = {
                lineNumbers: true,
                mode: 'javascript',
                gutters: ["CodeMirror-lint-markers"],
                lint: true,
                onLoad: function (cm:any) {
                    cm.on('change', cmChange);

                    window.setTimeout(function () {
                        //TOOD: A litte bit hacky. Find a better way to set the height
                        cm.getWrapperElement().style.height = (cm.getWrapperElement().parentNode.clientHeight - 20) + 'px';
                    }, 10);
                }
            };

            riddleManager.startRiddle(parseInt($routeParams['riddleId'])).then(function (riddle) {
                ctrl.riddle = riddle;
                ctrl.loading = false;
            });
        }

        public save($event:any):void {
            this.riddleManager.persist([this.riddle]);

            this.$mdDialog.show(
                this.$mdDialog.alert()
                    .title('Saved')
                    .content('The code was saved')
                    .ok('OK'));
        }

        public solve($event:any):void {
            try {
                var result = this.riddleManager.solveRiddle(this.riddle),
                    ctrl = this;

                if (result.solved) {
                    var dialog:any;

                    if (result.nextLevel) {
                        dialog = this.$mdDialog.confirm()
                            .title('Congratulations')
                            .content(this.riddle.solvedMessage)
                            .ok('Next riddle')
                            .cancel('Enough for now');
                    }
                    else {
                        dialog = this.$mdDialog.alert()
                            .title('Congratulations')
                            .content(this.riddle.solvedMessage + ' You solved the last level. Come back later to check if more levels are available.')
                            .ok('It\'s done');
                    }

                    this.$mdDialog.show(dialog).then(function () {
                        if (result.nextLevel) {
                            //Redirect to the next riddle
                            ctrl.$location.path('/riddles/' + result.nextLevel);
                        }
                    });
                }
                else {
                    this.$mdDialog.show(
                        this.$mdDialog.alert()
                            .title('Evaluation failed')
                            .content('Hmmm... something seems to be wrong. Change some code and try it again. ' + result.failedMessage)
                            .ok('Got it'));
                }
            }
            catch (e) {
                this.$mdDialog.show(
                    this.$mdDialog.alert()
                        .title('Ooops! Something went wrong')
                        .content(e.message || e)
                        .ok('Got it'));

            }
        }
    }

    angular.module('evalquiz', ['ngRoute', 'ngMaterial', 'btford.markdown', 'ui.codemirror', 'angularLocalStorage'])
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
        }])
        .run(['$location', 'riddleManager', function ($location:ng.ILocationService, riddleManager:riddle.RiddleManager) {
            riddleManager.lastUnlockedRiddle().then(function (level) {
                $location.path('/riddles/' + level);
            });
        }]);
}