/// <reference path="./index.d.ts" />

import { ConsoleService, ConsoleLogItem } from './console.service';
import { Riddle } from './riddle';
import { isPromise } from './utils';
import { UIService } from './ui.service';
import { MILLIS_MULTIPLIER } from './utils';

import * as esprima from 'esprima';
import * as esmangle from 'esmangle';
import * as escodegen from 'escodegen';

export const ABORTED = 'Execution aborted.';
export const SKIPPED = 'Test skipped.';
export const INSTRUMENTATION_CALLBACK = '___'

export interface XXX {
    riddle: Riddle;
    aborted: boolean;
    score: number;
    messages: suite.Message[];
}

const SECONDS_BETWEEN_TESTS: number = 0.25;

export class RiddleRunner implements suite.Context {
    private code: string;

    private suiteFactory: Function;
    private fnWrapperArgs: string[];

    private _fnWrapper: Function;
    private _fnInstrumentedWrapper: Function;
    private _ast: ESTree.Program;
    private _mangledCode: string;
    private _instrumentedCode: string;

    private invocationId: number;
    private invocationCount: { [id: number]: number };

    private executeDeferred: angular.IDeferred<XXX> | undefined;
    private suite: any;
    private testFns: (() => void | angular.IPromise<void>)[];

    private _aborted: boolean = false;
    private _skipped: boolean = false;
    private _optional: boolean = true;
    private _quiet: boolean = false;
    private _maxScore: number = 3;
    private _lastSkipped: boolean = false;
    private _lastMaxScore: number = 3;
    private messages: suite.Message[] = [];

    constructor(private $q: angular.IQService, private uiService: UIService, private consoleService: ConsoleService, private riddle: Riddle) {
        this.code = riddle.state.code!;

        let detail = riddle.detail!;

        this.suiteFactory = new Function('var exports = {};\n' + detail.suite + '\nreturn exports;');
        this.fnWrapperArgs = [];

        detail.api.forEach(member => {
            if (this.fnWrapperArgs.indexOf(member.name) < 0) {
                this.fnWrapperArgs.push(member.name)
            }
        });
    }

    /**
     * Returns the riddle function packed into it's wrapper.
     * 
     *   function(api..., <INSTRUMENTATION_CALLBACK>, params...) {
     *     "use strict";
     *     return riddleFunction(params...);
     *   }
     * 
     * @readonly
     * @type {Function} the function 
     */
    get fnWrapper(): Function {
        if (this._fnWrapper) {
            return this._fnWrapper;
        }

        let detail = this.riddle.detail!;
        let args = this.fnWrapperArgs.slice();

        if (detail.member.params) {
            args = args.concat(detail.member.params.map(param => param.name));
        }

        args.push(`"use strict";\n${this.code}\nreturn ${detail.member.name}(${detail.member.paramsString});`);

        return this._fnWrapper = new Function(...args);
    }

    /**
     * Returns the riddle function packed into it's wrapper with intrumented code.
     * 
     *   function(api..., params...) {
     *     "use strict";
     *     return riddleFunction(params...);
     *   }
     * 
     * @readonly
     * @type {Function} the function 
     */
    get fnInstrumentedWrapper(): Function {
        if (this._fnInstrumentedWrapper) {
            return this._fnInstrumentedWrapper;
        }

        let detail = this.riddle.detail!;
        let args = this.fnWrapperArgs.slice();

        args.push(INSTRUMENTATION_CALLBACK);

        if (detail.member.params) {
            args = args.concat(detail.member.params.map(param => param.name));
        }

        args.push(`"use strict";\n${this.instrumentedCode}\nreturn ${detail.member.name}(${detail.member.paramsString});`);

        return this._fnInstrumentedWrapper = new Function(...args);
    }


    /**
     * Returns true if the suite is still running
     * 
     * @returns {boolean} true if running
     */
    isRunning(): boolean {
        return this.executeDeferred !== undefined;
    }

    /**
     * Finished the execution of the suite. Resolves the promise returned by the execute method.
     */
    finish(): void {
        if (!this.executeDeferred) {
            return;
        }

        this.executeDeferred.resolve({
            riddle: this.riddle,
            aborted: this._aborted,
            score: this._maxScore,
            messages: this.messages
        });

        this.executeDeferred = undefined;
    }

    /**
     * Aborts the execution of the suite. Resolves the promise returned by the execute method.
     */
    abort(): void {
        this._aborted = true;
        this._maxScore = 0;

        this.finish();
    }

    /**
     * Executes the test suite.
     * 
     * @returns {angular.IPromise<XXX>}
     */
    execute(): angular.IPromise<XXX> {
        if (this.isRunning()) {
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

    private prepare(): void {
        try {
            let exports: { [key: string]: any } = this.suiteFactory();
            let suiteClass = exports['Suite'];

            if (!suiteClass) {
                let keys = Object.keys(exports);

                if (keys.length < 1) {
                    throw new Error('Expected at least one class in suite');
                }

                suiteClass = exports[keys[0]];
            }

            this.suite = new (suiteClass)(this);
        }
        catch (err) {
            console.error(`Failed to instantiate suite of riddle "${this.riddle.id}":`, err);
            throw err;
        }

        try {
            this.testFns = Object.getOwnPropertyNames(Object.getPrototypeOf(this.suite))
                .filter(name => name.indexOf('test') === 0)
                .map(name => this.suite[name])
                .filter(fn => typeof fn === 'function');
        }
        catch (err) {
            console.error(`Failed to detect test functions of riddle "${this.riddle.id}":`, err);
            throw err;
        }

        if (this.testFns.length <= 0) {
            let message = `Failed to detect test functions of riddle "${this.riddle.id}" (name has to start with "test").`;
            console.error(message);
            throw new Error(message);
        }
    }

    /**
     * Aborts the execution of the suite. Resolves the promise returned by the execute method.
     */
    fail(): void {
        if (this.optional) {
            this.skip();
        }
        else {
            this.abort();
        }
    }


    skip(): void {
        this._skipped = true;
        this._maxScore = 0;
    }

    isSkipped(): boolean {
        return this._skipped;
    }

    get optional(): boolean {
        return this._optional;
    }

    set optional(optional: boolean) {
        if (this._optional === optional) {
            return;
        }

        if (!this._optional) {
            this._lastSkipped = this._skipped;
            this._lastMaxScore = this._maxScore;
        }

        this._optional = optional;

        if (!optional) {
            this._skipped = this._lastSkipped;
            this._maxScore = this._lastMaxScore;
        }
    }

    get quiet(): boolean {
        return this._quiet;
    }

    set quiet(quiet: boolean) {
        this._quiet = quiet;
    }

    /**
     * Executes the next next, if there is any. 
     * 
     * @private
     * 
     * @memberOf RiddleRunner
     */
    private executeNextTestFn(): void {
        this._skipped = false;
        this._optional = false;
        this._quiet = false;

        let testFn = this.testFns.shift();

        if (testFn === undefined) {
            this.finish();
            return;
        }

        this.invokeTestFn(testFn).then(() => this.uiService.postpone(SECONDS_BETWEEN_TESTS, () => this.executeNextTestFn()), err => this.fail());
    }

    /**
     * Invokes the specified test function of the test suite. If the returned promise gets resolved, the 
     * tests should continue with the next test function. If the returned promise gets rejected, the 
     * tests should be aborted. 
     * 
     * @param {(() => void | angular.IPromise<void>)} testFn testFn the test function
     * @returns {angular.IPromise<void>} a promise for the result
     */
    private invokeTestFn(testFn: () => void | angular.IPromise<void>): angular.IPromise<void> {
        let deferred: angular.IDeferred<void> = this.$q.defer<void>();

        try {
            this.check();

            let result = testFn.apply(this.suite);

            this.check();

            if (isPromise(result)) {
                (result as angular.IPromise<void>).then(() => deferred.resolve(), err => this.handleInvokeTestFnError(err, deferred));
            }
            else {
                deferred.resolve();
            }
        }
        catch (err) {
            this.handleInvokeTestFnError(err, deferred);
        }

        return deferred.promise;
    }

    private handleInvokeTestFnError(err: any, deferred: angular.IDeferred<void>) {
        if (err === ABORTED) {
            this.log({
                content: 'Execution aborted.',
                type: 'markdown',
                classname: 'error',
                icon: 'fa-times-circle'
            });
            deferred.reject(err);
        }
        else if (err === SKIPPED) {
            this.log({
                content: 'Test skipped.',
                type: 'markdown',
                classname: 'warning',
                icon: 'fa-exclamation-triangle'
            });
            deferred.resolve();
        }
        else {
            console.error('Unhandled error in test', err);
            this.log({
                content: `Unhandled error in test: ${err}`,
                type: 'markdown',
                classname: 'error',
                icon: 'fa-times-circle'
            });
            deferred.reject(err);
        }
    }

    /**
     * Checks if the tests are still running and throws error if not.
     */
    check(): void {
        if (this._aborted) {
            throw ABORTED;
        }

        if (this._skipped) {
            throw SKIPPED;
        }
    }

    /**
     * Invokes the riddle function using the specified parameters. Use this function to call the riddle function in your tests.
     * 
     * @param {...any[]} params the parameters
     * @returns {*} the result of the function call
     */
    invokeFn(...params: any[]): any {
        return this.invokeFnInternal(true, ...params);
    }

    /**
     * Invokes the riddle function using the specified parameters. Use this function to call the riddle function in your tests.
     * Uses the instrumented code. 
     * 
     * @param {...any[]} params the parameters
     * @returns {*} the result of the function call
     */
    invokeInstrumentedFn(...params: any[]): any {
        return this.invokeFnInternal(true, ...params);
    }

    private invokeFnInternal(instrumented: boolean, ...params: any[]): any {
        this.check();

        let fnParams: any[] = [];

        for (let fnWrapperArg of this.fnWrapperArgs) {
            if (this.suite[fnWrapperArg] === undefined) {
                let message = `API reference "${fnWrapperArg}" of riddle "${this.riddle.id}" is missing in suite.`;
                console.error(message);
                throw new Error(message);
            }

            fnParams.push((...args: any[]) => {

                try {
                    this.check();

                    let result = this.suite[fnWrapperArg].apply(this.suite, args);

                    this.check();

                    return result;
                }
                catch (err) {
                    if (err === ABORTED || err === SKIPPED) {
                        throw err;
                    }
                    else {
                        let message = `Unhandled error in API function "${fnWrapperArg}": `;
                        console.error(message, err);

                        if (!this.quiet) {
                            this.log(message + err).withClass('error').withIcon('fa-times-circle');
                        }

                        this.fail();
                        throw err;
                    }
                }
            });
        }

        if (instrumented) {
            fnParams.push((id: number, that: any, fn: Function) => this.incrementInvocationCount(id, that, fn));
        }

        fnParams = fnParams.concat(params);

        try {
            this.invocationCount = {};

            if (instrumented) {
                return this.fnInstrumentedWrapper.apply(this.fnWrapper, fnParams);
            }

            return this.fnWrapper.apply(this.fnWrapper, fnParams);
        }
        catch (err) {
            if (err === ABORTED || err === SKIPPED) {
                throw err;
            }
            else {
                let message = `Unhandled error in riddle function: `;
                console.error(message, err);

                if (!this.quiet) {
                    this.log(message + err).withClass('error').withIcon('fa-times-circle');
                }

                this.fail();
                throw err;
            }
        }
        finally {
            this.check();
        }
    }

    get maxScore(): number {
        return this._maxScore;
    }

    set maxScore(maxScore: number) {
        this._maxScore = Math.min(this._maxScore, maxScore);
    }

    message(message: string | suite.Message): void {
        if (typeof message === 'string') {
            message = {
                content: message
            };
        }

        if (this.messages.filter(m => (message as suite.Message).content === m.content).length > 0) {
            return;
        }

        this.messages.push(message);
    }

    log(message?: string | suite.Message): suite.LogItem {
        return this.consoleService.log(message, this.quiet);
    }

    defer<Any>(): angular.IDeferred<Any> {
        this.check();

        return this.$q.defer();
    }

    postpone<Any>(seconds: number, fn?: () => Any | angular.IPromise<Any>): angular.IPromise<Any> {
        this.check();

        return this.uiService.postpone(seconds, fn);
    }

    sequence<Any>(...secondsOrStep: (number | (() => any | angular.IPromise<any>))[]): angular.IPromise<Any> {
        return this.sequenceStep<Any>(this.defer<Any>(), undefined, ...secondsOrStep);
    }

    private sequenceStep<Any>(deferred: angular.IDeferred<Any>, result: any, ...secondsOrStep: (number | (() => any | angular.IPromise<any>))[]): angular.IPromise<Any> {
        this.check();

        try {
            this.check();

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
            if (err === ABORTED || err === SKIPPED) {
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

    map<Item, Result>(source: Item[], fn: (item: Item) => angular.IPromise<Result> | Result): angular.IPromise<Result[]> {
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
        this.check();

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
            if (err === ABORTED || err === SKIPPED) {
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

    get ast(): ESTree.Program {
        if (this._ast) {
            return this._ast;
        }

        return this._ast = esprima.parse(this.code!);
    }

    get minifiedCode(): string {
        if (this._mangledCode) {
            return this._mangledCode;
        }

        let mangledAst = esmangle.mangle(esmangle.optimize(angular.copy(this.ast), null));

        return this._mangledCode = escodegen.generate(mangledAst, {
            format: {
                renumber: true,
                hexadecimal: true,
                escapeless: true,
                compact: true,
                semicolons: false,
                parentheses: false
            }
        });
    }

    get instrumentedCode(): string {
        if (this._instrumentedCode) {
            return this._instrumentedCode;
        }

        this.invocationId = 0;

        let instrumentedAst = this.instrument(angular.copy(this.ast));

        return this._instrumentedCode = escodegen.generate(instrumentedAst, {
            format: {
                renumber: false,
                hexadecimal: false,
                escapeless: false,
                compact: false,
                semicolons: true,
                parentheses: true
            }
        });
    }

    instrument(node: any): any {
        if (node instanceof Array) {
            for (var i = 0; i < node.length; i++) {
                node[i] = this.instrument(node[i]);
            }
        }
        else {
            if (node.body) {
                node.body = this.instrument(node.body);
            }

            if (node.test) {
                node.test = this.instrument(node.test);
            }

            if (node.left) {
                node.left = this.instrument(node.left);
            }

            if (node.right) {
                node.right = this.instrument(node.right);
            }

            if (node.consequent) {
                node.consequent = this.instrument(node.consequent);
            }

            if (node.expression) {
                node.expression = this.instrument(node.expression);
            }

            if (node.argument) {
                node.argument = this.instrument(node.argument);
            }

            if (node.arguments) {
                node.arguments = this.instrument(node.arguments);
            }

            if (node.declaration) {
                node.declaration = this.instrument(node.declaration);
            }

            switch (node.type) {
                case 'CallExpression':
                case 'LogicalExpression':
                case 'UnaryExpression':
                case 'BinaryExpression':
                    node = this.instrumentNode(node);
                    break;
            }
        }

        return node;
    }

    instrumentNode(node: any): any {
        return {
            type: 'CallExpression',
            arguments: [
                {
                    type: 'Literal',
                    value: this.invocationId++
                },
                {
                    type: 'ThisExpression'
                },
                {
                    type: 'FunctionExpression',
                    params: [],
                    id: null,
                    generator: false,
                    expression: false,
                    defaults: [],
                    body: {
                        type: 'BlockStatement',
                        body: [
                            {
                                type: 'ReturnStatement',
                                argument: node
                            }
                        ]
                    }
                }
            ],
            callee: {
                type: 'Identifier',
                name: '___'
            }
        };
    }

    incrementInvocationCount(id: number, that: any, fn: Function): any {
        this.invocationCount[id] = (this.invocationCount[id] || 0) + 1;

        return fn.call(that);
    }

    get maximumInvocationCount(): number {
        if (!Object.keys(this.invocationCount).length) {
            throw new Error('No invocations recorded. Use invokeInstrumentedFn(...)');
        }

        // this.check();

        return Object.keys(this.invocationCount).map(id => this.invocationCount[id]).reduce((a, b) => Math.max(a, b));
    }

    estimateComplexity(n: number, min?: string): string {
        let count = this.maximumInvocationCount;

        if (min === 'O(d\u207f)' || count > Math.pow(2, n)) {
            return 'O(d\u207f)';
        }

        if (min === 'O(n³)' || count > Math.pow(n, 3)) {
            return 'O(n³)';
        }

        if (min === 'O(n²)' || count > Math.pow(n, 2)) {
            return 'O(n²)';
        }

        if (min === 'O(n log n)' || count > n * Math.log(n)) {
            return 'O(n log n)';
        }

        if (min === 'O(n)' || count > n) {
            return 'O(n)';
        }

        if (min === 'O(log n)' || count > Math.log(n)) {
            return 'O(log n)';
        }

        return 'O(1)';
    }

    countTypes(...types: string[]): number {
        var count = 0;

        this.crawl(this.ast, (node: any) => {
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
        return this.countTypes('UnaryExpression', 'BinaryExpression', 'AssignmentExpression');
    }

    countIdentifiers(...identifiers: string[]): number {
        var count = 0;

        this.crawl(this.ast, (node: any) => {
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

        this.crawl(this.ast, (node: any) => {
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

}
