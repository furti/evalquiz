/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import './riddle-list.component';
import {RiddleManager, RiddleData} from './riddle.manager';
import {StorageService} from './storage.service';
import {UIService} from './ui.service';
import {Dialog} from './utils';

@Dialog(module, 'riddleListDialog', {
    clickOutsideToClose: true,
    escapeToClose: true,
    focusOnOpen: true,
    hasBackdrop: true,
    templateUrl: 'script/riddle-list.dialog.html'
})
class Controller {
    static $inject = ['$mdDialog', '$location', 'riddleManager', 'storageService', 'uiService'];

    constructor(protected $mdDialog: ng.material.IDialogService, protected $location: ng.ILocationService, protected riddleManager: RiddleManager, protected storageService: StorageService, protected uiService: UIService) {
    }

    protected clear(): void {
        this.uiService.confirm('Clear Progress?', `I am fully aware, that proceeding this action will:

* **erase** all saved riddles
* **remove** all achieved stars
* **reset** the progress to the first riddle`, 'Erase Everything', 'Abort Action').then(() => {
                this.storageService.clearSaveGames();
                this.riddleManager.setupRiddles().then(() => {
                    this.$location.path('/riddles/intro');
                });
            });
    }

    protected close(): void {
        this.$mdDialog.hide();
    }
}

