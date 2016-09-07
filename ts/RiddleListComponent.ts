/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import './RiddleCardComponent';
import {RiddleManager, RiddleData} from "./riddleManager";
import {Component} from "./Utils";

@Component(module, 'riddleList', {
    templateUrl: 'ts/RiddleListComponent.html'
})
class Controller {
    static $inject = ['riddleManager', '$mdDialog'];

    riddles: RiddleData[];
    loading: boolean;

    constructor(protected riddleManager: RiddleManager, protected $mdDialog: ng.material.IDialogService) {
        this.loading = true;

        this.riddleManager.getRiddleData().then((riddles) => {
            this.riddles = riddles;
            this.loading = false;
        });
    }

    closeDialog(): void {
        this.$mdDialog.hide();
    }
}
