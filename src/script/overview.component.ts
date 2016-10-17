/// <reference path="./index.d.ts" />

import { EvalQuizService } from './evalquiz.service';
import './highlighter.component.ts';
import { Riddle } from './riddle';
import { RiddleService } from './riddle.service';
import './stars.component.ts';
import { UIService } from './ui.service';

let module = angular.module('evalquiz');

class OverviewComponent {
    static $inject = ['$routeParams', 'evalQuizService', 'riddleService', 'uiService'];

    protected riddles: Riddle[];
    protected totalScore: number;

    constructor(private $routeParams: ng.route.IRouteParamsService, private evalQuizService: EvalQuizService, private riddleService: RiddleService, private uiService: UIService) {
        this.evalQuizService.whenInitialized(() => {
            this.init();
        });
    }

    init(): void {
        this.riddles = this.evalQuizService.getRiddles();
        this.totalScore = this.riddles.map(riddle => riddle.state.score).reduce((a, b) => a + b, 0);
    }

    isSolved(riddle: Riddle): boolean {
        return this.riddleService.isSolved(riddle);
    }

    isAvailable(riddle: Riddle): boolean {
        return this.riddleService.isAvailable(riddle);
    }

    code(riddle: Riddle): { [score: number]: string } {
        let result: { [score: number]: string } = {};

        if (!riddle.state.savedCode) {
            return result;
        }

        for (let score = 1; score <= 3; score++) {
            let key = score === 1 ? '1 Star' : score + ' Stars';
            let code = riddle.state.savedCode[key];

            if (code) {
                result[score] = code.trim();
            }
        }

        return result;
    }

    print(): void {
        window.print();
    }

    back(): void {
        this.evalQuizService.gotoRiddle(this.evalQuizService.lastRiddleId);
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
