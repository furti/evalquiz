/// <reference path="./index.d.ts" />

import { ConsoleService, ConsoleLogItem } from './console.service';
import { Riddle } from './riddle';
import { isPromise } from './utils';
import { UIService } from './ui.service';
import { MILLIS_MULTIPLIER } from './utils';

export const CANCELED = "Execution canceled.";

export interface XXX {
    riddle: Riddle;
    canceled: boolean;
    score: number;
    messages: string[];
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

    private executeDeferred: angular.IDeferred<XXX> | null;
    private suite: any;
    private testFns: (() => suite.Result | angular.IPromise<suite.Result | undefined> | undefined)[];

    private _score: number = 1;
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

    /**
     * Returns true if the test are currently running.
     * 
     * @readonly
     * @type {boolean}
     * @memberOf RiddleRunner
     */
    get running(): boolean {
        return !!this.executeDeferred;
    }

    /**
     * Checks if the tests are still running
     * 
     * @memberOf RiddleRunner
     */
    checkRunning(): void {
        if (!this.running) {
            throw CANCELED;
        }
    }

    /**
     * Resolves the promise returned by the execute method.
     * 
     * @private
     * 
     * @memberOf RiddleRunner
     */
    finish(): void {
        if (!this.executeDeferred) {
            return;
        }

        this.executeDeferred.resolve({
            riddle: this.riddle,
            canceled: false,
            score: this._score,
            messages: this.messages
        });

        this.executeDeferred = null;
    }

    /**
     * Resolved the promise returned by the execute method.
     * 
     * @memberOf RiddleRunner
     */
    cancel(): void {
        if (!this.executeDeferred) {
            return;
        }

        this.executeDeferred.resolve({
            riddle: this.riddle,
            canceled: true,
            score: 0,
            messages: this.messages
        });

        this.executeDeferred = null;
    }

    /**
     * Executes the test suite.
     * 
     * @returns {angular.IPromise<XXX>}
     * 
     * @memberOf RiddleRunner
     */
    execute(): angular.IPromise<XXX> {
        if (this.running) {
            throw new Error('Already running.');
        }

        this.executeDeferred = this.$q.defer<XXX>();

        try {
            this.prepare();
        }
        catch (err) {
            this.executeDeferred.reject(err);
        }

        this.executeNextTestFn();

        return this.executeDeferred.promise;
    }

    /**
     * Executes the next next, if there is any. 
     * 
     * @private
     * 
     * @memberOf RiddleRunner
     */
    private executeNextTestFn(): void {
        let testFn = this.testFns.shift();

        if (testFn === undefined) {
            this.finish();
            return;
        }

        this.invokeTestFn(testFn).then(result => {
            if (result === undefined) {
                // quiet success
            }
            else if (result.success) {
                if (result.score && result.score > this._score && this._score > 0) {
                    this._score = result.score;
                }

                if (result.message) {
                    this.addMessage(result.message);
                }
            }
            else {
                this._score = 0;

                if (result.message) {
                    this.addMessage(result.message);
                }
            }

            this.uiService.postpone(SECONDS_BETWEEN_TESTS, () => this.executeNextTestFn());
        }, err => {
            this.cancel();
        });
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

    /**
     * Invokes the specified test function of the test suite. If the returned promise gets resolved, the 
     * tests should continue with the next test function. If the returned promise gets rejected, the 
     * tests should be aborted. 
     * 
     * @private
     * @param {(() => suite.Result | angular.IPromise<suite.Result | undefined> | undefined)} testFn the test function
     * @returns {angular.IPromise<suite.Result>} a promise for the result
     * 
     * @memberOf RiddleRunner
     */
    private invokeTestFn(testFn: () => suite.Result | angular.IPromise<suite.Result | undefined> | undefined): angular.IPromise<suite.Result> {
        let deferred = this.$q.defer<suite.Result>();

        try {
            this.checkRunning();

            let result = testFn.apply(this.suite);

            this.checkRunning();

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
            if (err === CANCELED) {
                deferred.reject(err);
            }
            else {
                let message = `Unhandled error in test: ${err}`;
                console.error(message, err);
                this.log(message).withClass('error').withIcon('fa-times-circle');
                deferred.reject(err);
            }
        }

        return deferred.promise;
    }

    /**
     * Invokes the riddle function using the specified parameters. Use this function to call the riddle function in your tests.
     * 
     * @param {...any[]} params the parameters
     * @returns {*} the result of the function call
     * 
     * @memberOf RiddleRunner
     */
    invokeFn(...params: any[]): any {
        this.checkRunning();

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
            if (err === CANCELED) {
                throw err;
            }
            else {
                let message = `Unhandled error in riddle function: ${err}`;
                console.error(message, err);
                this.log(message).withClass('error').withIcon('fa-times-circle');
                throw new Error(message);
            }
        }
    }

    defer<Any>(): angular.IDeferred<Any> {
        this.checkRunning();

        return this.$q.defer();
    }

    postpone<Any>(seconds: number, fn: () => Any | angular.IPromise<Any>): angular.IPromise<Any> {
        this.checkRunning();

        return this.uiService.postpone(seconds, fn);
    }

    sequence<Any>(...secondsOrStep: (number | (() => any | angular.IPromise<any>))[]): angular.IPromise<Any> {
        this.checkRunning();

        return this.sequenceStep<Any>(this.defer<Any>(), undefined, ...secondsOrStep);
    }

    private sequenceStep<Any>(deferred: angular.IDeferred<Any>, result: any, ...secondsOrStep: (number | (() => any | angular.IPromise<any>))[]): angular.IPromise<Any> {
        try {
            this.checkRunning();

            let remaining = secondsOrStep.slice();
            let item = remaining.shift();

            if (item === undefined) {
                deferred.resolve(result);
                return deferred.promise;
            }

            if (typeof item === 'number') {
                this.postpone(item as number, () => { }).then(() => this.sequenceStep(deferred, result, ...remaining), err => deferred.reject(err));
                return deferred.promise;
            }

            let itemResult = item();

            if (itemResult !== undefined) {
                result = itemResult;
            }

            if (isPromise(result)) {
                (result as angular.IPromise<any>).then(() => this.sequenceStep(deferred, result, ...remaining), err => deferred.reject(err));
            }
            else {
                this.sequenceStep(deferred, result, ...remaining);
            }
        }
        catch (err) {
            if (err === CANCELED) {
                deferred.reject(err);
            }
            else {
                let message = `Unhandled error in sequence: ${err}`;
                console.error(message, err);
                this.log(message).withClass('error').withIcon('fa-times-circle');
                deferred.reject(err);
            }
        }

        return deferred.promise;
    }

    map<Item, Result>(source: (Item | undefined | null)[] | undefined | null, fn: (item: Item | undefined | null) => angular.IPromise<Result> | Result | undefined | null): angular.IPromise<(Result | undefined | null)[] | undefined | null> {
        let deferred = this.defer<(Result | undefined | null)[] | undefined | null>();

        if (source === undefined) {
            deferred.resolve(undefined);
        }
        else if (source === null) {
            deferred.resolve(null);
        }
        else if (!source.length) {
            deferred.resolve([]);
        }
        else {
            let target: Result[] = [];

            this.mapStep(deferred, source, 0, target, fn);
        }

        return deferred.promise;
    }

    private mapStep<Item, Result>(deferred: angular.IDeferred<(Result | undefined | null)[]>, source: (Item | undefined | null)[], sourceIndex: number, target: (Result | undefined | null)[], fn: (item: Item | undefined | null) => angular.IPromise<Result> | Result | undefined | null): void {
        if (sourceIndex >= source.length) {
            deferred.resolve(target);
            return;
        }

        try {
            let result = fn(source[sourceIndex]);

            if (isPromise(result)) {
                (result as angular.IPromise<Result>).then(r => {
                    target.push(r);
                    this.mapStep(deferred, source, sourceIndex + 1, target, fn);
                }, err => deferred.reject(err));
            }
            else {
                target.push(result as (Result | undefined | null));
                this.mapStep(deferred, source, sourceIndex + 1, target, fn);
            }
        }
        catch (err) {
            if (err === CANCELED) {
                deferred.reject(err);
            }
            else {
                let message = `Unhandled error in map: ${err}`;
                console.error(message, err);
                this.log(message).withClass('error').withIcon('fa-times-circle');
                deferred.reject(err);
            }
        }
    }

    log(message?: any): suite.LogItem {
        return this.consoleService.log(message);
    }

    countTypes(...types: string[]): number {
        var count = 0;

        this.crawl(this.tree, (node: any) => {
            if (types.indexOf(node.type) >= 0) {
                count++;
            }
        });

        return count;
    }

    countLoops(): number {
        return this.countTypes('ForStatement', 'WhileStatement', 'DoWhileStatement');
    }

    countConditions(): number {
        return this.countTypes('IfStatement', 'SwitchStatement', 'ConditionalExpression');
    }

    countCalculations(): number {
        return this.countTypes('BinaryExpression', 'AssignmentExpression');
    }

    countIdentifiers(...identifiers: string[]): number {
        var count = 0;

        this.crawl(this.tree, (node: any) => {
            if (node.type === 'Identifier') {
                if (!identifiers.length || identifiers.indexOf(node.name) >= 0) {
                    count++;
                }
            }
            else if (node.type === 'Literal' && node.name === 'null') {
                if (!identifiers.length || identifiers.indexOf(node.name) >= 0) {
                    count++;
                }
            }
        });

        return count;
    }

    countLogicals(): number {
        return this.countTypes('LogicalExpression');
    }

    countStatements(): number {
        return this.countTypes('ForStatement', 'WhileStatement', 'DoWhileStatement', 'IfStatement', 'SwitchStatement', 'ExpressionStatement', 'ReturnStatement');
    }

    countVariableDeclarations(): number {
        return this.countTypes('VariableDeclaration');
    }

    countOperators(...operators: string[]): number {
        var count = 0;

        this.crawl(this.tree, (node: any) => {
            if ((node.type === 'BinaryExpression') || (node.type === 'UpdateExpression') || (node.type === 'AssignmentExpression')) {
                if (!operators.length || operators.indexOf(node.operator) >= 0) {
                    count++;
                }
            }
        });

        return count;
    }

    private crawl(node: any, callback: (node: any) => void): void {
        if (node instanceof Array) {
            for (var i = 0; i < node.length; i++) {
                this.crawl(node[i], callback);
            }
        }
        else {
            callback(node);

            // console.log(node);

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

    addMessage(message: string): void {
        if (this.messages.indexOf(message) < 0) {
            this.messages.push(message);
        }
    }

    isSucess(): boolean {
        return this._score >= 1;
    }

    isFailure(): boolean {
        return this._score < 1;
    }

    getScore(): number {
        return this._score;
    }

}
