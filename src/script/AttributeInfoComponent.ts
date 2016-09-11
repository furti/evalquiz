/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import {FunctionParam} from './RiddleManager';
import {Component} from './Utils';

@Component(module, 'attributeInfo', {
    templateUrl: 'script/AttributeInfoComponent.html',
    bindings: {
        attributes: '<'
    }
})
class Controller {

    protected attributes: FunctionParam[];

    constructor() {
    }
}
