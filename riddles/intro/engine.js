(function () {
    function Engine() {

    }

    Engine.prototype.init = function () {
        this.a = Math.floor(Math.random() * 1000);
        this.b = Math.floor(Math.random() * 1000);
    };

    Engine.prototype.failedMessage = function () {
        return 'The sum of ' + this.a + ' and ' + this.b + ' is not ' + this.solution;
    };

    Engine.prototype.run = function (add) {
        this.solution = add(this.a, this.b);

        return this.solution === (this.a + this.b);
    };

    return new Engine();
})();