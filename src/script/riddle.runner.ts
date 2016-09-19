/// <reference path="./index.d.ts" />

import {ConsoleService, ConsoleBlock} from './console.service';
import {Riddle} from './riddle';
import {isPromise} from './utils';

export interface XXX {
    riddle: Riddle;
    score: number;
    message?: string;
}


// export class RiddleTestResult implements engine.Result {

//     static success(message?: string): engine.Result {
//         return new RiddleTestResult(true, message);
//     }

//     static failure(message?: string): engine.Result {
//         return new RiddleTestResult(false, message);
//     }

//     constructor(public success: boolean, public message?: string) {
//     }
// }

export class RiddleRunner implements engine.Context {
    // for tests see: http://esprima.org/demo/parse.html

    private engineFactory: Function;
    private fnWrapperArgs: string[];
    private fnWrapper: Function;
    private tree: ESTree.Program;

    private deferred: angular.IDeferred<XXX>;
    private engine: any;
    private testFns: (() => engine.Result | angular.IPromise<engine.Result>)[];

    constructor(private $q: angular.IQService, private $timeout: ng.ITimeoutService, private consoleService: ConsoleService, private riddle: Riddle) {
        let code = riddle.state.code;

        this.engineFactory = new Function('var exports = {};\n' + riddle.detail.engine + '\nreturn exports;');
        this.fnWrapperArgs = riddle.detail.api.map(member => member.name);

        let args = this.fnWrapperArgs.slice();

        if (this.riddle.detail.member.params) {
            args = args.concat(this.riddle.detail.member.params.map(param => param.name));
        }

        args.push(`"use strict";\n${code}\nreturn ${riddle.detail.member.name}(${riddle.detail.member.paramsString});`);

        this.fnWrapper = new Function(...args);
        this.tree = esprima.parse(code);

        console.log(this.fnWrapper);
    }

    execute(): angular.IPromise<XXX> {
        if (!this.deferred) {
            this.deferred = this.$q.defer<XXX>();

            try {
                this.prepare();
            }
            catch (err) {
                this.deferred.reject(err);
            }
        }

        if (this.testFns.length) {
            let testFn: () => engine.Result | angular.IPromise<engine.Result> = this.testFns.shift();

            try {
                this.invokeTestFn(testFn).then(result => {
                    if (result.success) {
                        this.logSuccess(result.message);
                        this.execute();
                    }
                    else {
                        this.logFailure(result.message);

                        this.deferred.resolve({
                            riddle: this.riddle,
                            score: 0,
                            message: result.message
                        });
                    }
                });
            }
            catch (err) {
                let message = `Failed to invoke test.`;
                console.error(message, err);
                throw new Error(message);
            }
        }
        else {
            this.deferred.resolve({
                riddle: this.riddle,
                score: 1,
                message: "Juhu"
            });
        }

        return this.deferred.promise;
    }

    private prepare(): void {

        try {
            this.engine = new (this.engineFactory().Engine)(this);
        }
        catch (err) {
            let message = `Failed to instantiate engine of riddle "${this.riddle.id}".`;
            console.error(message, err);
            throw new Error(message);
        }

        try {
            this.testFns = Object.getOwnPropertyNames(Object.getPrototypeOf(this.engine))
                .filter(name => name.indexOf('test') === 0)
                .map(name => this.engine[name])
                .filter(fn => typeof fn === 'function');
        }
        catch (err) {
            let message = `Failed to detect test functions of riddle "${this.riddle.id}".`;
            console.error(message, err);
            throw new Error(message);
        }

        if (this.testFns.length <= 0) {
            let message = `Failed to detect test functions of riddle "${this.riddle.id}" (name has to start with "test").`;
            console.error(message);
            throw new Error(message);
        }
    }

    private invokeTestFn(testFn: () => engine.Result | angular.IPromise<engine.Result>): angular.IPromise<engine.Result> {
        let deferred = this.$q.defer<engine.Result>();

        try {
            let result = testFn.apply(this.engine);

            if (isPromise(result)) {
                (result as angular.IPromise<engine.Result>).then(result => deferred.resolve(result), err => deferred.reject(err));
            }
            else {
                deferred.resolve(result);
            }
        }
        catch (err) {
            let message = `Test failed.`;
            console.error(message, err);
            throw new Error(message);
        }

        return deferred.promise;
    }

    invokeFn(...params: any[]): any {
        let fnParams: any[] = [];

        for (let fnWrapperArg of this.fnWrapperArgs) {
            let fnParam = this.engine[fnWrapperArg];

            if (fnParam === undefined) {
                let message = `API reference "${fnWrapperArg}" of riddle "${this.riddle.id}" is missing in engine.`;
                console.error(message);
                throw new Error(message);
            }

            fnParams.push(fnParam);
        }

        fnParams = fnParams.concat(params);

        try {
            return this.fnWrapper(...fnParams);
        }
        catch (err) {
            let message = `Failed to invoke function.`;
            console.error(message, err);
            throw new Error(message);
        }
    }

    defer<AnyType>(): angular.IDeferred<AnyType> {
        return this.$q.defer();
    }

    private logSuccess(message: string): void {
        console.log(message);
    }

    private logFailure(message: string): void {
        console.log(message);
    }

    log(obj: any, ...flags: string[]): void {
    }

    print(obj: any, ...flags: string[]): void {
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
