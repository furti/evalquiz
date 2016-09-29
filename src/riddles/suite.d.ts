/// <reference path="./../../typings/index.d.ts" />

declare namespace suite {


    /**
     * A result returned by a test function.
     * 
     * @export
     * @interface Result
     */
    export interface Result {

        success: boolean;

        score?: number;

        message?: string;
    }

    export interface LogItem {

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

        code(s: string): JQuery;

    }

    export interface Context {

        invokeFn(...fnParams: any[]): any;

        defer<Any>(): angular.IDeferred<Any>;

        postpone<Any>(seconds: number, fn: () => Any | angular.IPromise<Any>): angular.IPromise<Any>;

        sequence<Any>(...secondsOrStep: (number | (() => any | angular.IPromise<any>))[]): angular.IPromise<Any>;

        log(message?: any): LogItem;

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

        isSucess(): boolean;

        isFailure(): boolean;

        getScore(): number;
    }
}
