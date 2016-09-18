/// <reference path="./index.d.ts" />

import {EvalQuizService} from './evalquiz.service';
import {Riddle} from './riddle';
import {RiddleService} from './riddle.service';
import './toolbar.component';
import {UIService} from './ui.service';
import './workbench.component';

let module = angular.module('evalquiz');

class PageComponent {
    static $inject = ['$routeParams', 'evalQuizService', 'riddleService', 'uiService'];

    protected selectedRiddle: Riddle;

    constructor(protected $routeParams: ng.route.IRouteParamsService, protected evalQuizService: EvalQuizService, protected riddleService: RiddleService, protected uiService: UIService) {
        let riddleId = $routeParams['riddleId'];

        riddleService.prepare(evalQuizService.getRiddle(riddleId)).then(riddle => {
            this.selectedRiddle = riddle;
        }, err => {
            console.error(`Failed to load riddle "${riddleId}": %o`, err);

            this.uiService.alert('Error', `Failed to load riddle "${riddleId}".`).then(() => {
                evalQuizService.gotoRiddle('intro');
            });
        });
    }

    get riddles(): Riddle[] {
        return this.evalQuizService.getRiddles();
    }

    isAvailable(riddle: Riddle): boolean {
        return this.riddleService.isAvailable(riddle);
    }
}

module.controller('PageComponent', PageComponent);

module.config(['$routeProvider', ($routeProvider: ng.route.IRouteProvider) => {
    console.log('Hmmm... I dont\'t think you need the console right now ;)');

    $routeProvider.when('/riddles/:riddleId', {
        templateUrl: 'script/page.component.html',
        controller: 'PageComponent',
        controllerAs: '$ctrl'
    });
}]);