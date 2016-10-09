"use strict";
var Suite = (function () {
    function Suite(context) {
        this.context = context;
    }
    Suite.prototype.log = function (message) {
        this.context.log({
            content: message,
            type: 'plain'
        });
    };
    Suite.prototype.draw = function (f) {
    };
    return Suite;
}());
exports.Suite = Suite;
//# sourceMappingURL=suite.js.map