/// <reference path="./index.d.ts" />

import { ConsoleService, ConsoleLogItem } from './console.service';
import { Riddle } from './riddle';
import { isPromise } from './utils';
import { UIService } from './ui.service';
import { MILLIS_MULTIPLIER } from './utils';

export interface XXX {
    riddle: Riddle;
    score: number;
    messages?: string[];
}


// export class RiddleTestResult implements suite.Result {

//     static success(message?: string): suite.Result {
//         return new RiddleTestResult(true, message);
//     }

//     static failure(message?: string): suite.Result {
//         return new RiddleTestResult(false, message);
//     }

//     constructor(public success: boolean, public message?: string) {
//     }
// }

const SECONDS_BETWEEN_TESTS: number = 0.25;

export class RiddleRunner implements suite.Context {
    private suiteFactory: Function;
    private fnWrapperArgs: string[];
    private fnWrapper: Function;
    private tree: ESTree.Program;

    private deferred: angular.IDeferred<XXX>;
    private suite: any;
    private testFns: (() => suite.Result | angular.IPromise<suite.Result | undefined> | undefined)[];

    private score: number = 1;
    private messages: string[] = [];

    constructor(private $q: angular.IQService, private uiService: UIService, private consoleService: ConsoleService, private riddle: Riddle) {

        let code = riddle.state.code;
        let detail = riddle.detail!;

        this.suiteFactory = new Function('var exports = {};\n' + detail.suite + '\nreturn exports;');
        this.fnWrapperArgs = detail.api.map(member => member.name);

        let args = this.fnWrapperArgs.slice();

        if (detail.member.params) {
            args = args.concat(detail.member.params.map(param => param.name));
        }

        args.push(`"use strict";\n${code}\nreturn ${detail.member.name}(${detail.member.paramsString});`);

        this.fnWrapper = new Function(...args);
        this.tree = esprima.parse(code!);
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

        let testFn = this.testFns.shift();

        if (testFn === undefined) {
            this.deferred.resolve({
                riddle: this.riddle,
                score: this.score,
                messages: this.messages
            });

            return this.deferred.promise;
        }

        try {
            this.invokeTestFn(testFn).then(result => {
                if (result === undefined) {
                    // quiet success
                }
                else if (result.success) {
                    if (result.score && result.score > this.score && this.score > 0) {
                        this.score = result.score;
                    }

                    if (result.message) {
                        this.messages.push(result.message);
                    }
                }
                else {
                    this.score = 0;

                    if (result.message) {
                        this.messages.push(result.message);
                    }
                }

                this.uiService.postpone(SECONDS_BETWEEN_TESTS, () => this.execute());
            });
        }
        catch (err) {
            let message = `Failed to invoke test.`;
            console.error(message, err);
            throw new Error(message);
        }

        return this.deferred.promise;
    }

    private prepare(): void {

        try {
            let exports: { [key: string]: any } = this.suiteFactory();
            let keys = Object.keys(exports);

            if (keys.length !== 1) {
                throw new Error('Expected one class in suite');
            }

            this.suite = new (exports[keys[0]])(this);
        }
        catch (err) {
            let message = `Failed to instantiate suite of riddle "${this.riddle.id}".`;
            console.error(message, err);
            throw new Error(message);
        }

        try {
            this.testFns = Object.getOwnPropertyNames(Object.getPrototypeOf(this.suite))
                .filter(name => name.indexOf('test') === 0)
                .map(name => this.suite[name])
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

    private invokeTestFn(testFn: () => suite.Result | angular.IPromise<suite.Result | undefined> | undefined): angular.IPromise<suite.Result> {
        let deferred = this.$q.defer<suite.Result>();

        try {
            let result = testFn.apply(this.suite);

            if (isPromise(result)) {
                (result as angular.IPromise<suite.Result>).then(result => deferred.resolve(result), err => deferred.reject(err));
            }
            else if ((result === undefined) || (result === null)) {
                deferred.resolve({
                    success: true
                });
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
            let fnParam = (...args: any[]) => this.suite[fnWrapperArg].apply(this.suite, args);

            if (fnParam === undefined) {
                let message = `API reference "${fnWrapperArg}" of riddle "${this.riddle.id}" is missing in suite.`;
                console.error(message);
                throw new Error(message);
            }

            fnParams.push(fnParam);
        }

        fnParams = fnParams.concat(params);

        try {
            return this.fnWrapper.apply(this.fnWrapper, fnParams);
        }
        catch (err) {
            let message = `Failed to invoke function.`;
            console.error(message, err);
            throw new Error(message);
        }
    }

    defer<Any>(): angular.IDeferred<Any> {
        return this.$q.defer();
    }

    postpone<Any>(seconds: number, fn: () => Any | angular.IPromise<Any>): angular.IPromise<Any> {
        return this.uiService.postpone(seconds, fn);
    }

    log(message?: any): suite.LogItem {
        return this.consoleService.log(message);
    }

    public countTypes(...types: string[]): number {
        var count = 0;

        this.crawl(this.tree, (node: any) => {
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

    public countVariableDeclarations(): number {
        return this.countTypes('VariableDeclaration');
    }

    public countOperators(...operators: string[]): number {
        var count = 0;

        this.crawl(this.tree, (node: any) => {
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
