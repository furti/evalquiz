(function () {
    // This riddle is for Peter Niederwieser and Juergen Hoeller, who couldn't believe the simple result :)

    function Engine() {
    }

    Engine.prototype.DAYS = 7;  

    Engine.prototype.COUNT = [4, 8, 16, 32, 64, 128, 256];

    Engine.prototype.init = function() {
        this.samples = this.initSamples();
        this.currentSample = [];
        this.invalidDay = -1;
        this.invalidResult = 0;
    };

    Engine.prototype.initSamples = function() {
        var samples = [];

        for (var day = 0; day < this.DAYS; day++) {
            samples[day] = [];

            for (var i = 0; i < this.COUNT[day]; i++) {
                samples[day][i] = - 640 + Math.round(Math.random() * 128) * 10;
            }
        }

        return samples;
    };

    Engine.prototype.run = function(implementation) {
        var maximum = 0;
        var results = [];

        for (var day = 0; day < this.DAYS; day++) {
            results[day] = this.runSample(day, implementation);
            maximum = Math.max(maximum, results[day]);
        }

        return this.check(maximum, results);
    };

    Engine.prototype.runSample = function(day, implementation) {
        var engine = this;

        engine.currentSample = engine.samples[day];

        var data = {
            length: function() {
                return engine.currentSample.length;
            },
            get: function(index) {
                if (index < 0) {
                    throw 'You cannot get altitude difference for an index < 0';
                }

                if (index >= engine.currentSample.length) {
                    throw 'There are only ' + engine.currentSample.length + 
                        ' altitude differences available for the day. You can not get the altitude difference for the index ' + 
                        index + ' (remember index is zero based).';
                }

                return engine.currentSample[index];
            }
        };

        return implementation(data);
    };

    Engine.prototype.check = function(maximum, results) {
        var expectedMaximum = 0;

        for (var day = 0; day < this.DAYS; day++) {
            var expectedResult = this.calculate(day);

            if (results[day] !== expectedResult) {
                this.invalidDay = day;
                this.invalidResult = results[day];

                return false;
            }

            expectedMaximum = Math.max(expectedMaximum, expectedResult);
        }

        this.invalidDay = -1;

        return maximum === expectedMaximum;
    };

    Engine.prototype.calculate = function(day) {
        var maximum = 0;
        var current = 0;

        for (var i = 0; i < this.samples[day].length; i++) {
            current = Math.max(current + this.samples[day][i], 0);
            maximum = Math.max(maximum, current);
        }            

        return maximum;
    };

    Engine.prototype.solvedMessage = function() {
        return 'Now Peter and Jürgen know where their blisters came from.';
    };

    Engine.prototype.failedMessage = function() {
        var message = 'The result for day ' + (this.invalidDay + 1) + ' is wrong';

        if (this.samples[this.invalidDay].length <= 16) {
            message += '. The day consists of following altitude differences: ';

            for (var i = 0; i < this.samples[this.invalidDay].length; i++) {
                if (i > 0) {
                    message += ', ';
                }

                message += ' ' + this.samples[this.invalidDay][i] + ' ft';
            }
        }

        message += '. The expected result is ' + this.calculate(this.invalidDay) + ' ft, but your result is ' + this.invalidResult + ' ft.';

        return message;
    };

    return new Engine();
})();