/// <reference path="../angularjs/angular.d.ts" />

declare module ng.material {

    interface ModalService {
        show(optionsOrPreset:ModalOpenOptions): ng.IPromise<any>;
        hide(response?:any): void;
    }

    interface  ModalOpenOptions {
        /**
         * The url of a template that will be used as the content of the dialog.
         */
        templateUrl?:string;
        /**
         * Same as templateUrl, except this is an actual template string.
         */
        template?:string;
        /**
         * A click's event object. When passed in as an option, the location of the click will be used as the starting point for the opening animation of the the dialog.
         */
        targetEvent?:any;
        /**
         * Whether to disable scrolling while the dialog is open. Default true.
         */
        disableParentScroll?:boolean;
        /**
         * Whether there should be an opaque backdrop behind the dialog. Default true.
         */
        hasBackdrop?:boolean;
        /**
         * Whether the user can click outside the dialog to close it. Default true.
         */
        clickOutsideToClose?:boolean;
        /**
         * Whether the user can press escape to close the dialog. Default true.
         */
        escapeToClose?:boolean;
        /**
         * The controller to associate with the dialog. The controller will be injected with the local $hideDialog, which is a function used to hide the dialog.
         */
        controller?:string;
        /**
         * An object containing key/value pairs. The keys will be used as names of values to inject into the controller. For example, locals: {three: 3} would inject three into the controller, with the value 3. If bindToController is true, they will be copied to the controller instead.
         */
        locals?:any;
        /**
         *  bind the locals to the controller, instead of passing them in
         */
        bindToController?:boolean;
        /**
         * Similar to locals, except it takes promises as values, and the dialog will not open until all of the promises resolve.
         */
        resolve?:any;
        /**
         * An alias to assign the controller to on the scope.
         */
        controllerAs?:string;
        /**
         * The element to append the dialog to. Defaults to appending to the root element of the application.
         */
        parent?: ng.IAugmentedJQueryStatic;
        /**
         * Callback function used to announce when the show() action is finished.
         */
        onComplete?:()=>void;
    }

    interface ThemingProvider {
        theme(theme:string):ThemingProvider;
        primaryPalette(color:string):ThemingProvider;
        accentPalette(color:string):ThemingProvider;
    }
}