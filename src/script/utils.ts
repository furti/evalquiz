/// <reference path="./index.d.ts" />

/**
 * A decorator for creating an Angular Component.
 * 
 * @export
 * @param {(string | angular.IModule)} nameOrModule the name of or the module object itself
 * @param {string} selector the name of the component
 * @param {angular.IComponentOptions} [options] some options
 * @returns the controller object
 */
export function Component(nameOrModule: string | angular.IModule, selector: string, options?: angular.IComponentOptions) {
    return (controller: Function) => {
        var module = angular.isString(nameOrModule) ? angular.module(nameOrModule) : nameOrModule;

        module.component(selector, angular.extend(options || {}, {
            controller: controller
        }));
    }
}

/**
 * A decorator for creating an Angular Service.
 * 
 * @export
 * @param {(string | angular.IModule)} nameOrModule the name of or the module object itself
 * @param {string} selector the name of the component
 * @returns the service object
 */
export function Service(nameOrModule: string | angular.IModule, selector: string) {
    return (service: Function) => {
        var module = angular.isString(nameOrModule) ? angular.module(nameOrModule) : nameOrModule;

        module.service(selector, service);
    }
}

/**
 * A service registered by the @Dialog decorator.
 * 
 * @export
 * @interface DialogService the service
 */
export interface DialogService {

    /**
     * Shows the dialog.
     * 
     * @param {{ [key: string]: any }} params objects or IPromise
     * @returns {angular.IPromise<any>} the promise of the dialog
     */
    show(params?: { [key: string]: any }): angular.IPromise<any>;

}

/**
 * A decorator for creating an Angular Service of type DialogService.
 * 
 * @export
 * @param {(string | angular.IModule)} nameOrModule
 * @param {string} selector
 * @param {(angular.material.IDialogOptions | angular.material.IAlertDialog | angular.material.IConfirmDialog | angular.material.IPromptDialog)} [options]
 * @returns the dialog service object
 */
export function Dialog(nameOrModule: string | angular.IModule, selector: string, options?: angular.material.IDialogOptions | angular.material.IAlertDialog | angular.material.IConfirmDialog | angular.material.IPromptDialog) {
    return (dialog: Function) => {
        class LocalDialogService {
            static $inject = ['$mdDialog', '$q']

            constructor(protected $mdDialog: angular.material.IDialogService, protected $q: angular.IQService) {
            }

            show(params?: { [key: string]: any }): angular.IPromise<any> {
                let resolve: { [key: string]: any } = {};

                if (params) {
                    for (let key in params) {
                        if (isPromise(params[key])) {
                            resolve[key] = params[key];

                            delete params[key];
                        }
                    }
                }

                return this.$mdDialog.show(angular.extend(options || {}, {
                    controller: dialog,
                    controllerAs: '$ctrl',
                    locals: params,
                    resolve: resolve
                }));
            };
        }

        var module = angular.isString(nameOrModule) ? angular.module(nameOrModule) : nameOrModule;

        module.service(selector, LocalDialogService);
    }
}

/**
 * Returns true if the object seems to be a Promise.
 * 
 * @export
 * @param {*} obj the object
 * @returns true if the object seems to be a Promise, false otherwise
 */
export function isPromise(obj: any): boolean {
    return obj && angular.isFunction(obj.then);
}


