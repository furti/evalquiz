(function () {
    function Engine() {

    }

    Engine.prototype.init = function () {
        this.n = 1024 + Math.floor(Math.random() * 65536);
    };

    Engine.prototype.failedMessage = function () {
        return 'The sum of the numbers from 1 to ' + this.n + ' is not ' + this.solution;
    };

    Engine.prototype.run = function (carly, syntax) {
        this.solution = carly(this.n);

        if (this.solution !== (this.n * (this.n + 1)) / 2) {
            return 0;
        }

        var loopCount = syntax.countTypes('ForStatement', 'WhileStatement', 'DoWhileStatement');

        if (loopCount > 0) {
            return 1;
        }
        
        var multCount = syntax.countOperators('*', '*=');

        if (multCount > 0) {
            return 2;
        }
        
        return 3;
    };

    return new Engine();
})();