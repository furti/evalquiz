/// <reference path="./index.d.ts" />

import {ConsoleService, ConsoleBlock} from './console.service';
import {Riddle} from './riddle';

export interface Result {
    riddle: Riddle;
    score: number;
    message?: string;
}


export class RiddleTestResult implements engine.Result {

    static success(message?: string): engine.Result {
        return new RiddleTestResult(true, message);
    }

    static failure(message?: string): engine.Result {
        return new RiddleTestResult(false, message);
    }

    constructor(public success: boolean, public message?: string) {
    }
}

export class RiddleRunner implements engine.Context {
    // for tests see: http://esprima.org/demo/parse.html

    private engineFactory: Function;
    private fnFactoryArgs: string[];
    private fnFactory: Function;
    private tree: ESTree.Program;

    constructor(private $q: angular.IQService, private $timeout: ng.ITimeoutService, private consoleService: ConsoleService, private riddle: Riddle) {
        let code = riddle.state.code;

        this.engineFactory = new Function(riddle.detail.engine);
        this.fnFactoryArgs = riddle.detail.api.map(member => member.name);

        let args = this.fnFactoryArgs.slice();

        args.push(code);

        this.fnFactory = new Function(...args);
        this.tree = esprima.parse(code);
    }

    execute(): angular.IPromise<Result> {
        let deferred = this.$q.defer<Result>();

        try {
            console.log("factory: %o", this.engineFactory);

            let engine = this.engineFactory();

            console.log("engine: %o", engine);

            // this.riddle.detail.test

            // let solve = this.parseCode(riddle);
            // let syntax = this.analyzeCode(riddle);
            // let engine = this.buildEngine(riddle);

            // this.consoleService.block().markdown('Initializing engine ...');

            // engine.init();

            // this.consoleService.block().markdown('Starting tests ...');

            // let score = engine.run(solve, syntax);

            // let result = {
            //     riddle,
            //     score,
            //     message: 'TODO FIXME WRITEME HATEME KILLME IGNOREME'
            // }

            // deferred.resolve(result);
        }
        catch (err) {
            deferred.reject(err);
        }

        return deferred.promise;
    }

    buildFn(...fnFactoryParams: any[]): Function {
        if (fnFactoryParams.length != this.fnFactoryArgs.length) {
            throw new Error('Invalid number of arguments for building function. Expected arguments: ' + 
                this.fnFactoryArgs.join(', '));
        }

        return this.fnFactory(fnFactoryParams);
    }

    invokeFn(fn: Function, ...fnParams: any[]): any {
        return fn(fnParams);
    }

    public countTypes(...types: string[]): number {
        var count = 0;

        this.crawl(this.tree, function (node: any) {
            if (types.indexOf(node.type) >= 0) {
                count++;
            }
        });

        return count;
    }

    public countLoops(): number {
        return this.countTypes('ForStatement', 'WhileStatement', 'DoWhileStatement');
    }

    public countConditions(): number {
        return this.countTypes('IfStatement', 'SwitchStatement', 'ConditionalExpression');
    }

    public countCalculations(): number {
        return this.countTypes('BinaryExpression', 'AssignmentExpression');
    }

    public countLogicals(): number {
        return this.countTypes('LogicalExpression');
    }

    public countStatements(): number {
        return this.countTypes('ForStatement', 'WhileStatement', 'DoWhileStatement', 'IfStatement', 'SwitchStatement', 'ExpressionStatement', 'ReturnStatement');
    }

    public countOperators(...operators: string[]): number {
        var count = 0;

        this.crawl(this.tree, function (node: any) {
            if ((node.type == 'BinaryExpression') || (node.type == 'UpdateExpression') || (node.type == 'AssignmentExpression')) {
                if (operators.indexOf(node.operator) >= 0) {
                    count++;
                }
            }
        });

        return count;
    }

    private crawl(node: any, callback: any): void {
        if (node instanceof Array) {
            for (var i = 0; i < node.length; i++) {
                this.crawl(node[i], callback);
            }
        }
        else {
            callback(node);

            if (node.body) {
                this.crawl(node.body, callback);
            }

            if (node.test) {
                this.crawl(node.test, callback);
            }

            if (node.left) {
                this.crawl(node.left, callback);
            }

            if (node.right) {
                this.crawl(node.right, callback);
            }

            if (node.consequent) {
                this.crawl(node.consequent, callback);
            }

            if (node.expression) {
                this.crawl(node.expression, callback);
            }

            if (node.argument) {
                this.crawl(node.argument, callback);
            }

            if (node.arguments) {
                this.crawl(node.arguments, callback);
            }

            if (node.declaration) {
                this.crawl(node.declaration, callback);
            }
        }
    }
}
