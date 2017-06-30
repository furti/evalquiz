"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Coin = (function () {
    function Coin() {
    }
    return Coin;
}());
exports.Coin = Coin;
var Set = (function () {
    function Set() {
        this.sacks = [];
        this.leadSacks = [];
        this.goldSacks = [];
        this.coins = [];
        this.leadCoins = [];
        this.goldCoins = [];
        this.others = [];
        this.weight = 0;
    }
    return Set;
}());
exports.Set = Set;
var Suite = (function () {
    function Suite(context) {
        this.context = context;
        this.weightings = 0;
        this.weightingLogs = [];
    }
    Suite.prototype.weight = function (thing) {
        this.weightings++;
        var set = this.isolate(thing);
        var what = [];
        this.verifyNoDuplicates(set.sacks);
        this.verifyNoDuplicates(set.coins);
        if (set.sacks.length > 1) {
            what.push(set.sacks.length + ' sacks');
        }
        else if (set.sacks.length > 0) {
            what.push('one sack');
        }
        if (set.coins.length > 1) {
            what.push(set.coins.length + ' coins');
        }
        else if (set.coins.length > 0) {
            what.push('one coin');
        }
        if (set.sacks.length + set.coins.length === 0) {
            what.push('nothing');
        }
        var text = "You weight " + what.join(', ') + " with " + set.weight + " gram.";
        if (set.others.length > 1) {
            text += " Let's ignore the " + set.others.length + " other things.";
        }
        else if (set.others.length > 0) {
            text += " Let's ignore the other thing.";
        }
        this.weightingLogs.push(text);
        return set.weight;
    };
    Suite.prototype.isolate = function (thing, set) {
        var _this = this;
        if (set === void 0) { set = new Set(); }
        if (!thing || (angular.isArray(thing) && thing.length === 0)) {
            return set;
        }
        if (angular.isArray(thing)) {
            thing.forEach(function (sackOrCoin) { return _this.isolate(sackOrCoin, set); });
            return set;
        }
        if (this.isGoldSack(thing)) {
            set.sacks.push(thing);
            set.goldSacks.push(thing);
            set.weight += this.getWeightOfThing(thing);
            return set;
        }
        if (this.isLeadSack(thing)) {
            set.sacks.push(thing);
            set.leadSacks.push(thing);
            set.weight += this.getWeightOfThing(thing);
            return set;
        }
        if (this.isGoldCoin(thing)) {
            set.coins.push(thing);
            set.goldCoins.push(thing);
            set.weight += this.getWeightOfThing(thing);
            return set;
        }
        if (this.isLeadCoin(thing)) {
            set.coins.push(thing);
            set.goldCoins.push(thing);
            set.weight += this.getWeightOfThing(thing);
            return set;
        }
        set.others.push(thing);
        return set;
    };
    Suite.prototype.getCoinsOfSack = function (sack) {
        var index = this.sacks.indexOf(sack);
        if (index < 0) {
            return [];
        }
        return this.coinsOfSacks[index];
    };
    Suite.prototype.getWeightOfThings = function (things) {
        var _this = this;
        return things.map(function (thing) { return _this.getWeightOfThing(thing); }).reduce(function (a, b) { return a + b; }, 0);
    };
    Suite.prototype.getWeightOfThing = function (thing) {
        if (angular.isArray(thing)) {
            return this.getWeightOfThings(thing);
        }
        if (this.isGoldSack(thing) || this.isLeadSack(thing)) {
            return this.getWeightOfThings(this.getCoinsOfSack(thing));
        }
        if (this.isGoldCoin(thing)) {
            return 11;
        }
        if (this.isLeadCoin(thing)) {
            return 10;
        }
        return 0;
    };
    Suite.prototype.isGoldSack = function (thing) {
        return this.goldSack === thing;
    };
    Suite.prototype.isLeadSack = function (thing) {
        return this.leadSacks.indexOf(thing) >= 0;
    };
    Suite.prototype.isGoldCoin = function (thing) {
        return this.goldCoins.indexOf(thing) >= 0;
    };
    Suite.prototype.isLeadCoin = function (thing) {
        return this.leadCoins.indexOf(thing) >= 0;
    };
    Suite.prototype.log = function (message) {
        this.context.log({
            content: message,
            type: 'plain'
        });
    };
    Suite.prototype.test = function () {
        this.logItem = this.context.log();
        this.logItem.markdown("Captain Coppercranium places **10 sacks** infront of you.");
        return this.execute(10, 100, false);
    };
    Suite.prototype.test2 = function () {
        this.logItem = this.context.log();
        this.logItem.markdown("But he suspects, that you have just been lucky. He places another **10 sacks** infront of you.");
        return this.execute(10, 100, false);
    };
    Suite.prototype.test3 = function () {
        if (this.context.maxScore < 3) {
            return;
        }
        this.logItem = this.context.log();
        this.logItem.markdown("He has one last test for you. For one extra star he want's you to solve the riddle with more and uneven sacks.");
        return this.execute(Math.floor(Math.random() * 5) * 2 + 15, undefined, true);
    };
    Suite.prototype.execute = function (numberOfSacks, numberOfCoins, bonusTest) {
        var _this = this;
        var deferred = this.context.defer();
        var index = this.prepare(numberOfSacks, numberOfCoins);
        return this.context.sequence(0.5, function () {
            return _this.context.map(_this.sacks, function (sack) {
                return _this.context.postpone(0.125, function () {
                    var width = 32 * _this.getCoinsOfSack(sack).length / 100;
                    if (_this.isGoldSack(sack)) {
                        _this.logItem.html("<img src=\"riddles/badmoney/sack.svg\" style=\"width: " + width + "px\" class=\"move-in\">");
                    }
                    else {
                        _this.logItem.html("<img src=\"riddles/badmoney/bad_sack.svg\" style=\"width: " + width + "px\" class=\"move-in\">");
                    }
                });
            });
        }, 0.5, function () {
            _this.selected = _this.context.invokeFn(_this.sacks.slice());
            if (_this.weightingLogs.length > 10) {
                _this.weightingLogs.splice(5, _this.weightingLogs.length - 7, '...');
            }
            return _this.context.map(_this.weightingLogs, function (log) {
                return _this.context.postpone(0.25, function () {
                    _this.logItem.markdown(log).addClass('info');
                });
            });
        }, 0.5, function () {
            _this.verify(_this.selected, _this.weightings, bonusTest);
        });
    };
    Suite.prototype.prepare = function (numberOfSacks, numberOfCoins) {
        var _this = this;
        var index = Math.floor(Math.random() * (numberOfSacks - 2)) + 1;
        this.weightings = 0;
        this.weightingLogs = [];
        this.sacks = [];
        this.leadSacks = [];
        this.coinsOfSacks = [];
        this.goldCoins = [];
        this.leadCoins = [];
        this.selected = undefined;
        var _loop_1 = function (i) {
            var coins = [];
            for (var j = (numberOfCoins || Math.floor(Math.random() * 150 + 100)); j > 0; j--) {
                coins.push(new Coin());
            }
            var sack = {
                getCoins: function (numberOfCoins) {
                    if (numberOfCoins === undefined) {
                        return coins.splice(0, coins.length);
                    }
                    if (numberOfCoins === null || numberOfCoins < 0) {
                        _this.context.log({
                            content: "You cannot take **" + numberOfCoins + " coins** out of whatever - at least not in this universe.",
                            type: 'markdown',
                            icon: 'fa-error-circle',
                            classname: 'error'
                        });
                        return [];
                    }
                    if (numberOfCoins > coins.length) {
                        _this.context.log({
                            content: "You cannot take **" + numberOfCoins + " coins** out of a sack with **" + coins.length + " coins** in it, you greedy fool.",
                            type: 'markdown',
                            icon: 'fa-error-circle',
                            classname: 'error'
                        });
                        return [];
                    }
                    return coins.splice(0, numberOfCoins);
                }
            };
            this_1.sacks.push(sack);
            this_1.coinsOfSacks.push(coins);
            if (i === index) {
                this_1.goldSack = sack;
                (_a = this_1.goldCoins).push.apply(_a, coins);
            }
            else {
                this_1.leadSacks.push(sack);
                (_b = this_1.leadCoins).push.apply(_b, coins);
            }
            var _a, _b;
        };
        var this_1 = this;
        for (var i = 0; i < numberOfSacks; i++) {
            _loop_1(i);
        }
        return index;
    };
    Suite.prototype.verify = function (selected, weightings, bonusTest) {
        var set = this.isolate(selected);
        this.verifyNoDuplicates(set.sacks);
        this.verifyNoDuplicates(set.coins);
        if (set.sacks.length === 1 && set.goldSacks.length === 1) {
            var id = this.sacks.indexOf(set.goldSacks[0]) + 1;
            var goldCoins = this.getCoinsOfSack(set.goldSacks[0]);
            if (set.coins.length > 1 || set.others.length > 1) {
                if (bonusTest) {
                    this.context.log({
                        content: "You have failed the bonus test. You have choosen sack #" + id + ", the one with the gold! But you took other things, too. Captain Coppercranium won't offer you a star extra.",
                        type: 'markdown',
                        icon: 'fa-error-circle',
                        classname: 'error'
                    });
                    this.context.maxScore = 2;
                }
                else {
                    this.context.log({
                        content: "You have choosen sack #" + id + ", the one with the gold! But you took other things, too. Captain Coppercranium respects your curiosity and just cuts off ears.",
                        type: 'markdown',
                        icon: 'fa-error-circle',
                        classname: 'error'
                    });
                    this.context.fail();
                }
                return;
            }
            if (weightings <= 0) {
                this.context.log({
                    content: 'You are cheating! Captain Coppercranium respects your ingenuity and just cuts off your head.',
                    type: 'markdown',
                    icon: 'fa-error-circle',
                    classname: 'error'
                });
                this.context.fail();
                return;
            }
            if (weightings === 1) {
                if (bonusTest) {
                    this.context.log({
                        content: "**You have choosen sack #" + id + ", the one with the gold! And you did it with just one weighing.**\n\nCaptain Coppercranium admires your skill. You have earned **" + goldCoins.length + " coins and a star extra**.",
                        type: 'markdown',
                        icon: 'fa-thumbs-up',
                        classname: 'success'
                    });
                    this.context.maxScore = 3;
                }
                else {
                    this.context.log({
                        content: "**You have choosen sack #" + id + ", the one with the gold! And you did it with just one weighing.**\n\nCaptain Coppercranium admires your skill. You have earned **" + goldCoins.length + " coins**.",
                        type: 'markdown',
                        icon: 'fa-thumbs-up',
                        classname: 'success'
                    });
                    this.context.maxScore = 3;
                }
                return;
            }
            if (bonusTest) {
                this.context.log({
                    content: "**You have choosen sack #" + id + ", the one with the gold!**\n\nBut it took you **" + weightings + " weightings**. You will not get a star extra for this.",
                    type: 'markdown',
                    icon: 'fa-thumbs-up',
                    classname: 'warning'
                });
                this.context.maxScore = 2;
            }
            else {
                this.context.log({
                    content: "**You have choosen sack #" + id + ", the one with the gold!**\n\nBut it took you **" + weightings + " weightings**. Captain Coppercranium respects your endurance, but he will not let you go.",
                    type: 'markdown',
                    icon: 'fa-thumbs-up',
                    classname: 'warning'
                });
                this.context.maxScore = 1;
            }
            return;
        }
        if (bonusTest) {
            this.context.log({
                content: 'You failed to choose the right sack in the bonus test.',
                type: 'markdown',
                icon: 'fa-error-circle',
                classname: 'error'
            });
            this.context.maxScore = 2;
            return;
        }
        if (set.sacks.length === 0 && set.coins.length === 0 && set.others.length === 0) {
            this.context.log({
                content: 'You took nothing. Captain Coppercranium respects your modesty and just cuts off your tongue.',
                type: 'markdown',
                icon: 'fa-error-circle',
                classname: 'error'
            });
            this.context.fail();
            return;
        }
        if (set.sacks.length > 1) {
            this.context.log({
                content: 'You did take multiple sacks. Captain Coppercranium respects your greed and just cuts off your hands.',
                type: 'markdown',
                icon: 'fa-error-circle',
                classname: 'error'
            });
            this.context.fail();
            return;
        }
        if (set.coins.length > 1) {
            this.context.log({
                content: 'You did take loose coins. Captain Coppercranium respects your haste and just cuts off your feet.',
                type: 'markdown',
                icon: 'fa-error-circle',
                classname: 'error'
            });
            this.context.fail();
            return;
        }
        if (set.sacks.length === 1) {
            this.context.log({
                content: 'You did pick the wrong sack. Captain Coppercranium has not respect for this and will cut you into tiny little pieces.',
                type: 'markdown',
                icon: 'fa-error-circle',
                classname: 'error'
            });
            this.context.fail();
            return;
        }
        if (set.coins.length === 1) {
            this.context.log({
                content: 'You did take a single coin? Captain Coppercranium respects your persnicketiness and just cuts off your fingers.',
                type: 'markdown',
                icon: 'fa-error-circle',
                classname: 'error'
            });
            this.context.fail();
            return;
        }
        this.context.log({
            content: 'What\'s that in your hands? Captain Coppercranium respects your disgustingty and just cuts off your toes.',
            type: 'markdown',
            icon: 'fa-error-circle',
            classname: 'error'
        });
        this.context.fail();
    };
    Suite.prototype.verifyNoDuplicates = function (things) {
        for (var i = 0; i < things.length; i++) {
            for (var j = i + 1; j < things.length; j++) {
                if (things[i] === things[j]) {
                    this.context.log({
                        content: 'You have duplicate objects in your array! Captain Coppercranium respects your distraction of the universe and just cuts off you family tree.',
                        type: 'markdown',
                        icon: 'fa-error-circle',
                        classname: 'error'
                    });
                    this.context.fail();
                    return things;
                }
            }
        }
        return things;
    };
    return Suite;
}());
exports.Suite = Suite;
//# sourceMappingURL=suite.js.map