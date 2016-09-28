"use strict";
var Suite = (function () {
    function Suite(context) {
        this.context = context;
        this.faster = false;
        this.correct = false;
    }
    Suite.prototype.log = function (message) {
        this.context.log(message);
    };
    Suite.prototype.testInit = function () {
        var _this = this;
        var deferred = this.context.defer();
        var score = 0;
        var message;
        var loopCount = this.context.countTypes('ForStatement', 'WhileStatement', 'DoWhileStatement');
        if (loopCount > 0) {
            score = 1;
        }
        else {
            var multCount = this.context.countOperators('*', '*=');
            this.faster = true;
            score = multCount > 0 ? 2 : 3;
        }
        this.context.postpone(0.3, function () {
            _this.context.log("Let's see if Carly can beat his teacher:");
            return _this.context.postpone(0.3, function () { return undefined; });
        }).then(function () {
            deferred.resolve({
                success: score > 0,
                score: score,
                message: message
            });
        });
        return deferred.promise;
    };
    Suite.prototype.testBasic = function () {
        return this.execute(3, '1', ' + ', '2', ' + ', '3', ' = ');
    };
    Suite.prototype.testEnhanced = function () {
        return this.execute(10, '1', '+', '2', '+', '3', '+', '4', '+', '5', '+', '6', '+', '7', '+', '8', '+', '9', '+', '10', ' = ');
    };
    Suite.prototype.testRandom = function () {
        var random = Math.round(Math.random() * 99) * 100 + 10005;
        var texts = ['1', '+', '2', '+', '3', '+', '4', '+', '5', '+', '6', '+', ' .', '.', '.', '.', '.', '.', '.', '.', '.', '.', '. ', '+',
            (random - 2).toFixed(0), '+', (random - 1).toFixed(0), '+', (random).toFixed(0), ' = '];
        return this.execute.apply(this, [random].concat(texts));
    };
    Suite.prototype.testFinish = function () {
        if (this.context.getScore() > 1) {
            return {
                success: true,
                message: 'The full name of little Carly is [Carl Friedrich Gauss](https://en.wikipedia.org/wiki/Carl_Friedrich_Gauss), ' +
                    'a mathematician from the 19th century. ' +
                    'At the age of nine he solved the task with a simple multiplication.'
            };
        }
    };
    Suite.prototype.write = function (deferred, seconds, logItem) {
        var _this = this;
        var texts = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            texts[_i - 3] = arguments[_i];
        }
        var text = texts.shift();
        if (!text) {
            deferred.resolve();
        }
        else {
            this.context.postpone(seconds, function () {
                logItem.write(text);
            }).then(function () { return _this.write.apply(_this, [deferred, 0.125, logItem].concat(texts)); });
        }
        return deferred.promise;
    };
    Suite.prototype.execute = function (n) {
        var _this = this;
        var texts = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            texts[_i - 1] = arguments[_i];
        }
        var deferred = this.context.defer();
        var logItem = this.context.log().withClass('large');
        var expected = Math.round((n + 1) * (n / 2));
        var sum;
        var success;
        texts.push(expected.toFixed(0));
        logItem.markdown("Sum the numbers form `1` to `" + n + "`!").addClass('info');
        this.context.postpone(0.125, function () {
            var teacher = _this.context.log();
            teacher.write('Teacher: ').addClass('error');
            teacher.space();
            var carly = _this.context.log();
            carly.write('Carly: ').addClass('warning');
            carly.space();
            var carlyFn = function () {
                sum = _this.context.invokeFn(n);
                success = sum === expected;
                carly.write(sum);
                return _this.context.postpone(0.5, function () {
                    if (success) {
                        carly.space();
                        carly.mark("ok");
                    }
                    else {
                        carly.space();
                        carly.mark("not-ok");
                    }
                    return success;
                });
            };
            if (_this.faster) {
                _this.context.postpone(1, carlyFn).then(function (correct) {
                });
            }
            _this.write.apply(_this, [_this.context.defer(), 0.5, teacher].concat(texts)).then(function () {
                _this.context.postpone(0.5, function () {
                    teacher.space();
                    teacher.mark("ok");
                }).then(function () {
                    if (!_this.faster) {
                        _this.context.postpone(1, carlyFn).then(function (correct) {
                            _this.context.postpone(0.5, function () {
                                if (success) {
                                    _this.context.log('The teacher was faster.').withIcon('fa-info-circle').withClass('error');
                                }
                                else {
                                    _this.context.log('The teacher was faster and Carly was even wrong.').withIcon('fa-times-circle').withClass('error');
                                }
                                deferred.resolve({
                                    success: success
                                });
                            });
                        });
                    }
                    else {
                        _this.context.postpone(0.5, function () {
                            if (success) {
                                _this.context.log('Carly was much faster.').withIcon('fa-info-circle').withClass('warning');
                            }
                            else {
                                _this.context.log('Carly was faster, but wrong.').withIcon('fa-times-circle').withClass('error');
                            }
                            deferred.resolve({
                                success: success
                            });
                        });
                    }
                });
            });
        });
        return deferred.promise;
    };
    return Suite;
}());
exports.Suite = Suite;
//# sourceMappingURL=suite.js.map