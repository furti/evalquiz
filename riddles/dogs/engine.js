(function () {
    function Engine() {

    }

    Engine.prototype.init = function () {
        this.t = 5 + Math.floor(Math.random() * 5);
        this.s = 5 + Math.floor(Math.random() * 5);
    };

    Engine.prototype.solvedMessage = function(score) {
        if (score < 2) {
            return 'You have found the correct answer, but you did not yet master the riddle.'
        }

        return 'Double speed means double distance.';
    };

    Engine.prototype.failedMessage = function () {
        return 'The distance you calculated is not right!';
    };

    Engine.prototype.run = function (distance, syntax) {
        var solution = distance(this.t, this.s);

        if (solution !== this.t * 2) {
            return 0;
        }

        var loopCount = syntax.countLoops();

        if (loopCount > 0) {
            return 1;
        }

        var calcCount = syntax.countCalculations() + syntax.countLogicals();

        if (calcCount > 0) {
            return 2;
        }
        
        return 3;
    };

    return new Engine();
})();