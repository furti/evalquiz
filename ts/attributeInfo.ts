/**
 * Created by Daniel on 26.01.2015.
 */

    ///<reference path="./definitions/angularjs/angular.d.ts" />
    ///<reference path="./riddleManager.ts" />
module attributeinfo {

    class AttributeInfoController {
        private attributes:Array<riddle.FunctionParam>;

        constructor($scope:ng.IScope) {
            this.attributes = $scope['attributes'];
        }
    }

    angular.module('evalquiz')
        .directive('attributeInfo', [function () {
            return {
                restrict: 'E',
                scope: {
                    attributes: '=attributes'
                },
                controller: 'AttributeInfoController as infoCtrl',
                templateUrl: 'templates/attributeInfo.html',
                link: function ($scope:ng.IScope, element:ng.IAugmentedJQuery) {
                    element.attr('layout', 'column');
                }
            }
        }])
        .controller('AttributeInfoController', AttributeInfoController);
}