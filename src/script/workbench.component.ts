/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import './api-info.component';
import { ConsoleService, ConsoleLogItem } from './console.service';
import { EvalQuizService } from './evalquiz.service';
import './member-info.component';
import { Riddle } from './riddle';
import { RiddleService } from './riddle.service';
import './solved.dialog';
import './toolbar.component';
import { UIService } from './ui.service';
import { Component, Injectable, DialogService, Dialog } from './utils';

@Component(module, 'workbench', {
    template: require('./workbench.component.html'),
    bindings: {
        riddle: '<'
    }
})
class WorkbenchComponent {
    static $inject = ['evalQuizService', 'riddleService', 'SolvedDialog', 'consoleService', 'uiService'];

    protected riddle: Riddle;
    protected editorOptions: any;
    protected selectedTab: number = 0;

    constructor(protected evalQuizService: EvalQuizService, protected riddleService: RiddleService, protected solvedDialog: DialogService, protected consoleService: ConsoleService, protected uiService: UIService) {

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
            lineNumbers: true,
            mode: 'javascript',
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

    public trash($event: any): void {
        this.uiService.confirm('Trash Your Code', 'Are you sure that you want to clear the editor?', 'Delete', 'Abort').then(() => {
            this.riddle.state.code = this.riddle.detail!.stub;
            this.evalQuizService.saveRiddle(this.riddle);
            this.uiService.toast('Code trashed.');
        });
    }

    get hasSaves(): boolean {
        return !!this.riddle.state.savedCode && Object.keys(this.riddle.state.savedCode).length > 0;
    }

    public load(): void {
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

    public save(): void {
        this.riddle.state.savedCode = this.riddle.state.savedCode || {};
        this.riddle.state.savedCode['Manual Save'] = this.riddle.state.code!;

        this.evalQuizService.saveRiddle(this.riddle);
        this.uiService.toast('Code saved successfully.');
    }

    public solve(): void {
        this.selectedTab = 2;

        this.riddleService.execute(this.riddle).then(result => {
            if (result.score > 0) {
                if (result.score >= this.riddle.state.score) {
                    this.riddle.state.score = result.score;
                }

                let key = result.score === 1 ? '1 Star' : result.score + ' Stars';

                this.riddle.state.savedCode = this.riddle.state.savedCode || {};
                this.riddle.state.savedCode[key] = this.riddle.state.code!;
                this.evalQuizService.saveRiddle(this.riddle);
            }

            this.solvedDialog.show({ result }).then(() => {
                // TODO focus editor
            });
        }, err => {
            console.error(err);

            let log = this.consoleService.log();

            log.markdown('Failed to execute function:')
            log.code(err);

            this.uiService.toast('Execution failed. See console for more info.');
        });
    }
}
