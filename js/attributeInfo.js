/**
 * Created by Daniel on 26.01.2015.
 */
///<reference path="./definitions/angularjs/angular.d.ts" />
///<reference path="./riddleManager.ts" />
var attributeinfo;
(function (attributeinfo) {
    var AttributeInfoController = (function () {
        function AttributeInfoController($scope) {
            this.attributes = $scope['attributes'];
        }
        return AttributeInfoController;
    })();
    angular.module('evalquiz').directive('attributeInfo', [function () {
        return {
            restrict: 'E',
            scope: {
                attributes: '=attributes'
            },
            controller: 'AttributeInfoController as infoCtrl',
            templateUrl: 'templates/attributeInfo.html',
            link: function ($scope, element) {
                element.attr('layout', 'column');
            }
        };
    }]).controller('AttributeInfoController', AttributeInfoController);
})(attributeinfo || (attributeinfo = {}));
