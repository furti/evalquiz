(function () {
    function Engine() {

    }

    Engine.prototype.init = function () {
        this.a = Math.floor(Math.random() * 1000);
        this.b = Math.floor(Math.random() * 1000);
    };

    Engine.prototype.solvedMessage = function() {
        return 'It wasn\'t that hard to solve I guess. So let\'s start with the real riddles now.';
    };

    Engine.prototype.failedMessage = function () {
        return 'The sum of ' + this.a + ' and ' + this.b + ' is not ' + this.solution;
    };

    Engine.prototype.run = function (add, syntax) {
        var plusCount = syntax.countOperators('+', '++', '+=');
        var minusCount = syntax.countOperators('-', '--', '-=');

        this.solution = add(this.a, this.b);

        if (this.solution !== (this.a + this.b)) {
            return 0;
        }

        if (plusCount > 0) {
            return 1;
        }
        
        if (minusCount > 0) {
            return 2;
        }
        
        return 3;
    };

    return new Engine();
})();