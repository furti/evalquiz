/// <reference path="./../../typings/index.d.ts" />

declare namespace suite {

    export interface Message {
        content: any;

        type?: 'plain' | 'markdown' | 'html' | 'code';

        classname?: string;

        icon?: string;
    }

    export interface LogItem {

        content: JQuery;

        withClass(...classname: string[]): this;

        withIcon(icon?: string): this;

        withContentClass(...classname: string[]): this;

        sub(): LogItem;

        newLine(): JQuery;

        space(): JQuery;

        h1(s: string): JQuery;

        h2(s: string): JQuery;

        h3(s: string): JQuery;

        mark(mark: string): JQuery;

        icon(icon: string): JQuery;

        write(s: any): JQuery;

        markdown(s: string): JQuery;

        html(s: string): JQuery;

        code(s: string): JQuery;
    }

    export interface Context {

        isRunning(): boolean;

        fail(): void;

        isSkipped(): boolean;

        skip(fail?: boolean): void;

        optional: boolean;

        quiet: boolean;

        check(): void;

        invokeFn(...fnParams: any[]): any;

        /**
         * Returns the (maximum) score. When setting this variable, 
         * it will never get more that it is.
         * 
         * @type {number} the (maximum) score
         */
        maxScore: number;

        /**
         * Adds the specified message to final message tips. Never adds a message twice. 
         * 
         * @param {string} message the message
         */
        message(message: string | Message): void;

        /**
         * Logs a messages. If the message is a string, it handles the message as Markdown.
         * 
         * @param {(string | Message)} [message] the message
         * @returns {LogItem} the log item
         */
        log(message?: string | Message): LogItem;

        defer<Any>(): angular.IDeferred<Any>;

        /**
         * Postponses the invocation of the specified function 
         * and returns a promise for the result.
         * 
         * @template Result the type of result
         * @param {number} seconds the delay in seconds
         * @param {(() => Result | angular.IPromise<Result>)} fn the function
         * @returns {angular.IPromise<Result>} the promise
         */
        postpone<Result>(seconds: number, fn?: () => Result | angular.IPromise<Result>): angular.IPromise<Result>;

        /**
         * Executes a sequence of postponed steps. The array may contain
         * numbers and functions. Numbers are interpreted as seconds to delay
         * the execution and functions will be invoked. The functions may
         * themself return promises. The method returns the 
         * result of the last invokation that was not undefined as result.
         * 
         * @template Result the type of result
         * @param {(...(number | (() => any | angular.IPromise<any>))[])} secondsOrStep the array of seconds and functions
         * @returns {angular.IPromise<Result>} the result of the last invocation, that was not undefined
         */
        sequence<Result>(...secondsOrStep: (number | (() => any | angular.IPromise<any>))[]): angular.IPromise<Result>;

        /**
         * Transforms the array using the specified function. The function may 
         * return a promise to delay the execution.
         * 
         * @template Item the type of the source array
         * @template Result the type of the targer array
         * @param {Item[]} array the array
         * @param {((item: Item) => Result | angular.IPromise<Result>)} fn the function, may return a promise
         * @returns {angular.IPromise<Result[]>} a promise for the result
         */
        map<Item, Result>(source: (Item | undefined | null)[] | undefined | null, fn: (item: Item | undefined | null) => angular.IPromise<Result> | Result | undefined | null): angular.IPromise<(Result | undefined | null)[] | undefined | null>;

        /**
         * Counts the specified types.
         * 
         * @param {...string[]} types the types
         * @returns {number} the number of matching nodes
         */
        countTypes(...types: string[]): number;

        /**
         * Counts 'ForStatement', 'WhileStatement', 'DoWhileStatement'.
         * 
         * @returns {number} the number of matching nodes
         */
        countLoops(): number;

        /**
         * Counts 'IfStatement', 'SwitchStatement', 'ConditionalExpression'.
         * 
         * @returns {number} the number of matching nodes
         */
        countConditions(): number;

        /**
         * Counts 'BinaryExpression', 'AssignmentExpression'.
         * 
         * @returns {number} the number of matching nodes
         */
        countCalculations(): number;

        /**
         * Counts 'Identifier', including undefined and the 'Literal' null.
         * 
         * @param {...string[]} identifiers the identifiers to look for, or, if undefined, for all identifiers
         * @returns {number} the number of matching nodes
         */
        countIdentifiers(...identifiers: string[]): number;

        /**
         * Counts 'LogicalExpression'.
         * 
         * @returns {number} the number of matching nodes
         */
        countLogicals(): number;

        /**
         * 
         * Counts 'ForStatement', 'WhileStatement', 'DoWhileStatement', 'IfStatement', 'SwitchStatement', 'ExpressionStatement', 'ReturnStatement'.
         * 
         * @returns {number} the number of matching nodes
         */
        countStatements(): number;

        /**
         * Counts 'VariableDeclaration'.
         * 
         * @returns {number} the number of matching nodes
         */
        countVariableDeclarations(): number;

        /**
         * Counts 'BinaryExpression', 'LogicalExpressions', 'UpdateExpression', 'AssignmentExpression'.
         * 
         * @param {...string[]} operators the operators to look for, or, if undefined, for all operators
         * @returns {number} the number of matching nodes
         */
        countOperators(...operators: string[]): number;

    }
}
