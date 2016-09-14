/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import {RiddleManager, RiddleData} from './RiddleManager';
import {Component} from './Utils';

@Component(module, 'riddleList', {
    templateUrl: 'script/RiddleListComponent.html'
})
class Controller {
    static $inject = ['riddleManager', '$mdDialog', '$location', '$timeout'];

    constructor(protected riddleManager: RiddleManager, protected $mdDialog: ng.material.IDialogService, protected $location: ng.ILocationService, protected $timeout: ng.ITimeoutService) {
    }

    startRiddle(riddle: RiddleData) {
        this.$timeout(() => {
            this.$mdDialog.hide();
            this.$location.path('/riddles/' + riddle.id);
        }, 200);
    }

    closeDialog(): void {
        this.$mdDialog.hide();
    }
}
