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

    draw(f: number): void {

    }

}

