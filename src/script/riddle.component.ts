/// <reference path="./index.d.ts" />

import {ConsoleService, ConsoleBlock} from './console.service';
import './member-info.component';
import {RiddleManager, RiddleData, Riddle, Result} from './riddle.manager';
import './solved.dialog';
import {UIService} from './ui.service';
import {Component, Service, DialogService, Dialog} from './utils';

let module = angular.module('evalquiz');

class RiddleController {
    static $inject = ['$routeParams', 'riddleManager', '$mdDialog', '$location', 'SolvedDialog', 'consoleService', 'uiService'];

    public riddle: Riddle;
    protected loading: boolean;
    public editorOptions: any;
    public selectedTab: number = 0;

    constructor(protected $routeParams: ng.route.IRouteParamsService, protected riddleManager: RiddleManager, protected $mdDialog: ng.material.IDialogService,
        protected $location: ng.ILocationService, protected solvedDialog: DialogService, protected consoleService: ConsoleService, protected uiService: UIService) {
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

        this.uiService.confirm('Trash Your Code', 'Are you sure that you want to clear the editor?\n\n' +
            'This will **delete all the code** you have written for this riddle.', 'Delete', 'Abort').then(() => {
                self.riddle.code = self.riddle.member.stub;

                this.uiService.toast('Code trashed.');
            });
    }

    public save(): void {
        this.riddleManager.saveRiddle(this.riddle);

        this.uiService.toast('Code saved successfully.');
    }

    public solve(): void {
        this.selectedTab = 1;
        this.consoleService.clear();
        this.consoleService.block().markdown('# Solving riddle: ' + this.riddle.title);

        try {
            var result = this.riddleManager.solveRiddle(this.riddle),
                ctrl = this;

            if (result.solved) {
                this.solvedDialog.show({
                    result: result
                });
            }
            else {
                this.consoleService.errorBlock()
                    .markdown('Evaluation failed.')
                    .markdown('Hmmm... something seems to be wrong. Change some code and try it again.')
                    .markdown(result.failedMessage);
                this.uiService.toast('Failed to solve riddle. See console for more info.');
            }
        }
        catch (err) {
            console.error(err);

            this.consoleService.errorBlock().markdown('Failed to execute function:').code(err);
            this.uiService.toast('Execution failed. See console for more info.');
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
        templateUrl: 'script/riddle.component.html',
        controller: 'RiddleController',
        controllerAs: '$ctrl'
    });
}]);