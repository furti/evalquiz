/// <reference path="./../index.d.ts" />

export class Engine {

    testBasic(context: engine.Context): void {
        this.execute(context, 1, 2, 3);
    }

    testNegative(context: engine.Context): void {
        this.execute(context, -1, -2, -3);
    }

    execute(context: engine.Context, a: number, b: number, expected: number): void {
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


