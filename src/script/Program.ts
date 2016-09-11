/// <reference path="./index.d.ts" />

export class Program {
    // for tests see: http://esprima.org/demo/parse.html

    private tree: ESTree.Program;

    constructor(private code: string) {
        this.tree = esprima.parse(code);
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
