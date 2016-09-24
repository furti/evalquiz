/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import {EvalQuizService} from './evalquiz.service';
import {Riddle} from './riddle';
import {RiddleService} from './riddle.service';
import {XXX} from './riddle.runner';
import {Dialog} from './utils';

@Dialog(module, 'SolvedDialog', {
    clickOutsideToClose: false,
    escapeToClose: false,
    focusOnOpen: true,
    hasBackdrop: true,
    templateUrl: 'script/solved.dialog.html'
})
export class Controller { 
    static $inject = ['result', 'evalQuizService', 'riddleService', '$mdDialog'];

    constructor(protected result: XXX, protected evalQuizService: EvalQuizService, protected riddleService: RiddleService, protected $mdDialog: ng.material.IDialogService) {
    }

    protected close(): void {
        this.$mdDialog.hide();
    }

    protected get riddle(): Riddle {
        return this.result.riddle;
    }

    protected get score(): number {
        return this.result.score;
    }

    protected get success(): boolean {
        return this.score > 0;
    }

    protected get solved(): boolean {
        return this.score >= this.riddle.minScoreToSolve;
    }

    protected get alreadySolved(): boolean {
        return this.riddle.state.score >= this.riddle.minScoreToSolve;
    }

    protected get message(): string | undefined {
        return this.result.message;
    }

    protected get nextRiddleId(): string | undefined {
        return this.evalQuizService.getNextRiddleId(this.riddle.id);
    }

    protected gotoRiddle(riddleId: string): void {
        this.$mdDialog.hide();
        this.evalQuizService.gotoRiddle(riddleId);
    }
}
