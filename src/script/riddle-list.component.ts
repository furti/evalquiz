/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import {EvalQuizService} from './evalquiz.service';
import {RiddleService} from './riddle.service';
import {Riddle} from './riddle';
import {Component} from './utils';

@Component(module, 'riddleList', {
    template: require('./riddle-list.component.html'),
    bindings: {
        riddles: '<',
        selectedRiddle: '<'
    }
})
class Controller {
    static $inject = ['evalQuizService', 'riddleService', '$mdDialog', '$timeout'];

    protected riddles: Riddle[];
    protected selectedRiddle: Riddle;

    constructor(protected evalQuizService: EvalQuizService, protected riddleService: RiddleService, protected $mdDialog: angular.material.IDialogService, protected $timeout: ng.ITimeoutService) {
    }

    isSolved(riddle: Riddle): boolean {
        return this.riddleService.isSolved(riddle);
    }

    isAvailable(riddle: Riddle): boolean {
        return this.riddleService.isAvailable(riddle);
    }
    
    gotoRiddle(riddleId: string): void {
        this.$timeout(() => {
            this.$mdDialog.hide();
            this.evalQuizService.gotoRiddle(riddleId);
        }, 200);
    }

    closeDialog(): void {
        this.$mdDialog.hide();
    }
}
