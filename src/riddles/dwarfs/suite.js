"use strict";
var Suite = (function () {
    function Suite(context) {
        this.context = context;
        this.hp = 1000000;
        this.performAttack = false;
        this.faster = false;
        this.correct = false;
    }
    Suite.prototype.log = function (message) {
        this.context.log({
            content: message,
            type: 'plain'
        });
    };
    Suite.prototype.attack = function () {
        this.performAttack = true;
    };
    Suite.prototype.doAttack = function (dwarf) {
        var _this = this;
        var logItem = this.context.log();
        logItem.markdown("**The dwarf** has **" + Math.floor(Math.random() * 10 + 10) + " HPs**.");
        return this.context.sequence(0.25, function () {
            logItem.markdown("![Dwarf](/riddles/dwarfs/dwarf_" + dwarf + ".svg) **The dwarf** attacks **the dragon** with **bare hands**.").addClass('info');
        }, 1, function () {
            var d = Math.floor(Math.random() * 18);
            if (d < 1) {
                logItem.markdown("**The dwarf** hits **himself**.").addClass('warning');
            }
            else if (d < 12) {
                logItem.markdown("**The dwarf** misses **the dragon**.").addClass('warning');
                ;
            }
            else if (d > 16) {
                _this.hp = Math.round(_this.hp / 2);
                logItem.markdown("**The dwarf** hits **the dragon** with a critical hit.").addClass('warning');
                ;
            }
            else {
                d = d - 11;
                _this.hp -= d;
                logItem.markdown("**The dwarf** hits **the dragon**.").addClass('warning');
                ;
            }
        }, 1, function () {
            logItem.markdown("**The dragon** has **" + _this.hp + " HPs**.");
        }, 0.25, function () {
            logItem.markdown("**The dragon** attacks **the dwarf** with **fire**.").addClass('info');
        }, 1, function () {
            logItem.markdown("**The dragon** hits **the dwarf**.").addClass('warning');
        }, 0.25, function () {
            logItem.markdown("It smells of fried dwarf. **The dwarf** is dead.").addClass('error');
            return false;
        });
    };
    Suite.prototype.test = function () {
        var dwarfs = [];
        for (var i = 0; i < 8; i++) {
            dwarfs.push(i);
        }
        this.shuffle(dwarfs);
        return this.execute(0.5, false, dwarfs);
    };
    Suite.prototype.testSecondTake = function () {
        var _this = this;
        if (this.context.isFaulty()) {
            return;
        }
        return this.context.sequence(function () {
            _this.context.log().markdown('The dragon could not believe, that the dwarfs solved this riddle. He decided to capture more dwarfs to try once more.');
        }, 1, function () {
            var dwarfs = [];
            for (var i = 0; i < Math.floor(Math.random() * 32) + 48; i++) {
                dwarfs.push(Math.floor(Math.random() * 8));
            }
            _this.shuffle(dwarfs);
            return _this.execute(0.125, true, dwarfs);
        });
    };
    Suite.prototype.testScore = function () {
        if (this.context.isFaulty()) {
            return;
        }
        var loopCount = this.context.countLoops();
        if (loopCount > 0) {
            this.context.score = 1;
            this.context.message({
                content: 'The [JavaScript array](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array) provides a lot of nice methods. ' +
                    'You can use these methods to avoid loops and simplify your code.',
                type: 'markdown',
                icon: 'fa-info-circle',
                classname: 'info'
            });
            return;
        }
        var statementCount = this.context.countStatements();
        var conditionCount = this.context.countConditions();
        if (statementCount === 1 && conditionCount === 0) {
            this.context.score = 3;
        }
        else {
            this.context.score = 2;
        }
    };
    Suite.prototype.execute = function (delay, small, dwarfs) {
        var _this = this;
        var deferred = this.context.defer();
        var line = [];
        var log = this.context.log();
        var content = log.content;
        this.context.map(dwarfs, function (dwarf) { return _this.leaveCave(content, delay, small, dwarf, line); }).then(function (results) {
            deferred.resolve();
            var missing = results.indexOf(false) >= 0;
            if (missing) {
                log.mark('not-ok');
                _this.context.log().withIcon('fa-times-circle').withClass('error').markdown("There are dwarfs missing in the line.");
                _this.context.score = 0;
                return;
            }
            var blues = line.map(function (dwarf) { return dwarf < 4; });
            var failed = blues[0] ? (blues.lastIndexOf(true) > blues.indexOf(false)) : (blues.lastIndexOf(false) > blues.indexOf(true));
            if (failed) {
                log.mark('not-ok');
                _this.context.log().withIcon('fa-times-circle').withClass('error').markdown("The dwarfs failed to line up correctly.");
                _this.context.score = 0;
                return;
            }
            log.mark('ok');
        }, function (err) { return deferred.reject(err); });
        return deferred.promise;
    };
    Suite.prototype.leaveCave = function (content, delay, small, dwarf, line) {
        var _this = this;
        return this.context.postpone(delay, function () {
            var hats = line.map(function (dwarf) { return dwarf <= 3 ? 'red' : 'blue'; });
            var originalHats = hats.slice();
            var index = _this.context.invokeFn(hats);
            if (!angular.equals(hats, originalHats)) {
                _this.context.message('You are manipulation the hats array. This serves no purpose, as it will not reorder the dwarfs.');
            }
            if (_this.performAttack) {
                _this.performAttack = false;
                return _this.doAttack(dwarf);
            }
            if (index === null || index === undefined) {
                _this.context.log().withIcon('fa-exclamation-circle').withClass('warning').markdown("![Dwarf](/riddles/dwarfs/dwarf_" + dwarf + ".svg) A dwarf abandonned himself to despair (the function returned " + index + ").");
                return false;
            }
            if (index < 0 || index > line.length) {
                _this.context.log().withIcon('fa-exclamation-circle').withClass('warning').markdown("![Dwarf](/riddles/dwarfs/dwarf_" + dwarf + ".svg) A dwarf places himself at position " + index + " of " + line.length + " dwarfs. He got eaten by the dragon for this impossibility.");
                return false;
            }
            var element = angular.element("<img src=\"/riddles/dwarfs/dwarf_" + dwarf + ".svg\" class=\"move-in\">");
            if (small) {
                element.attr('style', 'max-width: 16px');
            }
            if (content.is(':empty') || index >= line.length) {
                content.append(element);
            }
            else {
                element.insertBefore(content.find(':nth-child(' + (index + 1) + ')'));
            }
            line.splice(index, 0, dwarf);
            return true;
        });
    };
    Suite.prototype.shuffle = function (a) {
        var j, x, i;
        for (i = a.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = a[i - 1];
            a[i - 1] = a[j];
            a[j] = x;
        }
    };
    return Suite;
}());
exports.Suite = Suite;
//# sourceMappingURL=suite.js.map