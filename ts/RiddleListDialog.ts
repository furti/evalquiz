/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import './RiddleListComponent';
import {RiddleManager, RiddleData} from './RiddleManager';
import {Dialog} from './Utils';

@Dialog(module, 'riddleListDialog', {
    clickOutsideToClose: true,
    escapeToClose: true,
    focusOnOpen: true,
    hasBackdrop: true,
    templateUrl: 'ts/RiddleListDialog.html'
})
class Controller {
    static $inject = ['$mdDialog'];

    constructor(protected $mdDialog: ng.material.IDialogService) {
    }

    protected close(): void {
        this.$mdDialog.hide();
    }
}

