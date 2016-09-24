/// <reference path="./index.d.ts" />

import {Dialog} from './utils';

let module = angular.module('evalquiz');

@Dialog(module, 'creditsDialog', {
    clickOutsideToClose: true,
    escapeToClose: true,
    focusOnOpen: true,
    hasBackdrop: true,
    template: require('./credits.dialog.html')
})
class Controller {
    static $inject = ['$mdDialog'];

    constructor(protected $mdDialog: ng.material.IDialogService) {
    }

    protected close(): void {
        this.$mdDialog.hide();
    }
}

