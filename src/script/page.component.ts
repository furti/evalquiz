/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import { AnalyticsService } from './analytics.service';
import { EvalQuizService } from './evalquiz.service';
import { Riddle } from './riddle';
import { RiddleService } from './riddle.service';
import './storage-info-bar.component';
import './toolbar.component';
import { UIService } from './ui.service';
import './workbench.component';

class PageComponent {
    static $inject = ['$routeParams', 'evalQuizService', 'riddleService', 'uiService', 'analyticsService'];

    protected selectedRiddle: Riddle;

    constructor(private $routeParams: ng.route.IRouteParamsService, private evalQuizService: EvalQuizService, private riddleService: RiddleService, private uiService: UIService, private analyticsService: AnalyticsService) {
        this.evalQuizService.whenInitialized(() => {
            let riddleId = this.$routeParams['riddleId'];
            let riddle = this.evalQuizService.getRiddle(riddleId);

            this.analyticsService.pageview('/riddles/' + riddleId);

            if (!riddle) {
                this.uiService.alert('Error', `Unknown riddle: ${riddleId}`).then(() => {
                    this.evalQuizService.gotoRiddle('intro');
                });
            }
            else {
                this.riddleService.prepare(riddle).then(r => {
                    this.selectedRiddle = r;
                }, (err: any) => {
                    console.error(`Failed to load riddle "${riddleId}":`, err);

                    this.uiService.alert('Error', `Failed to load riddle: ${riddleId}`).then(() => {
                        this.evalQuizService.gotoRiddle('intro');
                    });
                });
            }

            this.evalQuizService.lastRiddleId = riddleId;
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
    console.log('Hmmm... I don\'t think you\'ll need the console right now ;)');

    $routeProvider.when('/riddles/:riddleId', {
        template: require('./page.component.html'),
        controller: 'PageComponent',
        controllerAs: '$ctrl'
    });
}]);
