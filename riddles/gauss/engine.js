(function () {
    function Engine() {

    }

    Engine.prototype.init = function () {
        this.r = 1024 + Math.floor(Math.random() * 65536);
    };

    Engine.prototype.failedMessage = function () {
        return 'The sum of the numbers from 1 to ' + this.r + ' is not ' + this.solution;
    };

    Engine.prototype.run = function (carly) {
        this.solution = carly(this.r);

        return this.solution === (this.r * (this.r + 1)) / 2;
    };

    return new Engine();
})();