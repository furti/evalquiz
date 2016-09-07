/// <reference path="./index.d.ts" />

import {Dialog} from "./Utils";

let module = angular.module('evalquiz');

@Dialog(module, 'creditsDialog', {
    clickOutsideToClose: true,
    escapeToClose: true,
    focusOnOpen: true,
    hasBackdrop: true,
    templateUrl: 'ts/CreditsDialog.html'
})
class Controller {
    static $inject = ['$mdDialog'];

    constructor(protected $mdDialog: ng.material.IDialogService) {
    }

    protected close(): void {
        this.$mdDialog.hide();
    }

}

