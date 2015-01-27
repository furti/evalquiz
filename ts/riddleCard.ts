/**
 * Created by Daniel on 24.01.2015.
 */

///<reference path="./definitions/angularjs/angular.d.ts" />
    ///<reference path="./definitions/angular-material/angular-material.d.ts" />
///<reference path="./riddleManager.ts" />

module  riddle {

    class RiddleCardController {
        private riddleManager:RiddleManager;
        private $mdDialog:ng.material.ModalService;
        private $location:ng.ILocationService;

        static $inject = ['riddleManager', '$mdDialog', '$location'];

        constructor(riddleManager:RiddleManager, $mdDialog:ng.material.ModalService, $location:ng.ILocationService) {
            this.riddleManager = riddleManager;
            this.$mdDialog = $mdDialog;
            this.$location = $location;
        }

        public startRiddle(riddle:riddle.RiddleData) {
            if (!riddle.unlocked) {
                return;
            }

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
}