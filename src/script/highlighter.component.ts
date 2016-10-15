/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import { Member } from './riddle';
import { Component } from './utils';

@Component(module, 'highlighter', {
    template: '<div></div>',
    bindings: {
        code: '<',
        mode: '@?'
    }
})
class Controller {
    static $inject = ['$element'];

    protected code: string;
    protected mode: string;

    constructor(private $element: JQuery) {
    }

    $onInit(): void {
        this.update();
    }

    update(): void {
        if (!this.code) {
            this.$element.empty();
            return;
        }

        this.code = this.code.trim();

        this.$element.each((index, element) => {
            (window as any).CodeMirror(element, {
                value: this.code,
                mode: this.mode || 'javascript',
                indentUnit: 4,
                tabSize: 4,
                indentWithTabs: true,
                lineNumbers: true,
                lineWrapping: true,
                readOnly: true
            });
        });

    }
}
