/// <reference path="./../../typings/index.d.ts" />

declare namespace engine {

    export class Result {

        static success(message?: string): Result;

        static failure(message?: string): Result;

        success: boolean;

        message: string;
    }

    export class Context {

        buildFn(...fnFactoryParams: any[]): Function;

        invokeFn(fn: Function, ...fnParams: any[]): any;

        countTypes(...types: string[]): number;

        countLoops(): number;

        countConditions(): number;

        countCalculations(): number;

        countLogicals(): number;

        countStatements(): number;

        countOperators(...operators: string[]): number;












        // canceled: boolean;

        // defer(): angular.IDeferred<Result>;

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
