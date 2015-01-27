/**
 * Created by Daniel on 24.01.2015.
 */
///<reference path="./definitions/angularjs/angular.d.ts" />
///<reference path="./definitions/angular-material/angular-material.d.ts" />
///<reference path="./riddleManager.ts" />
var riddle;
(function (_riddle) {
    var RiddleCardController = (function () {
        function RiddleCardController(riddleManager, $mdDialog, $location) {
            this.riddleManager = riddleManager;
            this.$mdDialog = $mdDialog;
            this.$location = $location;
        }
        RiddleCardController.prototype.startRiddle = function (riddle) {
            if (!riddle.unlocked) {
                return;
            }
            this.$mdDialog.hide();
            this.$location.path("/riddles/" + riddle.level);
        };
        RiddleCardController.$inject = ['riddleManager', '$mdDialog', '$location'];
        return RiddleCardController;
    })();
    angular.module('evalquiz').directive('riddleCard', [function () {
        return {
            restrict: 'E',
            scope: {
                riddle: '=riddle'
            },
            controller: 'RiddleCardController as riddleCtrl',
            templateUrl: 'templates/riddleCard.html'
        };
    }]).controller('RiddleCardController', RiddleCardController);
})(riddle || (riddle = {}));
