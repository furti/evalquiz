(function () {
    // In memoriam Sir Terry Pratchett

    function Engine() {
    }

    Engine.prototype.init = function () {
        this.contents = ['Apples and pears', 'Bananas for the monk...err... I mean ape', 'Carrots... no not you Carrot', 'Dates', 'Eggs', 
            'Figs', 'Ghlen Livid bottles', 'Hemp - a lot of hemp', 'Iconographs', 'Jimkin Bearhugger\'s Whiskey', 'Klatchian Coffee', 
            'Luggage! Stop eating me!', 'Magical ingredients', null, 'Onions', 'Peeled Nuts', 'Quantum Weather Butterflies', 'Rats for the Iron Helmet', 
            'Scythes! Who needs scythes in the city?', 'Tea from the Counterweight Continent', undefined, 'Very Old Peculiar Brandy from Bentinck\'s',
            'Watermelon (square shaped)', 'Xiguas', 'Ziziphus trees'
        ];
    };

    Engine.prototype.solvedMessage = function(score) {
        if (score < 3) {
            return "";
        }

        var result = 'Nobbys list: ';

        for (var i=0; i<this.results.length; i++) {
            if (i > 0) {
                result += ', ';
            }

            result += this.results[i];
        }

        result += '.';

        return result;
    };

    Engine.prototype.failedMessage = function () {
        return 'Nobby! Please concentrate! You should write down \'' + this.failedExpected + '\' not \'' + this.failedValue + '\'!';
    };

    Engine.prototype.run = function (dictate, syntax) {
        var failed = false;

        this.results = [];

        for (var i=0; i<this.contents.length; i++) {
            var value = dictate(this.contents[i]);
            var expected = this.contents[i] || 'Nothing';

            if ((value ? value.toLowerCase() : value) !== (expected ? expected.toLowerCase() : expected)) {
                failed = true;

                this.failedValue = value;
                this.failedExpected = expected;

                break;
            }
            else {
                this.results.push(value);
            }
        }

        if (failed) {
            return 0;
        }

        var statementsCount = syntax.countStatements();

        if (statementsCount > 2) {
            return 1;
        }

        var conditionsCount = syntax.countConditions();

        if (conditionsCount > 0) {
            return 2;
        }

        return 3;
    };

    return new Engine();
})();