(function () {
    function Engine() {

    }

    Engine.prototype.run = function (add) {
        var a = Math.random() * 1000,
            b = Math.random() * 1000;

        var solution = add(a, b);

        return solution === (a + b);
    };

    return new Engine();
})();