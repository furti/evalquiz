/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import {Member} from './riddle.manager';
import {Component} from './utils';

@Component(module, 'memberInfo', {
    templateUrl: 'script/member-info.component.html',
    bindings: {
        member: '<'
    }
})
class Controller {

    protected member: Member;

    constructor() {
    }
}
