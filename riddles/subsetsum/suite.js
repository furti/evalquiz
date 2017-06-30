"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DAYS = 7;
var DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
var CONFIG = [{
        count: 8,
        maximum: 100,
        step: 10
    }, {
        count: 12,
        maximum: 200,
        step: 10
    }, {
        count: 16,
        maximum: 400,
        step: 10
    }, {
        count: 32,
        maximum: 600,
        step: 10
    }, {
        count: 64,
        maximum: 600,
        step: 10
    }, {
        count: 256,
        maximum: 200,
        step: 5
    }, {
        count: 1024,
        maximum: 100,
        step: 1
    }];
var MAX_LENGTH = 24;
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
        var count = 0;
        this.days = [];
        for (var i = 0; i < DAYS; i++) {
            this.days[i] = this.create(i, CONFIG[i]);
            count += this.days[i].data.length;
        }
        this.context.log({
            content: "Peter and J\u00FCrgen collected " + count + " values during " + DAYS + " days in Austria.",
            type: 'markdown',
            classname: 'info',
            icon: 'fa-info-circle'
        });
    };
    Suite.prototype.testDay1 = function () {
        return this.execute(this.days[0]);
    };
    Suite.prototype.testDay2 = function () {
        return this.execute(this.days[1]);
    };
    Suite.prototype.testDay3 = function () {
        return this.execute(this.days[2]);
    };
    Suite.prototype.testDay4 = function () {
        if (this.context.maxScore <= 0) {
            return;
        }
        return this.execute(this.days[3]);
    };
    Suite.prototype.testDay5 = function () {
        if (this.context.maxScore <= 0) {
            return;
        }
        return this.execute(this.days[4]);
    };
    Suite.prototype.testDay6 = function () {
        if (this.context.maxScore <= 0) {
            return;
        }
        return this.execute(this.days[5]);
    };
    Suite.prototype.testDay7 = function () {
        if (this.context.maxScore <= 0) {
            return;
        }
        return this.execute(this.days[6]);
    };
    Suite.prototype.testComplexity = function () {
        if (this.context.maxScore < 3) {
            return;
        }
        var success = true;
        var classname = 'fade-in';
        if (this.complexity === 'O(n)') {
            classname += ' success';
        }
        else {
            this.context.maxScore = 1;
            success = false;
            classname += ' warning';
            this.context.message({
                content: 'This problem can be solved with a single loop, that uses each data value just once.',
                type: 'markdown',
                classname: 'warning fade-in',
                icon: 'fa-info-circle'
            });
        }
        var logItem = this.context.log({
            content: "The algorithm has a complexity of " + this.complexity + ".",
            type: 'plain',
            classname: classname,
            icon: 'fa-info-circle'
        });
        if (success) {
            logItem.mark('ok');
        }
        ;
    };
    Suite.prototype.testConditions = function () {
        if (this.context.maxScore < 3) {
            return;
        }
        var classname = 'fade-in';
        var count = this.context.countConditions();
        if (count <= 0) {
            classname += ' success';
            var logItem = this.context.log({
                content: "The code does not contain any conditional statements.",
                type: 'plain',
                classname: classname,
                icon: 'fa-info-circle'
            });
            logItem.mark('ok');
        }
        else {
            this.context.maxScore = 2;
        }
    };
    Suite.prototype.create = function (index, config) {
        var range = Math.round(Math.random() * config.maximum / (config.step * 2)) * config.step + config.maximum / 2;
        var data = [];
        for (var i = 0; i < config.count; i++) {
            data.push(-range + Math.round(range * 2 * i / (config.count - 1) / config.step) * config.step);
        }
        while (true) {
            this.shuffle(data);
            var maximum = 0;
            var current = 0;
            var start = 0;
            var nextStart = 0;
            var end = 0;
            for (var i = 0; i < data.length; i++) {
                current = Math.max(0, current + data[i]);
                if (current <= 0) {
                    nextStart = i + 1;
                }
                if (current > maximum) {
                    maximum = current;
                    start = nextStart;
                    end = i;
                }
            }
            if (start > 0 && end < data.length - 1 && end - start > config.count / 4) {
                return { index: index, data: data, maximum: maximum, start: start, end: end };
            }
        }
    };
    Suite.prototype.execute = function (day) {
        var _this = this;
        return this.context.sequence(function () {
            _this.logItem = _this.context.log();
            _this.logItem.markdown(DAY_NAMES[day.index] + ": " + day.data.length + " values").addClass('large');
        }, 0.5, function () { return _this.write(day); }, 0.5, function () {
            _this.logItem.markdown("Expected result: " + day.maximum + " ft");
        }, 0.5, function () {
            var result = _this.context.invokeInstrumentedFn(day.data.slice());
            var element = _this.logItem.write("Your result: " + result + " ft");
            _this.complexity = _this.context.estimateComplexity(day.data.length, _this.complexity);
            if (result === day.maximum) {
                element.addClass('success');
                _this.logItem.mark('ok');
                _this.context.maxScore = 3;
            }
            else {
                element.addClass('error');
                _this.logItem.mark('not-ok');
                _this.context.maxScore = 0;
            }
        });
    };
    Suite.prototype.write = function (day) {
        var _this = this;
        var visuals = day.data.map(function (v) {
            return {
                text: v.toString(),
                highlight: false
            };
        });
        var visualStart = day.start;
        var visualEnd = day.end;
        visuals[day.start].highlight = true;
        visuals[day.end].highlight = true;
        if (visuals.length > MAX_LENGTH && visualStart > 4) {
            var cutLength = Math.min(visualStart - 2, visuals.length - MAX_LENGTH);
            visualStart -= cutLength;
            visualEnd -= cutLength;
            visuals.splice(0, cutLength, {
                text: '... ',
                highlight: false
            });
        }
        if (visuals.length > MAX_LENGTH && visualEnd < visuals.length - 4) {
            var cutStart = Math.max(visualEnd + 4, MAX_LENGTH);
            visuals.splice(cutStart, visuals.length - cutStart, {
                text: '... ',
                highlight: false
            });
        }
        if (visuals.length > MAX_LENGTH) {
            var cutLength = Math.min(visualEnd - visualStart - 4, visuals.length - MAX_LENGTH);
            visuals.splice(Math.floor((visualStart + visualEnd - cutLength) / 2), cutLength, {
                text: '... ',
                highlight: false
            });
        }
        for (var i = visuals.length - 1; i > 0; i--) {
            visuals.splice(i, 0, {
                text: ', ',
                highlight: false
            });
        }
        visuals.push({
            text: '.',
            highlight: false
        });
        return this.context.map(visuals, function (visual) {
            return _this.context.postpone(1 / 16, function () {
                var element = _this.logItem.write(visual.text);
                if (!visual.highlight) {
                    element.addClass('info');
                }
                element.addClass('fade-in');
            });
        });
    };
    Suite.prototype.shuffle = function (array) {
        for (var i = array.length; i > 0; i--) {
            var j = Math.floor(Math.random() * i);
            var tmp = array[i - 1];
            array[i - 1] = array[j];
            array[j] = tmp;
        }
        return array;
    };
    return Suite;
}());
exports.Suite = Suite;
//# sourceMappingURL=suite.js.map