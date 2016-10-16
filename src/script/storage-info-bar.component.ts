/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import { StorageService } from './storage.service';
import { Component, DialogService } from './utils';

@Component(module, 'storageInfoBar', {
    template: require('./storage-info-bar.component.html')
})
class Controller {
    static $inject = ['storageService'];

    constructor(private storageService: StorageService) {
    }

    get dataStorageAllowed(): boolean {
        return this.storageService.dataStorageAllowed;
    }

    accept(): void {
        this.storageService.saveDataStorageAllowed(true);
    }
}
