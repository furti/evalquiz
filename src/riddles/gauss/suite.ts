/// <reference path="./../index.d.ts" />

export class Suite {

    private quiet = false;
    private faster = false;
    private correct = false;

    constructor(private context: suite.Context) {
    }

    log(message: any): void {
        this.context.log({
            content: message,
            type: 'plain'
        });
    }

    testInit(): angular.IPromise<void> {
        let deferred = this.context.defer<void>();
        var loopCount = this.context.countTypes('ForStatement', 'WhileStatement', 'DoWhileStatement');

        if (loopCount > 0) {
            this.context.maxScore = 1;
        }
        else {
            var multCount = this.context.countOperators('*', '*=');

            this.faster = true;
            this.context.maxScore = multCount > 0 ? 2 : 3;
        }

        return this.context.postpone(0.3, () => {
            this.context.log("Let's see if Carly can beat his teacher:");

            return this.context.postpone<void>(0.3);
        });
    }

    testBasic(): angular.IPromise<void> {
        return this.execute(3, '1', ' + ', '2', ' + ', '3', ' = ');
    }

    testEnhanced(): angular.IPromise<void> {
        return this.execute(10, '1', '+', '2', '+', '3', '+', '4', '+', '5', '+', '6', '+', '7', '+', '8', '+', '9', '+', '10', ' = ');
    }

    testRandom(): angular.IPromise<void> {
        this.quiet = true;

        let n = 10005 + Math.round(Math.random() * 1000);

        for (let i = 0; i < 1000; i++) {
            let expected = Math.round((n + 1) * (n / 2));
            let result = this.context.invokeFn(n);

            if (expected !== result) {
                break;
            }

            n += 19;
        }

        this.quiet = false;

        let texts = ['1', '+', '2', '+', '3', '+', '4', '+', '5', '+', '6', '+', ' .', '.', '.', '.', '.', '.', '.', '.', '.', '.', '. ', '+',
            (n - 2).toFixed(0), '+', (n - 1).toFixed(0), '+', (n).toFixed(0), ' = '];

        return this.execute(n, ...texts);
    }

    testFinish(): void {
        if (this.context.maxScore >= 2) {
            this.context.message({
                content: 'The full name of little Carly is [Carl Friedrich Gauss](https://en.wikipedia.org/wiki/Carl_Friedrich_Gauss), ' +
                'a mathematician from the 19th century. ' +
                'At the age of nine he solved the task with a simple multiplication.',
                type: 'markdown',
                icon: 'fa-info-circle',
                classname: 'info'
            });
        }
        else if (this.context.maxScore > 0) {
            this.context.message({
                content: 'Think about simplifying your loop. Do you really need it?',
                type: 'markdown',
                icon: 'fa-info-circle',
                classname: 'warning'
            });
        }
    }

    write(deferred: angular.IDeferred<void>, seconds: number, logItem: suite.LogItem, ...texts: string[]): angular.IPromise<void> {
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

    execute(n: number, ...texts: string[]): angular.IPromise<void> {
        let deferred = this.context.defer<void>();
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
                                    this.context.maxScore = 0;
                                }
                                deferred.resolve();
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
                                this.context.maxScore = 0;
                            }
                            deferred.resolve();
                        });
                    }
                });
            });
        });

        return deferred.promise;
    }
}


