/**
 * Created by Daniel on 24.01.2015.
 */

/// <reference path="./index.d.ts" />

import {RiddleManager, RiddleData} from "./riddleManager";

class RiddleCardController {
    private riddleManager: RiddleManager;
    private $mdDialog: ng.material.IDialogService;
    private $location: ng.ILocationService;

    static $inject = ['riddleManager', '$mdDialog', '$location'];

    constructor(riddleManager: RiddleManager, $mdDialog: ng.material.IDialogService, $location: ng.ILocationService) {
        this.riddleManager = riddleManager;
        this.$mdDialog = $mdDialog;
        this.$location = $location;
    }

    public startRiddle(riddle: RiddleData) {
        this.$mdDialog.hide();
        this.$location.path("/riddles/" + riddle.level);
    }
}

angular.module('evalquiz')
    .directive('riddleCard', [function () {
        return {
            restrict: 'E',
            scope: {
                riddle: '=riddle'
            },
            controller: 'RiddleCardController as riddleCtrl',
            templateUrl: 'templates/riddleCard.html'
        }
    }])
    .controller('RiddleCardController', RiddleCardController);
