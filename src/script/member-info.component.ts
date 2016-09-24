/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import {Member} from './riddle';
import {Component} from './utils';

@Component(module, 'memberInfo', {
    template: require('./member-info.component.html'),
    bindings: {
        member: '<'
    }
})
class Controller {

    protected member: Member;

    constructor() {
    }
}
