/// <reference path="./../../typings/index.d.ts" />
/// <reference path="./../riddles/suite.d.ts" />

declare namespace esmangle {

    function optimize(ast: ESTree.Program, options?: any): ESTree.Program;
    function mangle(ast: ESTree.Program): ESTree.Program;

}

declare module "esmangle" {
    export = esmangle
}

