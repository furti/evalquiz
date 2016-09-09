/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import {FunctionParam} from './riddleManager';
import {Component} from './Utils';

@Component(module, 'attributeInfo', {
    templateUrl: 'ts/AttributeInfoComponent.html',
    bindings: {
        attributes: '<'
    }
})
class Controller {

    protected attributes: FunctionParam[];

    constructor() {
    }
}
