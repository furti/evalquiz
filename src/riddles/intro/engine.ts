/// <reference path="./../index.d.ts" />

export class Engine {

    constructor(private context: engine.Context) {
    }

    log(message: any): void {
        this.context.log(message);
    }

    txestInit(): void {
        this.context.log("Running some tests:");
    }

    testBasic(): angular.IPromise<engine.Result> {
        return this.execute(1, 2, 3);
    }

    testNegative(): angular.IPromise<engine.Result> {
        return this.execute(-1, -2, -3);
    }

    testLarge(): angular.IPromise<engine.Result> {
        return this.execute(16384, 49152, 65536);
    }

    testReal(): angular.IPromise<engine.Result> {
        return this.execute(1.2, 3.4, 4.6);
    }

    testZero(): angular.IPromise<engine.Result> {
        return this.execute(0, 0, 0);
    }

    testRandom(): angular.IPromise<engine.Result> {
        let a = Math.round(Math.random() * 1000 - 500);
        let b = Math.round(Math.random() * 1000 - 500);

        return this.execute(a, b, a + b);
    }

    execute(a: number, b: number, expected: number): angular.IPromise<engine.Result> {
        let deferred = this.context.defer();
        let logItem = this.context.log().withClass('large warning');

        logItem.write(`${a} + ${b} = `);

        this.context.postpone(0.125, () => {
            let c = this.context.invokeFn(a, b);

            this.context.postpone(0.125, () => {
                logItem.write(c);

                this.context.postpone(0.5, () => {
                    if (c === expected) {
                        logItem.withClass('large success');
                        logItem.space();
                        logItem.icon('fa-check');

                        deferred.resolve({
                            success: true,
                            message: undefined
                        });
                    }
                    else {
                        logItem.withClass('large error');
                        logItem.space();
                        logItem.icon('fa-times');

                        deferred.resolve({
                            success: false,
                            message: `Expected ${expected}, but got ${c}.`
                        });
                    }
                });
            });
        });

        return deferred.promise;


        // context.logThinking();

        // context.postpone(0.5, () => {
        //     let fn = context.buildFn();
        //     let c: any = context.invokeFn(fn, a, b);

        //     context.log(`${c} `)

        //     if (c === expected) {
        //         context.logOk();
        //         context.success();
        //     }
        //     else {
        //         context.logError();
        //         context.failure(`The sum of ${a} and ${b} should be: ${a + b}.`);
        //     }
        // });

    }


}


