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
        var loopCount = syntax.countTypes('ForStatement', 'WhileStatement', 'DoWhileStatement');
        var multCount = syntax.countOperators('*', '*=');

        this.solution = carly(this.n);

        if (this.solution !== (this.n * (this.n + 1)) / 2) {
            return 0;
        }

        if (loopCount > 0) {
            return 1;
        }
        
        if (multCount > 0) {
            return 2;
        }
        
        return 3;
    };

    return new Engine();
})();