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
        angular.element('#console').empty();
    }

    public log(message?: any): ConsoleLogItem {
        let id = 'console-block-' + (this.index++);
        let consoleElement: JQuery = angular.element('#console');
        let itemElement: JQuery = angular.element('<div></div>').attr({ id }).addClass('item');
        let iconElement: JQuery = angular.element('<div></div>').addClass('icon');
        let contentElement: JQuery = angular.element('<div</div>').addClass('content');

        itemElement.append(iconElement, contentElement);
        consoleElement.append(itemElement);

        let block: ConsoleLogItem = new ConsoleLogItem(this.uiService, itemElement, iconElement, contentElement);

        if (message) {
            block.write(message);
        }

        return block;
    }
}

export class ConsoleLogItem implements engine.LogItem {

    private lastElement: JQuery;

    constructor(private uiService: UIService, private itemElement: JQuery, private iconElement: JQuery, protected contentElement: JQuery) {
    }

    withClass(classname: string = ''): this {
        this.itemElement.attr('class', 'item ' + classname);

        return this;
    }

    withIcon(icon?: string): this {
        this.iconElement.empty();

        if (icon) {
            this.iconElement.append(`<i class="icon fa ${icon}" aria-hidden="true">`);
        }

        return this;
    }

    newLine(): JQuery {
        this.lastElement = angular.element('<br />');
        this.contentElement.append(this.lastElement);

        return this.lastElement;
    }

    space(): JQuery {
        this.lastElement = angular.element('<span>&nbsp;&nbsp;</span>');
        this.contentElement.append(this.lastElement);

        return this.lastElement;
    }

    icon(icon: string): JQuery {
        this.lastElement = angular.element(`<i class="icon fa ${icon}" aria-hidden="true"></i>`);
        this.contentElement.append(this.lastElement);

        return this.lastElement;
    }

    write(obj: any): JQuery {
        if ((obj === undefined) || (obj === null)) {
            this.lastElement = angular.element('<span></span>').text(obj.toString());
        }
        else if ((typeof obj === "boolean") || (typeof obj === "number") || (typeof obj === "string")) {
            this.lastElement = angular.element('<span></span>').text(obj.toString());
        }
        else if (typeof obj === "function") {
            this.lastElement = angular.element('<div></div>').text(obj.toString());
        }
        else if (angular.isArray(obj)) {
            this.lastElement = angular.element('<div></div>').text(obj.toString());
        }
        else if (typeof obj === "object") {
            this.lastElement = angular.element('<div></div>').text(JSON.stringify(obj));
        }
        else {
            this.lastElement = angular.element('<div></div>').text("WHAT IS A " + typeof obj);
        }

        this.contentElement.append(this.lastElement);

        return this.lastElement;
    }

    markdown(s: string): JQuery {
        this.lastElement = angular.element('<div></div>').html(this.uiService.markdownToHtml(s));
        this.contentElement.append(this.lastElement);

        return this.lastElement;
    }

    code(s: string): JQuery {
        this.lastElement = angular.element('<pre></pre>').addClass('code').text(s);
        this.contentElement.append(this.lastElement);

        return this.lastElement;
    }
}

