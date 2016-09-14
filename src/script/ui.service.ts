/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import {Service} from './utils';

@Service(module, 'uiService')
export class UIService {
    static $inject = ['$mdDialog', '$mdToast', '$sanitize', 'markdownConverter'];

    constructor(protected $mdDialog: ng.material.IDialogService, protected $mdToast: ng.material.IToastService, protected $sanitize: angular.sanitize.ISanitizeService, protected markdownConverter: any) {
    }

    markdownToHtml(markdown: string): string {
        return markdown ? this.$sanitize(this.markdownConverter.makeHtml(markdown)) : '';
    }

    toast(content: string): void {
        this.$mdToast.show(
            this.$mdToast.simple()
                .textContent(content)
                .position('top right')
                .hideDelay(3000)
        );
    }

    info(title: string, content: string, ok: string = 'Ok'): angular.IPromise<any> {
        return this.$mdDialog.show(this.$mdDialog.alert()
            .title(title)
            .htmlContent(this.markdownToHtml(content))
            .ok(ok));
    }

    alert(title: string, content: string, ok: string = 'Got it!'): angular.IPromise<any> {
        return this.$mdDialog.show(this.$mdDialog.alert()
            .title(title)
            .htmlContent(this.markdownToHtml(content))
            .ok(ok));
    }

    confirm(title: string, content: string, ok: string = 'Yes', cancel: string = 'No'): angular.IPromise<any> {
        return this.$mdDialog.show(this.$mdDialog.confirm()
            .title(title)
            .htmlContent(this.markdownToHtml(content))
            .ok(ok)
            .cancel(cancel));
    }
}