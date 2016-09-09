/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import {RiddleManager, RiddleData} from './RiddleManager';
import {Component} from './Utils';

@Component(module, 'riddleCard', {
    templateUrl: 'ts/RiddleCardComponent.html',
    bindings: {
        riddle: '<'
    }
})
class Controller {
    static $inject = ['riddleManager', '$mdDialog', '$location'];

    protected riddle: RiddleData;

    constructor(protected riddleManager: RiddleManager, protected $mdDialog: ng.material.IDialogService, protected $location: ng.ILocationService) {
    }

    public startRiddle(riddle: RiddleData) {
        this.$mdDialog.hide();
        this.$location.path('/riddles/' + riddle.level);
    }
}

