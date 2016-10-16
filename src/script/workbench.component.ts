/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import { AnalyticsService } from './analytics.service';
import './api-info.component';
import { ConsoleService, ConsoleLogItem } from './console.service';
import { EvalQuizService } from './evalquiz.service';
import './member-info.component';
import { Riddle } from './riddle';
import { RiddleService } from './riddle.service';
import { UIService } from './ui.service';
import { Component, Injectable, DialogService, Dialog } from './utils';

@Component(module, 'workbench', {
    template: require('./workbench.component.html'),
    bindings: {
        riddle: '<'
    }
})
class WorkbenchComponent {
    static $inject = ['evalQuizService', 'riddleService', 'consoleService', 'uiService', 'analyticsService'];

    riddle: Riddle;
    editorOptions: any;
    selectedTab: number = 0;

    constructor(private evalQuizService: EvalQuizService, private riddleService: RiddleService, private consoleService: ConsoleService, private uiService: UIService, private analyticsService: AnalyticsService) {

        // After the value of the editor is set we mark the first and last line as readonly
        var cmChange = (editor: any, change: any) => {
            if (change.origin === 'setValue') {
                editor.markText({ line: 0, ch: 0 }, { line: 0 }, { readOnly: true });
                editor.markText({ line: editor.lastLine(), ch: 0 }, {
                    line: editor.lastLine(),
                    ch: 2
                }, { readOnly: true });
                editor.setCursor(1, 1);

                // Remove the change listener as we do not need it anymore
                editor.off('change', cmChange);
            }
        };

        this.editorOptions = {
            mode: 'javascript',
            indentUnit: 4,
            smartIndent: true,
            tabSize: 4,
            indentWithTabs: true,
            lineNumbers: true,
            gutters: ['CodeMirror-lint-markers'],
            lint: true,
            autofocus: true,
            extraKeys: {
                "Ctrl-Enter": () => {
                    this.solve();
                }
            },
            onLoad: (cm: any) => {
                cm.on('change', cmChange);
            }
        };
    }

    get solved(): boolean {
        return this.riddleService.isSolved(this.riddle);
    }

    get running(): boolean {
        return this.riddleService.running;
    }

    trash($event: any): void {
        this.uiService.confirm('Trash Your Code', 'Are you sure that you want to clear the editor?', 'Delete', 'Abort').then(() => {
            this.riddle.state.code = this.riddle.detail!.stub;
            this.evalQuizService.saveRiddle(this.riddle);
            this.uiService.toast('Code trashed.');
        });
    }

    get hasSaves(): boolean {
        return !!this.riddle.state.savedCode && Object.keys(this.riddle.state.savedCode).length > 0;
    }

    load(): void {
        let items = this.hasSaves ? Object.keys(this.riddle.state.savedCode) : [];

        items.sort();

        this.uiService.menu('.code-load-button', items).then(item => {
            if (item) {
                this.riddle.state.code = this.riddle.state.savedCode![item];
                this.evalQuizService.saveRiddle(this.riddle);
                this.uiService.toast(`Loaded "${item}".`);
            }
        });
    }

    save(): void {
        this.riddle.state.savedCode = this.riddle.state.savedCode || {};
        this.riddle.state.savedCode['Manual Save'] = this.riddle.state.code!;

        this.evalQuizService.saveRiddle(this.riddle);
        this.uiService.toast('Code saved successfully.');
    }

    solve(): void {
        if (this.running) {
            this.riddleService.abort();
        }
        else {
            this.selectedTab = 2;
            this.riddleService.execute(this.riddle);
        }
    }

}
