/**
 * Created by Daniel on 20.01.2015.
 */

/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz', ['ngRoute', 'ngMaterial', 'ui.codemirror', 'LocalStorageModule', 'btford.markdown']);

import './console.service';
import './riddle.component';
import {RiddleManager} from './riddle.manager';
import {StorageService} from './storage.service';
import './toolbar.component';

module.config(function ($mdThemingProvider) {
    $mdThemingProvider
        .theme('default')
        .primaryPalette('indigo')
        .accentPalette('orange')
        .warnPalette('deep-orange')
        .backgroundPalette('grey');
});

module.run(['$location', 'riddleManager', 'storageService', function ($location: ng.ILocationService, riddleManager: RiddleManager, storageService: StorageService) {
    riddleManager.setupRiddles().then(() => {
        let id = storageService.loadLastPlayedRiddleId();
        $location.path('/riddles/' + id);
    });;
}]);

