/// <reference path="./index.d.ts" />

interface Callback<R, D> {
    deferred: angular.IDeferred<D>;
    dataCallback: (root: R) => D;
}

export class Helper<R> {
    private initialized: boolean;
    private callbacks: Callback<R, any>[];

    constructor(private root: R, private $q: angular.IQService) {
        this.initialized = false;
        this.callbacks = [];
    }

    public init(): void {
        let index: any;
        
        this.initialized = true;

        //Resolve all waiting callbacks on init
        for (index in this.callbacks) {
            this.resolve(this.callbacks[index]);
        }

        this.callbacks.length = 0;
    }

    public call<D>(dataCallback: (root: R) => D): angular.IPromise<D> {
        let callback = {
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
