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
        this.success = true;
    }
    Suite.prototype.write = function (s) {
        this.logItem.write(s);
        this.written = s;
    };
    Suite.prototype.testCode = function () {
        var _this = this;
        var deferred = this.context.defer();
        this.next(this.context.defer(), 0).then(function () { return deferred.resolve({
            success: _this.success
        }); }, function (err) { return deferred.reject(err); });
        return deferred.promise;
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
                    _this.success = false;
                }
            }).then(function () { return _this.next(deferred, i + 1); }, function (err) { return deferred.reject(err); });
        }
        return deferred.promise;
    };
    Suite.prototype.testStyle = function () {
        var statementsCount = this.context.countStatements();
        if (statementsCount > 1) {
            this.context.log('Your code has too many statements to get a better score.').withClass('warning', 'fade-in').withIcon('fa-info-circle');
            return {
                success: true,
                score: 1
            };
        }
        var conditionsCount = this.context.countConditions();
        if (conditionsCount > 0) {
            var operatorsCount = this.context.countOperators();
            if (operatorsCount > 0) {
                this.context.log('You may wish to simplify your condition.').withClass('warning', 'fade-in').withIcon('fa-info-circle');
            }
            return {
                success: true,
                score: 2
            };
        }
        return {
            success: true,
            score: 3
        };
    };
    return Suite;
}());
exports.Suite = Suite;
//# sourceMappingURL=suite.js.map