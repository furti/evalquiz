/**
 * Created by Daniel on 26.01.2015.
 */

/// <reference path="./index.d.ts" />

import {FunctionParam} from "./riddleManager";

class AttributeInfoController {
    private attributes: Array<FunctionParam>;

    constructor($scope: ng.IScope) {
        var ctrl = this;

        $scope.$watch('attributes', function (attributes: FunctionParam[]) {
            ctrl.attributes = attributes;
        });
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
            link: function ($scope: ng.IScope, element: ng.IAugmentedJQuery) {
                element.attr('layout', 'column');
            }
        }
    }])
    .controller('AttributeInfoController', AttributeInfoController);
