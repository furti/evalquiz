/**
 * Created by Daniel on 20.01.2015.
 */
/// <reference path="./definitions/angularjs/angular.d.ts" />
var util;
(function (util) {
    var AsyncHelper = (function () {
        function AsyncHelper(root, $q) {
            this.root = root;
            this.$q = $q;
            this.initialized = false;
            this.callbacks = new Array();
        }
        AsyncHelper.prototype.init = function () {
            var index;
            this.initialized = true;
            for (index in this.callbacks) {
                this.resolve(this.callbacks[index]);
            }
            this.callbacks.length = 0;
        };
        AsyncHelper.prototype.call = function (dataCallback) {
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
        };
        AsyncHelper.prototype.resolve = function (callback) {
            callback.deferred.resolve(callback.dataCallback(this.root));
        };
        return AsyncHelper;
    })();
    util.AsyncHelper = AsyncHelper;
})(util || (util = {}));
