/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import './RiddleListComponent';
import {RiddleManager, RiddleData} from './RiddleManager';
import {StorageService} from './StorageService';
import {Dialog} from './Utils';

@Dialog(module, 'riddleListDialog', {
    clickOutsideToClose: true,
    escapeToClose: true,
    focusOnOpen: true,
    hasBackdrop: true,
    templateUrl: 'script/RiddleListDialog.html'
})
class Controller {
    static $inject = ['$mdDialog', '$location', 'riddleManager', 'storageService'];

    constructor(protected $mdDialog: ng.material.IDialogService, protected $location: ng.ILocationService, protected riddleManager: RiddleManager, protected storageService: StorageService) {
    }

    protected clear(): void {
        var confirm = this.$mdDialog.confirm()
            .title('Clear Progress?')
            .htmlContent(`<p>I am fully aware, that proceeding this action will:</p>
                <ul>
                    <li>erase all saved riddles</li>
                    <li>remove all achieved stars</li>
                    <li>reset the progress to the first riddle</li>
                </ul>`)
            .ok('Erase Everything')
            .cancel('Abort Action')
            .clickOutsideToClose(true);

        this.$mdDialog.show(confirm).then(() => {
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

