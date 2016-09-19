/// <reference path="./../index.d.ts" />

export class Engine {

    constructor(private context: engine.Context) {
    }

    log(obj: any): void {
        console.log(obj);
    }

    testBasic(): angular.IPromise<engine.Result> {
        return this.execute(1, 2, 3);
    }

    testNegative(): angular.IPromise<engine.Result> {
        return this.execute(-1, -2, -3);
    }

    execute(a: number, b: number, expected: number): angular.IPromise<engine.Result> {
        let deferred = this.context.defer();
        let c = this.context.invokeFn(a, b);

        if (c === expected) {
            deferred.resolve({
                success: true,
                message: undefined
            })
        }
        else {
            deferred.resolve({
                success: false,
                message: `Expected ${expected}, but got ${c}.`
            });
        }

        return deferred.promise;


        // context.log(`${a} + ${b} = `);
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


