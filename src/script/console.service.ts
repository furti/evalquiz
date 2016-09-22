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

        let block: ConsoleLogItem = new ConsoleLogItem(this.uiService, consoleElement, itemElement, iconElement, contentElement);

        if (message) {
            block.write(message);
        }

        return block;
    }
}

export class ConsoleLogItem implements suite.LogItem {

    private lastElement: JQuery;

    constructor(private uiService: UIService, private consoleElement: JQuery, private itemElement: JQuery, private iconElement: JQuery, protected contentElement: JQuery) {
    }

    withClass(...classnames: string[]): this {
        this.itemElement.attr('class', 'item');

        if (classnames) {
            classnames.forEach(classname => this.itemElement.addClass(classname));
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

    private append(element: JQuery): JQuery {
        this.lastElement = element;
        this.contentElement.append(element);

        this.consoleElement.animate({
            scrollTop: element.offset().top,
        });

        return element;
    }

    newLine(): JQuery {
        return this.append(angular.element('<br />'));
    }

    space(): JQuery {
        return this.append(angular.element('<span>&nbsp;&nbsp;</span>'));
    }

    mark(mark: string): JQuery {
        return this.append(angular.element(`<span class="mark ${mark}"></span>`));
    }

    icon(icon: string): JQuery {
        return this.append(angular.element(`<i class="icon fa ${icon}" aria-hidden="true"></i>`));
    }

    write(obj: any): JQuery {
        if ((obj === undefined) || (obj === null)) {
            return this.append(angular.element('<span></span>').text(obj.toString()));
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

    markdown(s: string): JQuery {
        return this.append(angular.element('<div></div>').html(this.uiService.markdownToHtml(s)));
    }

    code(s: string): JQuery {
        return this.append(angular.element('<pre></pre>').addClass('code').text(s));
    }
}

