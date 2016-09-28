/**
 * Created by Daniel on 20.01.2015.
 */

/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz', ['ngRoute', 'ngMaterial', 'ui.codemirror', 'LocalStorageModule', 'btford.markdown']);

import {EvalQuizService} from './evalquiz.service';
import './page.component';

module.config(function ($mdThemingProvider: angular.material.IThemingProvider) {
    $mdThemingProvider
        .theme('default')
        .primaryPalette('indigo')
        .accentPalette('amber')
        .warnPalette('deep-orange')
        .backgroundPalette('grey');
});

module.run(['evalQuizService', (evalQuizService: EvalQuizService) => {
    evalQuizService.initialize().then(() => {
        // initially redirect to saved selected riddle
        evalQuizService.gotoRiddle(evalQuizService.selectedRiddleId);
    });
}]);

