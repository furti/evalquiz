/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import './credits.dialog';
import './riddle-list.dialog';
import {RiddleManager, Riddle} from './riddle.manager';
import {Component, DialogService} from './utils';

@Component(module, 'toolbar', {
    templateUrl: 'script/toolbar.component.html',
    bindings: {
        riddle: '<'
    }
})
class Controller {
    static $inject = ['riddleManager', '$location', 'creditsDialog', 'riddleListDialog'];

    protected riddle: Riddle;

    constructor(protected riddleManager: RiddleManager, protected $location: ng.ILocationService, protected creditsDialog: DialogService, protected riddleListDialog: DialogService) {
    }

    protected get nextRiddleId(): string {
        if (!this.riddle) {
            return null;
        }

        let nextRiddle: Riddle = this.riddleManager.nextRiddle(this.riddle);

        if (!nextRiddle) {
            return null;
        }

        return nextRiddle.id;
    }

    protected gotoRiddle(riddleId: string): void {
        this.$location.path('/riddles/' + riddleId);
    }

    public showRiddleListDialog($event: any): void {
        this.riddleListDialog.show();
    }

    public showCreditsDialog($event: any): void {
        this.creditsDialog.show();
    }
}
