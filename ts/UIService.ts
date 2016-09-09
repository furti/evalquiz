/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import {Service} from "./Utils";

@Service(module, 'uiService')
export default class UIService {
    static $inject = ['$mdDialog'];

    constructor(protected $mdDialog: ng.material.IDialogService) {
    }

    public alert(title: string, content: string): angular.IPromise<any> {
        return this.$mdDialog.show(this.$mdDialog.alert()
            .title(title)
            .textContent(content)
            .ok('Got it!'));
    }

}

