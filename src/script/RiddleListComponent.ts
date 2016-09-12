/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import './RiddleCardComponent';
import {RiddleManager, RiddleData} from './RiddleManager';
import {Component} from './Utils';

@Component(module, 'riddleList', {
    templateUrl: 'script/RiddleListComponent.html'
})
class Controller {
    static $inject = ['riddleManager', '$mdDialog'];

    constructor(protected riddleManager: RiddleManager, protected $mdDialog: ng.material.IDialogService) {
    }

    protected closeDialog(): void {
        this.$mdDialog.hide();
    }
}
