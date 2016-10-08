/// <reference path="./index.d.ts" />

import { Component } from './utils';

let module = angular.module('evalquiz');

@Component(module, 'stars', {
    template: require('./stars.component.html'),
    bindings: {
        count: '<',
        maximum: '<?'
    }
})
class OverviewComponent {

    private count: number;
    private maximum: number;

    protected list: {
        index: number;
        classname: string;
    }[];

    constructor() {
    }

    $onChanges(changes: { [name: string]: angular.IChangesObject }): void {
        if (changes['count'] || changes['maximum']) {
            this.list = [];

            for (let index = 0; index < (this.maximum || 3); index++) {
                this.list[index] = {
                    index,
                    classname: index < this.count ? 'fa-star' : 'fa-star-o lightest'
                };
            }
        }
    }
}
