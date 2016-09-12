/// <reference path="./index.d.ts" />

import './MemberInfoComponent';
import {RiddleManager, RiddleData, Riddle, Result} from './RiddleManager';
import './SolvedDialog';
import {Component, Service, DialogService, Dialog} from './Utils';

let module = angular.module('evalquiz');

class RiddleController {
    static $inject = ['$routeParams', 'riddleManager', '$mdDialog', '$location', 'SolvedDialog'];

    public riddle: Riddle;
    protected loading: boolean;
    public editorOptions: any;

    constructor(protected $routeParams: ng.route.IRouteParamsService, protected riddleManager: RiddleManager, protected $mdDialog: ng.material.IDialogService,
        protected $location: ng.ILocationService, protected solvedDialog: DialogService) {
        this.loading = true;

        //After the value of the editor is set we mark the first and last line as readonly
        var cmChange = (editor: any, change: any) => {
            if (change.origin === 'setValue') {
                editor.markText({ line: 0, ch: 0 }, { line: 1 }, { readOnly: true });
                editor.markText({ line: editor.lastLine(), ch: 0 }, {
                    line: editor.lastLine(),
                    ch: 2
                }, { readOnly: true });
                editor.setCursor(3, 1);

                //Remove the change listener as we do not need it anymore
                editor.off('change', cmChange);
            }
        };

        this.editorOptions = {
            lineNumbers: true,
            mode: 'javascript',
            gutters: ['CodeMirror-lint-markers'],
            lint: true,
            autofocus: true,
            extraKeys: {
                "Ctrl-Enter": () => {
                    this.solve();
                }
            },
            onLoad: (cm: any) => {
                cm.on('change', cmChange);
            }
        };

        riddleManager.startRiddle($routeParams['riddleId']).then((riddle) => {
            this.riddle = riddle;
            this.loading = false;
        });
    }

    protected get available(): boolean {
        return this.riddleManager.initialized && !this.loading;
    }
    public trash($event: any): void {
        var self = this;

        this.$mdDialog.show(
            this.$mdDialog.confirm()
                .title('Trash')
                .textContent('Are you sure that you want to clear and reset the editor?')
                .ok('Yes')
                .cancel('No')
        ).then(() => {
            self.riddle.code = self.riddle.member.stub;
        });
    }

    public save(): void {
        this.riddleManager.saveRiddle(this.riddle);

        this.$mdDialog.show(
            this.$mdDialog.alert()
                .title('Saved')
                .textContent('The code was saved')
                .ok('OK'));
    }

    public solve(): void {
        try {
            var result = this.riddleManager.solveRiddle(this.riddle),
                ctrl = this;

            if (result.solved) {
                this.solvedDialog.show({
                    result: result
                });
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

module.controller('RiddleController', RiddleController);

module.config(['$mdThemingProvider', '$routeProvider', ($mdThemingProvider: ng.material.IThemingProvider,
    $routeProvider: ng.route.IRouteProvider) => {
    console.log('Hmmm... I dont\'t think you need the console right now ;)');

    $mdThemingProvider.theme('default')
        .accentPalette('lime');

    $routeProvider.when('/riddles/:riddleId', {
        templateUrl: 'script/RiddleComponent.html',
        controller: 'RiddleController',
        controllerAs: '$ctrl'
    });
}]);
