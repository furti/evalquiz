/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import {Service} from './utils';

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

@Service(module, 'uiService')
export class UIService {
    static $inject = ['$mdPanel', '$mdDialog', '$mdToast', '$q', '$sanitize', 'markdownConverter'];

    constructor(protected $mdPanel: ng.material.IPanelService, protected $mdDialog: ng.material.IDialogService, protected $mdToast: ng.material.IToastService, protected $q: angular.IQService, protected $sanitize: angular.sanitize.ISanitizeService, protected markdownConverter: any) {
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

info(title: string, content: string, ok: string = 'Ok'): angular.IPromise < any > {
    return this.$mdDialog.show(this.$mdDialog.alert()
        .title(title)
        .htmlContent(this.markdownToHtml(content))
        .ok(ok));
}

alert(title: string, content: string, ok: string = 'Got it!'): angular.IPromise < any > {
    return this.$mdDialog.show(this.$mdDialog.alert()
        .title(title)
        .htmlContent(this.markdownToHtml(content))
        .ok(ok));
}

confirm(title: string, content: string, ok: string = 'Yes', cancel: string = 'No'): angular.IPromise < any > {
    return this.$mdDialog.show(this.$mdDialog.confirm()
        .title(title)
        .htmlContent(this.markdownToHtml(content))
        .ok(ok)
        .cancel(cancel));
}
}