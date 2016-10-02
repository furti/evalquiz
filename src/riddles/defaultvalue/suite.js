"use strict";
var Suite = (function () {
    function Suite(context) {
        this.context = context;
        this.contents = ['Apples and pears', 'Bananas for the monk...err... I mean ape', 'Carrots... no not you Carrot!', 'Dates', '',
            'Figs', 'Ghlen Livid bottles', 'Hemp - a lot of hemp', 'Iconographs', 'Jimkin Bearhugger\'s Whiskey', 'Klatchian Coffee',
            'Luggage! Stop eating me!', 'Magical ingredients', null, 'Onions', 'Peeled Nuts', 'Quantum Weather Butterflies', 'Rats for the Iron Helmet',
            'Scythes! Who needs scythes in the city?', 'Tea from the Counterweight Continent', null, 'Very Old Peculiar Brandy from Bentinck\'s',
            'Watermelons (square shaped)', 'Xiguas', 'Ziziphus trees'
        ];
    }
    Suite.prototype.write = function (s) {
        this.logItem.write(s);
        this.written = s;
    };
    Suite.prototype.testCode = function () {
        var _this = this;
        return this.context.postpone(1, function () { return _this.next(_this.context.defer(), 0); });
    };
    Suite.prototype.next = function (deferred, i) {
        var _this = this;
        if (i >= this.contents.length) {
            deferred.resolve();
        }
        else {
            this.context.postpone(0.125, function () {
                _this.logItem = _this.context.log();
                var text = _this.contents[i];
                var expected = text || 'Nothing';
                if (text !== expected) {
                    _this.logItem.withClass('warning');
                }
                _this.context.invokeFn(text);
                if (expected !== _this.written) {
                    _this.logItem = _this.context.log().withIcon('fa-times-circle').withClass('error');
                    _this.logItem.write("Nobby! Please concentrate! You should write down '" + expected + "'!");
                    _this.context.fails();
                }
            }).then(function () { return _this.next(deferred, i + 1); }, function (err) { return deferred.reject(err); });
        }
        return deferred.promise;
    };
    Suite.prototype.testStyle = function () {
        if (this.context.isFaulty()) {
            return;
        }
        var statementsCount = this.context.countStatements();
        if (statementsCount > 1) {
            this.context.message({
                content: 'Your code has too many statements to get a better score. Doing _simple_ things inline helps readability.',
                type: 'markdown',
                icon: 'fa-info-circle',
                classname: 'warning'
            });
            this.context.score(1);
            return;
        }
        var conditionsCount = this.context.countConditions();
        if (conditionsCount > 0) {
            var operatorsCount = this.context.countOperators();
            if (operatorsCount > 0) {
                this.context.message({
                    content: 'You may wish to simplify your condition by checking for the [Falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) value.',
                    type: 'markdown',
                    icon: 'fa-info-circle',
                    classname: 'warning'
                });
                this.context.score(1);
                return;
            }
            this.context.score(2);
            return;
        }
        this.context.score(3);
        return;
    };
    return Suite;
}());
exports.Suite = Suite;
//# sourceMappingURL=suite.js.map