/// <reference path="./index.d.ts" />

import {RiddleManager, Riddle} from './riddle.manager';
import './toolbar.component';
import './workspace.component';

let module = angular.module('evalquiz');

class MainComponent {
    static $inject = ['$routeParams', 'riddleManager'];

    protected riddle: Riddle;

    constructor(protected $routeParams: ng.route.IRouteParamsService, protected riddleManager: RiddleManager) {
        riddleManager.startRiddle($routeParams['riddleId']).then((riddle) => {
            this.riddle = riddle;
        });
    }
}

module.controller('MainComponent', MainComponent);

module.config(['$routeProvider', ($routeProvider: ng.route.IRouteProvider) => {
    console.log('Hmmm... I dont\'t think you need the console right now ;)');

    $routeProvider.when('/riddles/:riddleId', {
        templateUrl: 'script/main.component.html',
        controller: 'MainComponent',
        controllerAs: '$ctrl'
    });
}]);
