/**
 * Created by Daniel on 20.01.2015.
 */

/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz', ['ngRoute', 'ngMaterial', 'ui.codemirror', 'LocalStorageModule', 'btford.markdown']);

import './CreditsDialog';
import './RiddleListDialog';
import {RiddleManager, RiddleData, Riddle, Result} from './riddleManager';
import {Component, Service, DialogService, Dialog} from './Utils';


class EvalQuizController {
    static $inject = ['$mdDialog', 'creditsDialog', 'riddleListDialog'];

    constructor(protected $mdDialog: ng.material.IDialogService, protected creditsDialog: DialogService, protected riddleListDialog: DialogService) {
    }

    public showCredits($event: any): void {
        this.creditsDialog.show();
    }

    public showRiddles($event: any): void {
        this.riddleListDialog.show();
    }
}

module.controller('EvalQuizController', EvalQuizController);

module.run(['riddleManager', function (riddleManager: RiddleManager) {
    riddleManager.setupRiddles();
}]).run(['$location', 'riddleManager', function ($location: ng.ILocationService, riddleManager: RiddleManager) {
    riddleManager.lastPlayedRiddle().then(function (level) {
        $location.path('/riddles/' + level);
    });
}]);

