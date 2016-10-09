"use strict";
var Coin = (function () {
    function Coin() {
    }
    return Coin;
}());
exports.Coin = Coin;
var Suite = (function () {
    function Suite(context) {
        this.context = context;
        this.weightings = 0;
        this.weightingLogs = [];
    }
    Suite.prototype.weight = function (left, right) {
        this.weightings++;
        var leftCoins = this.toCoinArray(left);
        var rightCoins = this.toCoinArray(right);
        this.context.check();
        if (!this.context.quiet) {
            this.logItem.markdown("Weighting coins: " + leftCoins.length + " on the left and " + rightCoins.length + " on the right.").addClass('info');
        }
        if (!this.verifyNotEmpty(leftCoins) || !this.verifyNotEmpty(rightCoins) || !this.verifyNoDuplicates(leftCoins) || !this.verifyNoDuplicates(rightCoins) || !this.verifyNoSames(leftCoins, rightCoins)) {
            this.context.check();
        }
        var leftWeight = this.getWeight(leftCoins);
        var rightWeight = this.getWeight(rightCoins);
        if (leftWeight > rightWeight) {
            if (!this.context.quiet) {
                this.logItem.markdown("The left side is heavier.");
            }
            return -1;
        }
        if (leftWeight < rightWeight) {
            if (!this.context.quiet) {
                this.logItem.markdown("The right side is heavier.");
            }
            return 1;
        }
        if (!this.context.quiet) {
            this.logItem.markdown("The weight is balanced.");
        }
        return 0;
    };
    Suite.prototype.toCoinArray = function (source, target) {
        var _this = this;
        if (target === void 0) { target = []; }
        if (angular.isArray(source)) {
            source.forEach(function (coin) { return _this.toCoinArray(coin, target); });
            return target;
        }
        if (!source) {
            return target;
        }
        if (this.coins.indexOf(source) >= 0) {
            target.push(source);
            return target;
        }
        this.context.log({
            content: 'This ain\'t no coins, that\'s rubbish!',
            type: 'markdown',
            icon: 'fa-times-circle',
            classname: 'error'
        });
        this.context.skip();
        return [];
    };
    Suite.prototype.verifyNotEmpty = function (coins) {
        if (!coins.length) {
            this.context.log({
                content: 'You cannot weight nothing.',
                type: 'markdown',
                icon: 'fa-times-circle',
                classname: 'error'
            });
            this.context.skip();
            return false;
        }
        return true;
    };
    Suite.prototype.verifyNoDuplicates = function (coins) {
        for (var i = 0; i < coins.length; i++) {
            for (var j = i + 1; j < coins.length; j++) {
                if (coins[i] === coins[j]) {
                    this.context.log({
                        content: 'Your array contains the same coin object twice.',
                        type: 'markdown',
                        icon: 'fa-times-circle',
                        classname: 'error'
                    });
                    this.context.skip();
                    return false;
                }
            }
        }
        return true;
    };
    Suite.prototype.verifyNoSames = function (left, right) {
        for (var i = 0; i < left.length; i++) {
            if (right.indexOf(left[i]) >= 0) {
                this.context.log({
                    content: 'How did you put the same coin on both sides, you litte distractor of the universe?',
                    type: 'markdown',
                    icon: 'fa-times-circle',
                    classname: 'error'
                });
                this.context.skip();
                return false;
            }
        }
        return true;
    };
    Suite.prototype.verifySames = function (left, right) {
        for (var i = 0; i < left.length; i++) {
            if (right.indexOf(left[i]) < 0) {
                this.context.log({
                    content: 'Where did you get the coins from? I suspect you are cheating!',
                    type: 'markdown',
                    icon: 'fa-times-circle',
                    classname: 'error'
                });
                this.context.skip();
                return false;
            }
        }
        return true;
    };
    Suite.prototype.getWeight = function (coins) {
        var _this = this;
        return coins.map(function (coin) { return coin === _this.goldCoin ? 11 : 10; }).reduce(function (a, b) { return a + b; }, 0);
    };
    Suite.prototype.log = function (message) {
        this.context.log({
            content: message,
            type: 'plain'
        });
    };
    Suite.prototype.showCoins = function (deferred, numberOfCoins) {
        var _this = this;
        var maxCoins = numberOfCoins > 20 ? 10 : 5;
        if (numberOfCoins > maxCoins) {
            this.logItem.html("<img src=\"/riddles/badmoney2/coin" + maxCoins + ".svg\" class=\"move-in\"/>");
            this.context.postpone(0.05, function () { return _this.showCoins(deferred, numberOfCoins - maxCoins).catch(function (err) { return deferred.reject(err); }); }).catch(function (err) { return deferred.reject(err); });
            return deferred.promise;
        }
        if (numberOfCoins > 0) {
            this.logItem.html("<img src=\"/riddles/badmoney2/coin" + numberOfCoins + ".svg\" class=\"move-in\" />");
        }
        deferred.resolve();
        return deferred.promise;
    };
    Suite.prototype.test = function () {
        this.logItem = this.context.log();
        var numberOfCoins = 27;
        var goldCoinIndex = Math.floor(Math.random() * (numberOfCoins - 2)) + 1;
        for (var i = 0; i < 4; i++) {
            if (this.preview(numberOfCoins, goldCoinIndex, 3)) {
                console.log(this.preview(numberOfCoins, goldCoinIndex, 3));
                break;
            }
            goldCoinIndex = (goldCoinIndex + 8) % 27;
        }
        return this.execute(numberOfCoins, goldCoinIndex, 3);
    };
    Suite.prototype.testExtra = function () {
        var _this = this;
        if (this.context.maxScore < 3) {
            return;
        }
        var deferred = this.context.defer();
        this.logItem = this.context.log();
        this.logItem.markdown('Can you do this with more coins?').addClass('large');
        var numberOfCoins = 101 + Math.floor(Math.random() * 30);
        var goldCoinIndex;
        for (var i = 0; i < 98; i++) {
            goldCoinIndex = Math.floor(Math.random() * (numberOfCoins - 2)) + 1;
            if (this.preview(numberOfCoins, goldCoinIndex, 5)) {
                break;
            }
            numberOfCoins++;
        }
        this.context.optional = true;
        this.execute(numberOfCoins, goldCoinIndex, 5).then(function () {
            var passed = _this.context.maxScore >= 3;
            _this.context.optional = false;
            if (passed) {
                _this.context.log({
                    content: 'You passed the extra test.',
                    type: 'markdown',
                    icon: 'fa-exclamation-triangle',
                    classname: 'success large'
                });
            }
            else {
                _this.context.log({
                    content: 'You failed the extra test.',
                    type: 'markdown',
                    icon: 'fa-exclamation-triangle',
                    classname: 'error large'
                });
                _this.context.maxScore = 2;
            }
            deferred.resolve();
        }, function (err) {
            _this.context.optional = false;
            _this.context.log({
                content: 'You failed the extra test.',
                type: 'markdown',
                icon: 'fa-exclamation-triangle',
                classname: 'error large'
            });
            _this.context.maxScore = 2;
            deferred.resolve();
        });
        return deferred.promise;
    };
    Suite.prototype.execute = function (numberOfCoins, goldCoinIndex, maxWeightings) {
        var _this = this;
        var deferred = this.context.defer();
        this.init(numberOfCoins, goldCoinIndex);
        this.step().then(function (coins) {
            if (!coins || !coins.length) {
                _this.context.log({
                    content: 'You did not return anything.',
                    type: 'plain',
                    icon: 'fa-times-circle',
                    classname: 'error'
                }).mark('not-ok');
                _this.context.maxScore = 0;
                deferred.resolve();
                return;
            }
            if (_this.goldCoin !== coins[0]) {
                _this.context.log({
                    content: 'You did return the wrong coin.',
                    type: 'plain',
                    icon: 'fa-times-circle',
                    classname: 'error'
                }).mark('not-ok');
                _this.context.maxScore = 0;
                deferred.resolve();
                return;
            }
            if (_this.weightings > maxWeightings) {
                _this.context.log({
                    content: "You have found the gold coin, but " + _this.weightings + " weightings are more than expected.",
                    type: 'plain',
                    icon: 'fa-check-circle',
                    classname: 'warning'
                }).mark('ok');
                _this.context.maxScore = 1;
            }
            else {
                _this.context.log({
                    content: "You have found the gold coin with a minimum amount of " + _this.weightings + " weightings.",
                    type: 'plain',
                    icon: 'fa-check-circle',
                    classname: 'success'
                }).mark('ok');
                _this.context.maxScore = 3;
            }
            deferred.resolve();
        }, function (err) { return deferred.reject(err); });
        return deferred.promise;
    };
    Suite.prototype.step = function (deferred) {
        var _this = this;
        if (deferred === void 0) { deferred = this.context.defer(); }
        this.context.sequence(0.125, function () {
            _this.logItem.markdown("Captain Coppercranium still has " + _this.coins.length + " coins.").addClass('info fade-in');
        }, 0.125, function () {
            return _this.showCoins(_this.context.defer(), _this.coins.length);
        }, 0.125, function () {
            var index = _this.coins.indexOf(_this.goldCoin);
            if (index < 0) {
                _this.logItem.markdown("The gold coin isn't among these coins, but Captain Coppercranium does not know this, of course.").addClass('error');
            }
            {
                _this.logItem.markdown("The gold coin is #" + (index + 1) + ", but Captain Coppercranium does not know this, of course.").addClass('info');
            }
        }, 0.125, function () {
            var result = _this.context.invokeFn(_this.coins.slice());
            if (result === null || result === undefined) {
                deferred.resolve([]);
                return;
            }
            var remainingCoins = _this.toCoinArray(result);
            if (angular.equals(remainingCoins, _this.coins)) {
                _this.context.log({
                    content: 'The array of coins was not modified. This triggers an endless loop.',
                    type: 'markdown',
                    icon: 'fa-times-circle',
                    classname: 'error'
                });
                _this.context.skip();
                deferred.resolve(undefined);
                return;
            }
            _this.context.check();
            _this.verifyNoDuplicates(remainingCoins);
            _this.verifySames(remainingCoins, _this.coins);
            _this.context.check();
            _this.coins = remainingCoins.slice();
            if (_this.coins.length > 1) {
                _this.step(deferred);
            }
            else {
                deferred.resolve(remainingCoins);
            }
        }).catch(function (err) { return deferred.reject(err); });
        return deferred.promise;
    };
    Suite.prototype.preview = function (numberOfCoins, goldCoinIndex, maxWeightings) {
        var deferred = this.context.defer();
        this.init(numberOfCoins, goldCoinIndex);
        this.context.optional = this.context.quiet = true;
        try {
            while (this.coins.length > 1) {
                var result = this.context.invokeFn(this.coins.slice());
                if (result === null || result === undefined) {
                    return 'empty';
                }
                var remainingCoins = this.toCoinArray(result);
                if (angular.equals(remainingCoins, this.coins)) {
                    return 'unmodified';
                }
                this.verifyNoDuplicates(remainingCoins);
                this.verifySames(remainingCoins, this.coins);
                this.coins = remainingCoins.slice();
            }
            if (!this.coins || !this.coins.length) {
                return 'empty';
            }
            if (this.goldCoin !== this.coins[0]) {
                return 'invalid';
            }
            if (this.weightings > maxWeightings) {
                return 'tooManyWeightings';
            }
            if (this.context.isSkipped() || this.context.maxScore < 1) {
                return 'failed';
            }
        }
        catch (err) {
            console.error('Preview failed:', err);
            return err;
        }
        finally {
            this.context.optional = this.context.quiet = false;
        }
        return undefined;
    };
    Suite.prototype.init = function (numberOfCoins, goldCoinIndex) {
        this.weightings = 0;
        this.weightingLogs = [];
        this.coins = [];
        this.goldCoin = new Coin();
        this.leadCoins = [];
        for (var i = 1; i < numberOfCoins; i++) {
            var leadCoin = new Coin();
            this.coins.push(leadCoin);
            this.leadCoins.push(leadCoin);
        }
        this.coins.splice(goldCoinIndex, 0, this.goldCoin);
    };
    return Suite;
}());
exports.Suite = Suite;
//# sourceMappingURL=suite.js.map