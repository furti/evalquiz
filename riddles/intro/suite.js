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
    Suite.prototype.testInit = function () {
        var _this = this;
        return this.context.postpone(0.5, function () {
            _this.context.log('Let\'s perform some tests on your precious masterpiece:');
            return _this.context.postpone(1, function () { return undefined; });
        });
    };
    Suite.prototype.testBasic = function () {
        return this.execute(1, 2, 3);
    };
    Suite.prototype.testLarge = function () {
        return this.execute(16384, 49152, 65536);
    };
    Suite.prototype.testZero = function () {
        return this.execute(0, 0, 0);
    };
    Suite.prototype.testRandom = function () {
        var a = Math.round(Math.random() * 1000);
        var b = Math.round(Math.random() * 1000);
        return this.execute(a, b, a + b);
    };
    Suite.prototype.execute = function (a, b, expected) {
        var _this = this;
        var deferred = this.context.defer();
        var logItem = this.context.log().withClass('large');
        logItem.write(a + " + " + b + " = ").addClass('info');
        this.context.postpone(0.125, function () {
            var c = _this.context.invokeFn(a, b);
            _this.context.postpone(0.125, function () {
                logItem.write(c);
                _this.context.postpone(0.125, function () {
                    logItem.space();
                    if (c === expected) {
                        logItem.mark("ok");
                    }
                    else {
                        logItem.mark("not-ok");
                        _this.context.maxScore = 0;
                    }
                    deferred.resolve();
                }).catch(function (err) { return deferred.reject; });
            }).catch(function (err) { return deferred.reject; });
        }).catch(function (err) { return deferred.reject; });
        return deferred.promise;
    };
    Suite.prototype.testStatements = function () {
        if (this.context.maxScore < 3) {
            return;
        }
        var statementCount = this.context.countStatements() + this.context.countVariableDeclarations();
        var score;
        if (statementCount === 1) {
            var logItem = this.context.log();
            logItem.write('The riddle was solved with only one statement.');
            logItem.mark('ok');
        }
        else {
            this.context.maxScore = 1;
        }
    };
    Suite.prototype.testBonusGoal = function () {
        if (this.context.maxScore < 3) {
            return;
        }
        var statementCount = this.context.countStatements() + this.context.countVariableDeclarations();
        var plusCount = this.context.countOperators('+', '++', '+=');
        var score;
        if (statementCount === 1 && plusCount === 0) {
            var logItem = this.context.log();
            logItem.write('Bonus goal: Solved without any additions.');
            logItem.mark('ok');
        }
        else
            this.context.maxScore = 2;
    };
    return Suite;
}());
exports.Suite = Suite;
//# sourceMappingURL=suite.js.map