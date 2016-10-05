(function () {
    function Engine() {

    }

    Engine.prototype.init = function () {
    };

    Engine.prototype.solvedMessage = function(score) {
        if (score < 2) {
            return 'You found the fake coin. But it took ' + this.maxWeightings + ' weightings. This is way too much!'
        }

        return 'You\'ve found the fake coin with a minimum number of weightings.';
    };

    Engine.prototype.failedMessage = function () {
        return 'You\'ve picked the wrong coin.';
    };

    Engine.prototype.run = function (find, syntax) {
        var engine = this;

        this.maxWeightings = 0;

        for (var test = 0; test < 27; test++) {
            // it's safer to create the coins for each test
            // maybe they are marked ;) 
            var coins = this.createCoins(27);
            var fakeId = coins[test].id; 
            var weightings = 0;

            function scale(left, right) {
                weightings++;

                if (!(left instanceof Array)) {
                    left = [left];
                }

                if (!(right instanceof Array)) {
                    right = [right];
                }
                
                var result = 0;
                var leftIds = []

                left.forEach(function (coin) {
                    leftIds.push(coin.id);

                    if (coin.id === fakeId) {
                        result = 1;
                    }
                });

                right.forEach(function (coin) {
                    if (leftIds.indexOf(coin.id) >= 0) {
                        throw 'You cannot put a coin into the left and the right side at once! Not in this universe!'
                    }

                    if (coin.id === fakeId) {
                        result = -1;
                    }
                });

                return result;
            }            

            var result = find(scale, coins);

            if (!(result instanceof Coin)) {
                throw 'You did not return a coin.';
            }

            if (result.id !== fakeId) {
                return 0;    
            }

            this.maxWeightings = Math.max(this.maxWeightings, weightings);
        }

        if (this.maxWeightings > 3) {
            return 1;
        }

        var loopCount = syntax.countLoops();

        if (loopCount > 0) {
            return 2;
        }

        return 3;
    };

    Engine.prototype.createCoins = function(count) {
        var coins = [];

        for (var i=0; i<count; i++) {
            coins.push(new Coin(i + 1));
        }   

        return coins;
    }

    function Coin(id, weight) {
        this.id = id;
    }

    Engine.prototype.setupSacks = function () {
        var sacks = [];

        for (var i = 1; i <= 10; i++) {
            sacks.push(new Sack(i));
        }

        return {
            badSack: Math.floor(Math.random() * 11),
            sacks: sacks
        };
    };

    return new Engine();
})();