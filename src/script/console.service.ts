/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import { UIService } from './ui.service';
import { Injectable } from './utils';

@Injectable(module, 'consoleService')
export class ConsoleService {
    static $inject = ['uiService'];

    private index = 0;

    constructor(protected uiService: UIService) {
    }

    public clear(): void {
        angular.element('#console').empty();
    }

    public log(message?: string | suite.Message, dummy: boolean = false): ConsoleLogItem {
        let id = 'console-log-item-' + (this.index++);
        let consoleElement: JQuery = angular.element('#console');
        let itemElement: JQuery = angular.element('<div></div>').attr({ id }).addClass('item');
        let iconElement: JQuery = angular.element('<div></div>').addClass('icon');
        let contentElement: JQuery = angular.element('<div></div>').addClass('content');

        itemElement.append(iconElement, contentElement);

        if (!dummy) {
            consoleElement.append(itemElement);
        }

        let logItem: ConsoleLogItem = new ConsoleLogItem(this.uiService, consoleElement, itemElement, iconElement, contentElement);

        if (message && typeof message === 'string') {
            logItem.markdown(message);
        }
        else if (message) {
            switch ((message as suite.Message).type || 'plain') {
                case 'plain':
                    logItem.write((message as suite.Message).content);
                    break;

                case 'markdown':
                    logItem.markdown((message as suite.Message).content);
                    break;

                case 'html':
                    logItem.html((message as suite.Message).content);
                    break;

                case 'code':
                    logItem.code((message as suite.Message).content);
                    break;

                default:
                    throw new Error('Unsupported message type: ' + (message as suite.Message).type);
            }

            if ((message as suite.Message).icon) {
                logItem.withIcon((message as suite.Message).icon);
            }

            if ((message as suite.Message).classname) {
                logItem.withContentClass((message as suite.Message).classname);
            }
        }

        return logItem;
    }
}

export class ConsoleLogItem implements suite.LogItem {

    private lastElement: JQuery;

    constructor(private uiService: UIService, private consoleElement: JQuery, private itemElement: JQuery, private iconElement: JQuery, protected contentElement: JQuery) {
    }

    withClass(classname?: string): this {
        this.itemElement.attr('class', 'item');

        if (classname) {
            this.itemElement.addClass(classname);
        }

        return this;
    }

    withIcon(icon?: string): this {
        this.iconElement.empty();

        if (icon) {
            this.iconElement.append(`<i class="icon fa ${icon}" aria-hidden="true">`);
        }

        return this;
    }

    withContentClass(classname?: string): this {
        this.contentElement.attr('class', '');

        if (classname) {
            this.contentElement.addClass(classname);
        }

        return this;
    }

    get content(): JQuery {
        return this.contentElement;
    }

    private append(element: JQuery): JQuery {
        this.lastElement = element;
        this.contentElement.append(element);

        this.consoleElement.animate({
            scrollTop: this.consoleElement.prop('scrollHeight'),
        }, 0);

        return element;
    }

    sub(): ConsoleLogItem {
        let itemElement: JQuery = angular.element('<div></div>').addClass('item');
        let iconElement: JQuery = angular.element('<div></div>').addClass('icon');
        let contentElement: JQuery = angular.element('<div></div>').addClass('content');

        itemElement.append(iconElement, contentElement);

        this.contentElement.append(itemElement);

        let block: ConsoleLogItem = new ConsoleLogItem(this.uiService, this.consoleElement, itemElement, iconElement, contentElement);

        return block;
    }

    newLine(): JQuery {
        return this.append(angular.element('<br />'));
    }

    space(count: number = 1): JQuery {
        let npsps = '';

        for (let i = 0; i < count; i++) {
            npsps += '&nbsp;';
        }

        return this.append(angular.element(`<span>${npsps}</span>`));
    }

    h1(s: string): JQuery {
        return this.append(angular.element(`<h1>${s}</h1>`));
    }

    h2(s: string): JQuery {
        return this.append(angular.element(`<h2>${s}</h2>`));
    }

    h3(s: string): JQuery {
        return this.append(angular.element(`<h3>${s}</h3>`));
    }

    mark(mark: string): JQuery {
        return this.append(angular.element(`<span class="mark ${mark}"></span>`));
    }

    icon(icon: string): JQuery {
        return this.append(angular.element(`<i class="icon fa ${icon}" aria-hidden="true"></i>`));
    }

    write(obj: any): JQuery {
        if (obj === undefined) {
            return this.append(angular.element('<span></span>').text('undefined'))
        }

        if (obj === null) {
            return this.append(angular.element('<span></span>').text('null'));
        }

        if ((typeof obj === "boolean") || (typeof obj === "number") || (typeof obj === "string")) {
            return this.append(angular.element('<span></span>').text(obj.toString()));
        }

        if (typeof obj === "function") {
            return this.append(angular.element('<div></div>').text(obj.toString()));
        }

        if (angular.isArray(obj)) {
            return this.append(angular.element('<div></div>').text(obj.toString()));
        }

        if (typeof obj === "object") {
            return this.append(angular.element('<div></div>').text(JSON.stringify(obj)));
        }

        return this.append(angular.element('<div></div>').text("WHAT IS A " + typeof obj));
    }

    html(s: string): JQuery {
        return this.append(angular.element(s));
    }

    markdown(s: string): JQuery {
        return this.append(angular.element('<div></div>').html(this.uiService.markdownToHtml(s)));
    }

    code(s: string): JQuery {
        return this.append(angular.element('<pre></pre>').addClass('code').text(s));
    }

    element(element: HTMLElement): JQuery {
        return this.append(angular.element(element));
    }
}

