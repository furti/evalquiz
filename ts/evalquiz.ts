/**
 * Created by Daniel on 20.01.2015.
 */

/// <reference path="./index.d.ts" />

import {RiddleManager, RiddleData, Riddle, Result} from "./riddleManager";

class EvalQuizController {
    private $mdDialog: ng.material.IDialogService;
    static $inject = ['$mdDialog'];

    constructor($mdDialog: ng.material.IDialogService) {
        this.$mdDialog = $mdDialog;
    }

    public showRiddles($event: any): void {
        this.$mdDialog.show({
            templateUrl: 'templates/riddles.html',
            targetEvent: $event,
            controller: 'ShowRiddlesController as ctrl'
        });
    }

    public showCredits($event: any): void {
        this.$mdDialog.show({
            templateUrl: 'templates/credits.html',
            targetEvent: $event,
            controller: 'CreditsController as ctrl'
        });
    }
}

class ShowRiddlesController {
    private riddleManager: RiddleManager;
    private $mdDialog: ng.material.IDialogService;
    public riddles: Array<RiddleData>;
    public loading: boolean;

    static $inject = ['riddleManager', '$mdDialog'];

    constructor(riddleManager: RiddleManager, $mdDialog: ng.material.IDialogService) {
        this.riddleManager = riddleManager;
        this.loading = true;
        this.$mdDialog = $mdDialog;

        var ctrl = this;

        this.riddleManager.getRiddleData().then(function (riddles) {
            ctrl.riddles = riddles;
            ctrl.loading = false;
        });
    }

    public closeDialog(): void {
        this.$mdDialog.hide();
    }
}

class CreditsController {
    private $mdDialog: ng.material.IDialogService;

    static $inject = ['$mdDialog'];

    constructor($mdDialog: ng.material.IDialogService) {
        this.$mdDialog = $mdDialog;

        var ctrl = this;
    }

    public closeDialog(): void {
        this.$mdDialog.hide();
    }
}

class RiddleController {
    public riddle: Riddle;
    public loading: boolean;
    public editorOptions: any;

    private riddleManager: RiddleManager;
    private $mdDialog: ng.material.IDialogService;
    private $location: ng.ILocationService;

    static $inject = ['$routeParams', 'riddleManager', '$mdDialog', '$location'];

    constructor($routeParams: ng.route.IRouteParamsService, riddleManager: RiddleManager,
        $mdDialog: ng.material.IDialogService, $location: ng.ILocationService) {
        this.riddleManager = riddleManager;
        this.$mdDialog = $mdDialog;
        this.$location = $location;

        var ctrl = this;

        this.loading = true;

        //After the value of the editor is set we mark the first and last line as readonly
        var cmChange = function (editor: any, change: any) {
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
            onLoad: function (cm: any) {
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

    public trash($event: any): void {
        var self = this;

        this.$mdDialog.show(
            this.$mdDialog.confirm()
                .title('Trash')
                .textContent("Are you sure that you want to clear and reset the editor?")
                .ok('Yes')
                .cancel('No')
        ).then(function () {
            self.riddle.functionData.code = '';
            self.riddleManager.prepareCode(self.riddle);
        }
            );
    }

    public save($event: any): void {
        this.riddleManager.persist([this.riddle]);

        this.$mdDialog.show(
            this.$mdDialog.alert()
                .title('Saved')
                .textContent('The code was saved')
                .ok('OK'));
    }

    public solve($event: any): void {
        try {
            var result = this.riddleManager.solveRiddle(this.riddle),
                ctrl = this;

            if (result.solved) {
                this.$mdDialog.show({
                    templateUrl: 'templates/solved.html',
                    targetEvent: $event,
                    controller: 'SolvedController as ctrl',
                    locals: {
                        result: result
                    }
                });

                /*
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
                */
            }
            else {
                this.$mdDialog.show(
                    this.$mdDialog.alert()
                        .title('Evaluation failed')
                        .textContent('Hmmm... something seems to be wrong. Change some code and try it again. ' + result.failedMessage)
                        .ok('Got it'));
            }
        }
        catch (e) {
            console.log(e);

            this.$mdDialog.show(
                this.$mdDialog.alert()
                    .title('Ooops! Something went wrong')
                    .textContent(e.message || e)
                    .ok('Got it'));
        }
    }
}

class SolvedController {
    public result: Result;

    private $mdDialog: ng.material.IDialogService;
    private $location: ng.ILocationService;

    static $inject = ['result', '$mdDialog', '$location'];

    constructor(result: Result, $mdDialog: ng.material.IDialogService, $location: ng.ILocationService) {
        this.result = result;
        this.$mdDialog = $mdDialog;
        this.$location = $location;
    }

    public sameRiddle(): void {
        this.$mdDialog.hide();
    }

    public nextRiddle(): void {
        this.$mdDialog.hide();

        // Redirect to the next riddle
        this.$location.path('/riddles/' + this.result.nextLevel);
    }
}

angular.module('evalquiz', ['ngRoute', 'ngMaterial', 'ui.codemirror', 'LocalStorageModule', 'btford.markdown'])
    .controller('EvalQuizController', EvalQuizController)
    .controller('ShowRiddlesController', ShowRiddlesController)
    .controller('CreditsController', CreditsController)
    .controller('RiddleController', RiddleController)
    .controller('SolvedController', SolvedController)
    .run(['riddleManager', function (riddleManager: RiddleManager) {
        riddleManager.setupRiddles();
    }])
    .config(['$mdThemingProvider', '$routeProvider', function ($mdThemingProvider: ng.material.IThemingProvider,
        $routeProvider: ng.route.IRouteProvider) {
        console.log('Hmmm... I dont\'t think you need the console right now ;)');

        $mdThemingProvider.theme('default')
            .accentPalette('lime');

        $routeProvider.when('/riddles/:riddleId', {
            templateUrl: 'templates/riddle.html',
            controller: 'RiddleController',
            controllerAs: 'riddleCtrl'
        });
    }])
    .run(['$location', 'riddleManager', function ($location: ng.ILocationService, riddleManager: RiddleManager) {
        riddleManager.lastPlayedRiddle().then(function (level) {
            $location.path('/riddles/' + level);
        });
    }]);
