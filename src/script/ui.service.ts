/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import { MILLIS_MULTIPLIER, Injectable, isPromise } from './utils';

class MenuController {
    static $inject = ['mdPanelRef'];

    protected selected: string;
    protected items: string[];
    protected deferred: angular.IDeferred<string>

    constructor(private mdPanelRef: ng.material.IPanelRef) {
    }

    protected select(item: string) {
        this.deferred.resolve(item);
        this.mdPanelRef.close();
    }
}

@Injectable(module, 'uiService')
export class UIService {
    static $inject = ['$mdPanel', '$mdDialog', '$mdToast', '$q', '$timeout', '$sanitize', 'markdownConverter'];

    constructor(private $mdPanel: ng.material.IPanelService, private $mdDialog: ng.material.IDialogService,
        private $mdToast: ng.material.IToastService, private $q: angular.IQService,
        private $timeout: ng.ITimeoutService, private $sanitize: angular.sanitize.ISanitizeService,
        private markdownConverter: any) {
    }

    markdownToHtml(markdown: string): string {
        return markdown ? this.$sanitize(this.markdownConverter.makeHtml(markdown)) : '';
    }

    menu(relativeToSelector: string, items: string[], selected?: string): angular.IPromise<string> {
        let deferred: angular.IDeferred<string> = this.$q.defer();
        let position = this.$mdPanel.newPanelPosition()
            .relativeTo(relativeToSelector)
            .addPanelPosition(this.$mdPanel.xPosition.ALIGN_START, this.$mdPanel.yPosition.ABOVE);

        this.$mdPanel.open({
            // attachTo: angular.element(document.body),
            controller: MenuController,
            controllerAs: '$ctrl',
            template: `
<md-card class="md-whiteframe-12dp" style="min-width: 12em">
    <md-list>
        <md-list-item ng-repeat="item in $ctrl.items" ng-click="$ctrl.select(item)">
            {{item}}
        </md-list-item>
    </md-list>
</md-card>
                `,
            panelClass: 'ui-menu-panel',
            position: position,
            locals: { selected, items, deferred },
            clickOutsideToClose: true,
            escapeToClose: true,
            focusOnOpen: true,
            zIndex: 200
        });

        return deferred.promise;
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

    postpone<Any>(seconds: number, fn?: () => Any | angular.IPromise<Any>): angular.IPromise<Any> {
        let deferred: angular.IDeferred<Any> = this.$q.defer<Any>();

        this.$timeout(() => {
            try {
                let result = fn ? fn() : undefined;

                if (isPromise(result)) {
                    (result as angular.IPromise<Any>).then(obj => deferred.resolve(obj), err => deferred.reject(err));
                }
                else {
                    deferred.resolve(result);
                }
            }
            catch (err) {
                console.error('Unhandled error in postpone:', err);
                deferred.reject(err);
            }
        }, seconds * MILLIS_MULTIPLIER);

        return deferred.promise;
    }
}