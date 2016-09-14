/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import {UIService} from './ui.service';
import {Service} from './utils';

@Service(module, 'consoleService')
export class ConsoleService {
    static $inject = ['uiService'];

    private index = 0;

    constructor(protected uiService: UIService) {
    }

    public clear(): void {
        let consoleElement = document.getElementById('console');

        while (consoleElement.firstChild) {
            consoleElement.removeChild(consoleElement.firstChild);
        }
    }

    public block(className?: string, icon?: string): ConsoleBlock {
        let id = 'console-block-' + (this.index++);
        let consoleElement = document.getElementById('console');
        let blockElement = document.createElement('div');
        let blockClassName = 'block';

        if (className) {
            blockClassName += ' ' + className;
        }

        blockElement.id = id;
        blockElement.className = blockClassName;

        let iconElement = document.createElement('div');

        iconElement.className = 'icon';

        if (icon) {
            iconElement.innerHTML = '<i class="icon fa ' + icon + '" aria-hidden="true"></i>';
        }

        blockElement.appendChild(iconElement);

        let contentElement = document.createElement('div');

        contentElement.className = 'content';

        blockElement.appendChild(contentElement);

        consoleElement.appendChild(blockElement);

        return new ConsoleBlock(this.uiService, blockElement, contentElement);
    }

    public errorBlock(): ConsoleBlock {
        return this.block('error', 'fa-exclamation-circle');
    }
}

export class ConsoleBlock {

    constructor(protected uiService: UIService, protected blockElement: HTMLElement, protected contentElement: HTMLElement) {
    }

    private append(name: string, className: string, html: string): HTMLElement {
        let element = document.createElement(name);

        if (className) {
            element.className = className;
        }

        element.innerHTML = html;

        this.contentElement.appendChild(element);

        return element;
    }

    public markdown(s: string): this {
        this.append('div', null, this.uiService.markdownToHtml(s));

        return this;
    }

    public code(s: string): this {
        this.append('pre', 'code', s);

        return this;
    }
}

