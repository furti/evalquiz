/// <reference path="./../../typings/index.d.ts" />

declare namespace engine {

    export class Result {

        static success(message?: string): Result;

        static failure(message?: string): Result;

        success: boolean;

        message: string;
    }

    export class Context {

        invokeFn(...fnParams: any[]): any;

        defer<AnyType>(): angular.IDeferred<AnyType>;

        countTypes(...types: string[]): number;

        countLoops(): number;

        countConditions(): number;

        countCalculations(): number;

        countLogicals(): number;

        countStatements(): number;

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
