/// <reference path="./../index.d.ts" />

export class Suite {

    private faster = false;
    private correct = false;

    constructor(private context: suite.Context) {
    }

    log(message: any): void {
        this.context.log(message);
    }

    testInit(): angular.IPromise<suite.Result> {
        let deferred = this.context.defer<suite.Result>();
        let score = 0;
        let message: string;
        var loopCount = this.context.countTypes('ForStatement', 'WhileStatement', 'DoWhileStatement');

        if (loopCount > 0) {
            score = 1;
        }
        else {
            var multCount = this.context.countOperators('*', '*=');

            this.faster = true;

            score = multCount > 0 ? 2 : 3;
        }

        this.context.postpone(0.3, () => {
            this.context.log("Let's see if Carly can beat his teacher:");

            return this.context.postpone(0.3, () => undefined);
        }).then(() => {
            deferred.resolve({
                success: score > 0,
                score,
                message
            });
        });

        return deferred.promise;
    }

    testBasic(): angular.IPromise<suite.Result> {
        return this.execute(3, '1', ' + ', '2', ' + ', '3', ' = ');
    }

    testEnhanced(): angular.IPromise<suite.Result> {
        return this.execute(10, '1', '+', '2', '+', '3', '+', '4', '+', '5', '+', '6', '+', '7', '+', '8', '+', '9', '+', '10', ' = ');
    }

    testRandom(): angular.IPromise<suite.Result> {
        let random = Math.round(Math.random() * 99) * 100 + 10005;
        let texts = ['1', '+', '2', '+', '3', '+', '4', '+', '5', '+', '6', '+', ' .', '.', '.', '.', '.', '.', '.', '.', '.', '.', '. ', '+',
            (random - 2).toFixed(0), '+', (random - 1).toFixed(0), '+', (random).toFixed(0), ' = '];

        return this.execute(random, ...texts);
    }

    testFinish(): suite.Result | undefined {
        if (this.context.getScore() > 1) {
            return {
                success: true,
                message: 'The full name of little Carly is [Carl Friedrich Gauss](https://en.wikipedia.org/wiki/Carl_Friedrich_Gauss), ' +
                'a mathematician from the 19th century. ' +
                'At the age of nine he solved the task with a simple multiplication.'
            };
        }
    }

    write(deferred: angular.IDeferred<undefined>, seconds: number, logItem: suite.LogItem, ...texts: string[]): angular.IPromise<undefined> {
        let text = texts.shift();

        if (!text) {
            deferred.resolve();
        }
        else {
            this.context.postpone(seconds, () => {
                logItem.write(text);
            }).then(() => this.write(deferred, 0.125, logItem, ...texts));
        }

        return deferred.promise;
    }

    execute(n: number, ...texts: string[]): angular.IPromise<suite.Result> {
        let deferred = this.context.defer();
        let logItem = this.context.log().withClass('large');
        let expected = Math.round((n + 1) * (n / 2));
        let sum: number;
        let success: boolean;

        texts.push(expected.toFixed(0));

        logItem.markdown(`Sum the numbers form \`1\` to \`${n}\`!`).addClass('info');

        this.context.postpone(0.125, () => {
            let teacher = this.context.log();
            teacher.write('Teacher: ').addClass('error');
            teacher.space();

            let carly = this.context.log();
            carly.write('Carly: ').addClass('warning');
            carly.space();

            let carlyFn = () => {
                sum = this.context.invokeFn(n);
                success = sum === expected;

                carly.write(sum);

                return this.context.postpone(0.5, () => {
                    if (success) {
                        carly.space();
                        carly.mark("ok");
                    }
                    else {
                        carly.space();
                        carly.mark("not-ok");
                    }

                    return success;
                });
            };

            if (this.faster) {
                this.context.postpone(1, carlyFn).then((correct) => {

                });
            }

            this.write(this.context.defer<undefined>(), 0.5, teacher, ...texts).then(() => {
                this.context.postpone(0.5, () => {
                    teacher.space();
                    teacher.mark("ok");
                }).then(() => {
                    if (!this.faster) {
                        this.context.postpone(1, carlyFn).then((correct) => {
                            this.context.postpone(0.5, () => {
                                if (success) {
                                    this.context.log('The teacher was faster.').withIcon('fa-info-circle').withClass('error');
                                }
                                else {
                                    this.context.log('The teacher was faster and Carly was even wrong.').withIcon('fa-times-circle').withClass('error');
                                }

                                deferred.resolve({
                                    success
                                });
                            });
                        });
                    }
                    else {
                        this.context.postpone(0.5, () => {
                            if (success) {
                                this.context.log('Carly was much faster.').withIcon('fa-info-circle').withClass('warning');
                            }
                            else {
                                this.context.log('Carly was faster, but wrong.').withIcon('fa-times-circle').withClass('error');
                            }

                            deferred.resolve({
                                success
                            });
                        });
                    }
                });
            });
        });

        return deferred.promise;
    }





    // testLarge(): angular.IPromise<suite.Result> {
    //     return this.execute(16384, 49152, 65536);
    // }

    // testZero(): angular.IPromise<suite.Result> {
    //     return this.execute(0, 0, 0);
    // }

    // testRandom(): angular.IPromise<suite.Result> {
    //     let a = Math.round(Math.random() * 1000);
    //     let b = Math.round(Math.random() * 1000);

    //     return this.execute(a, b, a + b);
    // }

    // testStatenents(): suite.Result {
    //     var statementCount = this.context.countStatements() + this.context.countVariableDeclarations();
    //     var score: number | undefined = undefined;

    //     if ((!this.failed) && (statementCount === 1)) {
    //         let logItem = this.context.log();

    //         logItem.write('The riddle was solved with only one statement.');
    //         logItem.mark('ok');

    //         score = 2;
    //     }

    //     return {
    //         success: true,
    //         score
    //     };
    // }

    // testBonusGoal(): suite.Result {
    //     var statementCount = this.context.countStatements() + this.context.countVariableDeclarations();
    //     var plusCount = this.context.countOperators('+', '++', '+=');
    //     var score: number | undefined = undefined;

    //     if ((!this.failed) && (statementCount === 1) && (plusCount === 0)) {
    //         let logItem = this.context.log();

    //         logItem.write('Bonus goal: Solved without any additions.');
    //         logItem.mark('ok');

    //         score = 3;
    //     }

    //     return {
    //         success: true,
    //         score
    //     };
    // }


}


