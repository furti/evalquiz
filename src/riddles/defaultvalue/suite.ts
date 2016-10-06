/// <reference path="./../index.d.ts" />

export class Suite {

    private readonly contents: (string | null)[] = ['Apples and pears', 'Bananas for the monk...err... I mean ape', 'Carrots... no not you Carrot!', 'Dates', '',
        'Figs', 'Ghlen Livid bottles', 'Hemp - a lot of hemp', 'Iconographs', 'Jimkin Bearhugger\'s Whiskey', 'Klatchian Coffee',
        'Luggage! Stop eating me!', 'Magical ingredients', null, 'Onions', 'Peeled Nuts', 'Quantum Weather Butterflies', 'Rats for the Iron Helmet',
        'Scythes! Who needs scythes in the city?', 'Tea from the Counterweight Continent', null, 'Very Old Peculiar Brandy from Bentinck\'s',
        'Watermelons (square shaped)', 'Xiguas', 'Ziziphus trees'
    ];

    private logItem: suite.LogItem;
    private written: any;

    constructor(private context: suite.Context) {
    }

    write(s: any): void {
        this.logItem.write(s);
        this.written = s;
    }

    testCode(): angular.IPromise<void> {
        return this.context.postpone(1, () => this.next(this.context.defer<void>(), 0));
    }

    next(deferred: angular.IDeferred<void>, i: number): angular.IPromise<void> {
        if (i >= this.contents.length) {
            deferred.resolve();
        }
        else {
            this.context.postpone(0.125, () => {
                this.logItem = this.context.log();

                let text = this.contents[i];
                let expected = text || 'Nothing';

                if (text !== expected) {
                    this.logItem.withClass('warning');
                }

                this.context.invokeFn(text);

                if (expected !== this.written) {
                    this.logItem = this.context.log().withIcon('fa-times-circle').withClass('error');
                    this.logItem.write(`Nobby! Please concentrate! You should write down \'${expected}\'!`);
                    this.context.maxScore = 0;
                }
            }).then(() => this.next(deferred, i + 1), err => deferred.reject(err));
        }

        return deferred.promise;
    }

    testStyle(): void {
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

            this.context.maxScore = 1;
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

                this.context.maxScore = 1;
                return;
            }

            this.context.maxScore = 2;
            return;
        }

        this.context.maxScore = 3;
        return;
    }
}


