/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import { Injectable } from './utils';

console.log('tata');

declare function ga(...args: any[]): void;

@Injectable(module, 'analyticsService')
export class AnalyticsService {

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

    send(...args: any[]): void {
        if (this.active) {
            ga('send', ...args);
        }
        else {
            console.info('Analytics: %o', args);
        }
    }

}


