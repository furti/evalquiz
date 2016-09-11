/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import './CreditsDialog';
import './RiddleListDialog';
import {RiddleManager} from './RiddleManager';
import {Component, DialogService} from './Utils';

@Component(module, 'toolbar', {
    templateUrl: 'script/ToolbarComponent.html'
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
