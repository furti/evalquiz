/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import {EvalQuizService} from './evalquiz.service';
import {Riddle} from './riddle';
import './riddle-list.component';
import {UIService} from './ui.service';
import {Dialog} from './utils';

@Dialog(module, 'riddleListDialog', {
    clickOutsideToClose: true,
    escapeToClose: true,
    focusOnOpen: true,
    hasBackdrop: true,
    template: require('./riddle-list.dialog.html')
})
class Controller {
    static $inject = ['$mdDialog', 'evalQuizService', 'uiService', 'riddles', 'selectedRiddle'];

    constructor(protected $mdDialog: ng.material.IDialogService, protected evalQuizService: EvalQuizService, protected uiService: UIService, protected riddles: Riddle[], protected selectedRiddle: Riddle) {
    }

    protected clear(): void {
        this.uiService.confirm('Clear Progress?', `I am fully aware, that proceeding this action will:

* **erase** all saved riddles
* **remove** all achieved stars
* **reset** the progress to the first riddle`, 'Erase Everything', 'Abort Action').then(() => {
                this.evalQuizService.reset(true);
            });
    }

    protected close(): void {
        this.$mdDialog.hide();
    }
}

