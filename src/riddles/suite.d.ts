/// <reference path="./../../typings/index.d.ts" />

declare namespace suite {

    export interface Result {

        success: boolean;

        message?: string;
    }

    export interface LogItem {

        withClass(...classname: string[]): this;

        withIcon(icon?: string): this;

        newLine(): JQuery;

        space(): JQuery;

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

        log(message?: any): LogItem;

        countTypes(...types: string[]): number;

        countLoops(): number;

        countConditions(): number;

        countCalculations(): number;

        countLogicals(): number;

        countStatements(): number;

        countVariableDeclarations(): number;

        countOperators(...operators: string[]): number;










        // canceled: boolean;


        // log(message: string): void;

        // logThinking(): void;

        // logOk(): void;

        // logError(): void;

        // postpone(seconds: number, fn: () => void): void;

        // cancel(): void;

        // success(message?: string): void;

        // failure(message?: string): void;
    }

    // export function test(): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
}
