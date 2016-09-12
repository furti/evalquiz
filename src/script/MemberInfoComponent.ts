/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import {Member} from './RiddleManager';
import {Component} from './Utils';

@Component(module, 'memberInfo', {
    templateUrl: 'script/MemberInfoComponent.html',
    bindings: {
        member: '<'
    }
})
class Controller {

    protected member: Member;

    constructor() {
    }
}
