/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import {Result} from './riddle.manager';
import {Dialog} from './utils';

@Dialog(module, 'SolvedDialog', {
    clickOutsideToClose: false,
    escapeToClose: false,
    focusOnOpen: true,
    hasBackdrop: true,
    templateUrl: 'script/solved.dialog.html'
})
export class Controller {
    static $inject = ['result', '$mdDialog', '$location'];

    constructor(protected result: Result, protected $mdDialog: ng.material.IDialogService, protected $location: ng.ILocationService) {
    }

    protected sameRiddle(): void {
        this.$mdDialog.hide();
    }

    protected nextRiddle(): void {
        this.$mdDialog.hide();

        // Redirect to the next riddle
        this.$location.path('/riddles/' + this.result.nextRiddleId);
    }
}