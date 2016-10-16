/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import { AnalyticsService } from './analytics.service';
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
    static $inject = ['evalQuizService', 'riddleService', 'creditsDialog', 'riddleListDialog', 'analyticsService'];

    riddles: Riddle[];
    selectedRiddle: Riddle;

    constructor(private evalQuizService: EvalQuizService, private riddleService: RiddleService, private creditsDialog: DialogService, private riddleListDialog: DialogService, private analyticsService: AnalyticsService) {
    }

    get solved(): boolean {
        return this.selectedRiddle && this.riddleService.isSolved(this.selectedRiddle);
    }

    get nextRiddleId(): string | undefined {
        if (!this.selectedRiddle) {
            return undefined;
        }

        return this.evalQuizService.getNextRiddleId(this.selectedRiddle.id);
    }

    get nextAvailable(): boolean {
        if (!this.solved) {
            return false;
        }

        if (!this.nextRiddleId) {
            return false;
        }

        return !!this.evalQuizService.getRiddle(this.nextRiddleId);
    }

    get running(): boolean {
        return this.riddleService.running;
    }

    gotoRiddle(riddleId: string): void {
        this.analyticsService.event('navigation', 'next-riddle', riddleId);
        this.evalQuizService.gotoRiddle(riddleId);
    }

    showOverview(): void {
        this.evalQuizService.goto('/overview');
    }

    showRiddleListDialog(): void {
        this.riddleListDialog.show({
            riddles: this.riddles,
            selectedRiddle: this.selectedRiddle
        });
    }

    showCreditsDialog(): void {
        this.creditsDialog.show();
    }

    get totalScore(): number {
        return this.evalQuizService.totalScore;
    }
}
