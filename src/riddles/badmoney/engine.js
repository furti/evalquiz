(function () {
    function Engine() {

    }

    Engine.prototype.init = function () {
        this.sacks = this.setupSacks();
        this.alreadyWeighed = false;
    };

    Engine.prototype.solvedMessage = function() {
        return 'You found the sack that is to light.';
    };

    Engine.prototype.failedMessage = function () {
        return 'You selected sack ' + this.selectedSack + '. But the bad one was ' + this.sacks.badSack + '.';
    };

    Engine.prototype.run = function (find, syntax) {
        var engine = this;

        function scale(coins) {
            if (engine.alreadyWeighed) {
                throw 'You only are allowed to weigh once!';
            }

            var weight = 0;
            coins.forEach(function (coin) {
                if (coin.sack === engine.sacks.badSack) {
                    weight += 9;
                }
                else {
                    weight += 10;
                }
            });

            engine.alreadyWeighed = true;

            return weight;
        }

        engine.selectedSack = find(scale, engine.sacks.sacks);

        if (engine.selectedSack !== engine.sacks.badSack) {
            return 0;
        }

        return 1;
    };

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

    function Sack(id) {
        this.id = id;
    }

    Sack.prototype.getCoins = function (ammount) {
        if (ammount < 1 || ammount > 10) {
            throw 'You have to select between 1 and 10 coins';
        }

        var coins = [];

        for (var i = 0; i < ammount; i++) {
            coins.push({sack: this.id});
        }

        return coins;
    };

    return new Engine();
})();