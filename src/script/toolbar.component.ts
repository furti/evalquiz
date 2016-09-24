/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import './credits.dialog';
import { EvalQuizService } from './evalquiz.service';
import { Riddle } from './riddle';
import './riddle-list.dialog';
import { RiddleService } from './riddle.service';
import { Component, DialogService } from './utils';

@Component(module, 'toolbar', {
    template: require('./toolbar.component.html'),
    bindings: {
        riddles: '<',
        selectedRiddle: '<'
    }
})
class Controller {
    static $inject = ['evalQuizService', 'riddleService', 'creditsDialog', 'riddleListDialog'];

    protected riddles: Riddle[];
    protected selectedRiddle: Riddle;

    constructor(protected evalQuizService: EvalQuizService, protected riddleService: RiddleService, protected creditsDialog: DialogService, protected riddleListDialog: DialogService) {
    }

    protected get solved(): boolean {
        return this.selectedRiddle && this.riddleService.isSolved(this.selectedRiddle);
    }

    protected get nextRiddleId(): string | undefined {
        if (!this.selectedRiddle) {
            return undefined;
        }

        return this.evalQuizService.getNextRiddleId(this.selectedRiddle.id);
    }

    protected get nextAvailable(): boolean {
        if (!this.solved) {
            return false;
        }

        if (!this.nextRiddleId) {
            return false;
        }

        return !!this.evalQuizService.getRiddle(this.nextRiddleId);
    }

    protected gotoRiddle(riddleId: string): void {
        this.evalQuizService.gotoRiddle(riddleId);
    }

    public showRiddleListDialog($event: any): void {
        this.riddleListDialog.show({
            riddles: this.riddles,
            selectedRiddle: this.selectedRiddle
        });
    }

    public showCreditsDialog($event: any): void {
        this.creditsDialog.show();
    }
}
