(function () {
    function Engine() {
    }

    Engine.prototype.init = function () {
        this.colors = this.initDwarfs();
        this.rowArray = [];
        this.count = 0;
        this.average = 0;
    };

    Engine.prototype.solvedMessage = function() {
        return 'The dwarfs are save now and they lived happily ever after. You have used an average of ' + this.average.toFixed(1) + ' lookups per dwarf.';
    };

    Engine.prototype.failedMessage = function () {
        var message = 'The dwarfs where in the following order: ',
            first = true;


        this.rowArray.forEach(function (color) {
            if (!first) {
                message += ', ';
            }
            else {
                first = false;
            }

            message += color;
        });

        return message;
    };

    Engine.prototype.run = function (join, syntax) {
        var engine = this;

        var row = {
            getLength: function () {
                return engine.rowArray.length;
            },
            checkColor: function (position) {
                if (position < 0) {
                    throw 'You cannot get the color for a negative position';
                }

                if (position >= engine.rowArray.length) {
                    throw 'There are only ' + engine.rowArray.length + 'dwarfs in the row. You can not get the color for position ' + position + '. Remember position is zero based';
                }

                engine.count++;

                return engine.rowArray[position];
            }
        };

        this.count = 0;

        for (var i = 0; i < engine.colors.length; i++) {
            var position = join(row);

            if (typeof position === 'undefined') {
                throw 'You have to return a position to place a dwarf';
            }

            var color = engine.colors[i];
            engine.rowArray.splice(position, 0, color);
        }

        this.average = this.count / engine.colors.length;

        if (!this.checkColors()) {
            return 0;
        }

        if (this.average > 8) {
            return 1;
        }

        var loopCount = syntax.countTypes('ForStatement', 'WhileStatement', 'DoWhileStatement');

        if (loopCount > 0) {
            return 2;
        }

        return 3;
    };

    /**
     *
     * @returns {Array}
     */
    Engine.prototype.initDwarfs = function () {
        var colors = [];

        for (var i = 0; i < 50; i++) {
            var rand = Math.random();

            if (rand > 0.5) {
                colors.push('red');
            }
            else {
                colors.push('blue');
            }
        }

        return colors;
    };

    Engine.prototype.checkColors = function () {
        if (!this.rowArray || this.rowArray.length === 0) {
            return false;
        }

        var actual, last, colorsChanged = false;
        for (var i = 0; i < this.rowArray.length; i++) {
            actual = this.rowArray[i];

            if (!last) {
                last = actual;
            }
            else {
                /*
                 * If the colors have changed from tred to blue or from blue to red before --> no change is allowed anymore
                 * or the row is not right
                 */
                if (colorsChanged) {
                    if (actual !== last) {
                        return false;
                    }
                }
                else {
                    // Set the indicator that the colors have changed.
                    if (actual !== last) {
                        colorsChanged = true;
                    }
                }

                last = actual;
            }
        }

        return true;
    };

    return new Engine();
})();