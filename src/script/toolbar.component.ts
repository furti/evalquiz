/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import './credits.dialog';
import './riddle-list.dialog';
import {RiddleManager} from './riddle.manager';
import {Component, DialogService} from './utils';

@Component(module, 'toolbar', {
    templateUrl: 'script/toolbar.component.html'
})
class Controller {
    static $inject = ['riddleManager', 'creditsDialog', 'riddleListDialog'];

    constructor(protected riddleManager: RiddleManager, protected creditsDialog: DialogService, protected riddleListDialog: DialogService) {
    }

    public showRiddleListDialog($event: any): void {
        this.riddleListDialog.show();
    }

    public showCreditsDialog($event: any): void {
        this.creditsDialog.show();
    }
}
