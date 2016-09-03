/**
 * Created by Daniel on 20.01.2015.
 */

/// <reference path="./index.d.ts" />

interface Callback<R, D> {
    deferred: ng.IDeferred<D>;
    dataCallback: (root: R) => D;
}

export class AsyncHelper<R> {
    private root: R;
    private $q: ng.IQService;
    private initialized: boolean;
    private callbacks: Array<Callback<R, any>>;

    constructor(root: R, $q: ng.IQService) {
        this.root = root;
        this.$q = $q;
        this.initialized = false;
        this.callbacks = new Array();
    }

    public init(): void {
        var index: any;
        this.initialized = true;

        //Resolve all waiting callbacks on init
        for (index in this.callbacks) {
            this.resolve(this.callbacks[index]);
        }

        this.callbacks.length = 0;
    }

    public call<D>(dataCallback: (root: R) => D): ng.IPromise<D> {
        var callback = {
            deferred: this.$q.defer(),
            dataCallback: dataCallback
        };

        if (this.initialized) {
            //If initialized call the callback immediately
            this.resolve(callback);
        }
        else {
            //save it for later processing otherwise
            this.callbacks.push(callback);
        }

        return callback.deferred.promise;
    }

    private resolve<D>(callback: Callback<R, D>): void {
        callback.deferred.resolve(callback.dataCallback(this.root));
    }
}
