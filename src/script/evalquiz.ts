/**
 * Created by Daniel on 20.01.2015.
 */

/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz', ['ngRoute', 'ngMaterial', 'ui.codemirror', 'LocalStorageModule', 'btford.markdown']);

import './RiddleComponent';
import {RiddleManager} from './RiddleManager';
import {StorageService} from './StorageService';
import './ToolbarComponent';

module.run(['$location', 'riddleManager', 'storageService', function ($location: ng.ILocationService, riddleManager: RiddleManager, storageService: StorageService) {
    riddleManager.setupRiddles().then(() => {
        let id = storageService.loadLastPlayedRiddleId();

        $location.path('/riddles/' + id);
    });;
}]);

