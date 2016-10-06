/// <reference path="./index.d.ts" />

import { EvalQuizService } from './evalquiz.service';
import { Riddle } from './riddle';
import { RiddleService } from './riddle.service';
import { UIService } from './ui.service';

let module = angular.module('evalquiz');

class OverviewComponent {
    static $inject = ['$routeParams', 'evalQuizService', 'riddleService', 'uiService'];

    protected selectedRiddle: Riddle;

    constructor(private $routeParams: ng.route.IRouteParamsService, private evalQuizService: EvalQuizService, private riddleService: RiddleService, private uiService: UIService) {
    }
}

module.controller('OverviewComponent', OverviewComponent);

module.config(['$routeProvider', ($routeProvider: ng.route.IRouteProvider) => {
    $routeProvider.when('/overview', {
        template: require('./overview.component.html'),
        controller: 'OverviewComponent',
        controllerAs: '$ctrl'
    });
}]);
