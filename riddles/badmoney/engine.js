(function () {
    function Engine() {

    }

    Engine.prototype.init = function () {
        this.bags = this.setupBags();
        this.alreadyWeighed = false;
    };

    Engine.prototype.failedMessage = function () {
        return 'You selected bag ' + this.selectedBag + '. But the bad one was ' + this.bags.badBag + '.';
    };

    Engine.prototype.run = function (find) {
        var engine = this;

        function scale(coins) {
            if (engine.alreadyWeighed) {
                throw 'You only are allowed to weigh once!';
            }

            var weight = 0;
            coins.forEach(function (coin) {
                if (coin.bag === engine.bags.badBag) {
                    weight += 9;
                }
                else {
                    weight += 10;
                }
            });

            engine.alreadyWeighed = true;

            return weight;
        }

        engine.selectedBag = find(scale, engine.bags.bags);

        return engine.selectedBag === engine.bags.badBag;
    };

    Engine.prototype.setupBags = function () {
        var bags = [];

        for (var i = 1; i <= 10; i++) {
            bags.push(new Bag(i));
        }

        return {
            badBag: Math.floor(Math.random() * 11),
            bags: bags
        };
    };

    function Bag(id) {
        this.id = id;
    }

    Bag.prototype.getCoins = function (ammount) {
        if (ammount < 1 || ammount > 10) {
            throw 'You have to select between 1 and 10 coins';
        }

        var coins = [];

        for (var i = 0; i < ammount; i++) {
            coins.push({bag: this.id});
        }

        return coins;
    };

    return new Engine();
})();