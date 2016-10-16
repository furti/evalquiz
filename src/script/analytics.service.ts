/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import { Injectable } from './utils';

declare function ga(...args: any[]): void;

const ID: string = 'UA-85753025-1';

@Injectable(module, 'analyticsService')
export class AnalyticsService {

    private created: boolean = false;

    get active(): boolean {
        return window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    }

    pageview(path: string): void {
        if (path.indexOf('/') !== 0) {
            throw new Error('Paths must start with a slash');
        }

        this.send('pageview', path)
    }

    event(category: string, action: string, label?: string, value?: number): void {
        this.send('event', category, action, label, value);
    }

    create(id: string) {
        if (this.active) {
            ga('create', id, 'auto');
        }
        else {
            console.info('Analytics initialized.');
        }
    }

    send(...args: any[]): void {
        if (!this.created) {
            this.create(ID);
            this.created = true;
        }

        if (this.active) {
            ga('send', ...args);
        }
        else {
            console.info('Analytics: %o', args);
        }
    }

}


