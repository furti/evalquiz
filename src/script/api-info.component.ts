/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import {Member} from './riddle';
import {Component} from './utils';

@Component(module, 'apiInfo', {
    template: require('./api-info.component.html'),
    bindings: {
        api: '<'
    }
})
class Controller {

    protected api: Member[];

    constructor() {
    } 
}
