/// <reference path="./../index.d.ts" />

export class Suite {

    private failed = false;

    constructor(private context: suite.Context) {
    }

    log(message: any): void {
        this.context.log(message);
    }

    testInit(): angular.IPromise<undefined> {
        return this.context.postpone(0.5, () => {
            this.context.log("Let's perform some tests on your precious masterpiece:");

            return this.context.postpone(1, () => undefined);
        });
    }

    testBasic(): angular.IPromise<suite.Result> {
        return this.execute(1, 2, 3);
    }

    // testNegative(): angular.IPromise<suite.Result> {
    //     return this.execute(-1, -2, -3);
    // }

    testLarge(): angular.IPromise<suite.Result> {
        return this.execute(16384, 49152, 65536);
    }

    // testReal(): angular.IPromise<suite.Result> {
    //     return this.execute(1.2, 3.4, 4.6);
    // }

    testZero(): angular.IPromise<suite.Result> {
        return this.execute(0, 0, 0);
    }

    testRandom(): angular.IPromise<suite.Result> {
        let a = Math.round(Math.random() * 1000);
        let b = Math.round(Math.random() * 1000);

        return this.execute(a, b, a + b);
    }

    testStatenents(): suite.Result {
        var statementCount = this.context.countStatements() + this.context.countVariableDeclarations();
        var score: number | undefined = undefined;

        if ((!this.failed) && (statementCount === 1)) {
            let logItem = this.context.log();

            logItem.write('The riddle was solved with only one statement.');
            logItem.mark('ok');

            score = 2;
        }

        return {
            success: true,
            score
        };
    }

    testBonusGoal(): suite.Result {
        var statementCount = this.context.countStatements() + this.context.countVariableDeclarations();
        var plusCount = this.context.countOperators('+', '++', '+=');
        var score: number | undefined = undefined;

        if ((!this.failed) && (statementCount === 1) && (plusCount === 0)) {
            let logItem = this.context.log();

            logItem.write('Bonus goal: Solved without any additions.');
            logItem.mark('ok');

            score = 3;
        }

        return {
            success: true,
            score
        };
    }

    execute(a: number, b: number, expected: number): angular.IPromise<suite.Result> {
        let deferred = this.context.defer();
        let logItem = this.context.log().withClass('large');

        logItem.write(`${a} + ${b} = `).addClass('info');

        this.context.postpone(0.125, () => {
            let c = this.context.invokeFn(a, b);

            this.context.postpone(0.125, () => {
                logItem.write(c);

                this.context.postpone(0.125, () => {
                    if (c === expected) {
                        logItem.space();
                        logItem.mark("ok");

                        deferred.resolve({
                            success: true
                        });
                    }
                    else {
                        this.failed = true;
                        
                        logItem.space();
                        logItem.mark("not-ok");

                        deferred.resolve({
                            success: false
                        });
                    }
                });
            });
        });

        return deferred.promise;
    }


}


