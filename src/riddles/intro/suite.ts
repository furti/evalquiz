/// <reference path="./../index.d.ts" />

export class Suite {

    constructor(private context: suite.Context) {
    }

    log(message: any): void {
        this.context.log({
            content: message,
            type: 'plain'
        });
    }

    testInit(): angular.IPromise<undefined> {
        return this.context.postpone(0.5, () => {
            this.context.log('Let\'s perform some tests on your precious masterpiece:');

            return this.context.postpone(1, () => undefined);
        });
    }

    testBasic(): angular.IPromise<void> {
        return this.execute(1, 2, 3);
    }

    testLarge(): angular.IPromise<void> {
        return this.execute(16384, 49152, 65536);
    }

    testZero(): angular.IPromise<void> {
        return this.execute(0, 0, 0);
    }

    testRandom(): angular.IPromise<void> {
        let a = Math.round(Math.random() * 1000);
        let b = Math.round(Math.random() * 1000);

        return this.execute(a, b, a + b);
    }

    execute(a: number, b: number, expected: number): angular.IPromise<void> {
        let deferred = this.context.defer<void>();
        let logItem = this.context.log().withClass('large');

        logItem.write(`${a} + ${b} = `).addClass('info');

        this.context.postpone(0.125, () => {
            let c = this.context.invokeFn(a, b);

            this.context.postpone(0.125, () => {
                logItem.write(c);

                this.context.postpone(0.125, () => {
                    logItem.space();

                    if (c === expected) {
                        logItem.mark("ok");
                    }
                    else {
                        logItem.mark("not-ok");
                        this.context.score = 0;
                    }

                    deferred.resolve();
                }).catch(err => deferred.reject);
            }).catch(err => deferred.reject);
        }).catch(err => deferred.reject);

        return deferred.promise;
    }

    testStatements(): void {
        if (this.context.isFaulty()) {
            return;
        }

        var statementCount = this.context.countStatements() + this.context.countVariableDeclarations();
        var score: number | undefined;

        if (statementCount === 1) {
            let logItem = this.context.log();

            logItem.write('The riddle was solved with only one statement.');
            logItem.mark('ok');
        }
        else {
            this.context.score = 1;
        }
    }

    testBonusGoal(): void {
        if (this.context.isFaulty()) {
            return;
        }

        var statementCount = this.context.countStatements() + this.context.countVariableDeclarations();
        var plusCount = this.context.countOperators('+', '++', '+=');
        var score: number | undefined;

        if (statementCount === 1 && plusCount === 0) {
            let logItem = this.context.log();

            logItem.write('Bonus goal: Solved without any additions.');
            logItem.mark('ok');
        }
        else
            this.context.score = 2;
    }
}


