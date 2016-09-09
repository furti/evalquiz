/**
 * Created by Daniel on 20.01.2015.
 */

/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz', ['ngRoute', 'ngMaterial', 'ui.codemirror', 'LocalStorageModule', 'btford.markdown']);

import './CreditsDialog';
import './RiddleComponent';
import './RiddleListDialog';
import {RiddleManager, RiddleData, Riddle, Result} from './RiddleManager';
import {StorageService} from './StorageService';
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

module.run(['$location', 'riddleManager', 'storageService', function ($location: ng.ILocationService, riddleManager: RiddleManager, storageService: StorageService) {
    riddleManager.setupRiddles().then(() => {
        let level = storageService.loadLastPlayedRiddle();

        $location.path('/riddles/' + level);
    });;
}]);

