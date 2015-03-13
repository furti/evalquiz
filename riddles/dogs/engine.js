(function () {
    function Engine() {

    }

    Engine.prototype.init = function () {
        this.t = 5 + Math.floor(Math.random() * 5);
        this.s = 5 + Math.floor(Math.random() * 5);
    };

    Engine.prototype.solvedMessage = function() {
        return 'Double speed means double distance.';
    };

    Engine.prototype.failedMessage = function () {
        return 'The distance you calculated is not right!';
    };

    Engine.prototype.run = function (distance) {
        var solution = distance(this.t, this.s);

        return solution === this.t * 2;
    };

    return new Engine();
})();