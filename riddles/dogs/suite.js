"use strict";
var PIXEL_TO_METERS = 0.025;
var Graphics = (function () {
    function Graphics(stage, ctx, scale) {
        this.stage = stage;
        this.ctx = ctx;
        this.scale = scale;
    }
    Graphics.prototype.translate = function (x, y) {
        this.ctx.translate(x, y);
        return this;
    };
    Graphics.prototype.drawImage = function (name, x, y, mirrored) {
        if (mirrored === void 0) { mirrored = false; }
        var image = this.stage.images[name];
        if (!image) {
            throw new Error('Unknown image: ' + name);
        }
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.save();
        if (mirrored) {
            this.ctx.scale(-PIXEL_TO_METERS, -PIXEL_TO_METERS);
        }
        else {
            this.ctx.scale(PIXEL_TO_METERS, -PIXEL_TO_METERS);
        }
        this.ctx.translate(-image.width / 2, -image.height);
        this.ctx.drawImage(image, 0, 0);
        this.ctx.restore();
        this.ctx.restore();
        return this;
    };
    return Graphics;
}());
var Stage = (function () {
    function Stage(width, height, images) {
        var _this = this;
        this.width = width;
        this.height = height;
        this.images = images;
        this._canvas = document.createElement("canvas");
        this._canvas.width = width;
        this._canvas.height = height;
        window.addEventListener('resize', function () { return _this.render(); });
    }
    Object.defineProperty(Stage.prototype, "canvas", {
        get: function () {
            return this._canvas;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "renderer", {
        get: function () {
            return this._renderer;
        },
        set: function (renderer) {
            this._renderer = renderer;
            this.render();
        },
        enumerable: true,
        configurable: true
    });
    Stage.prototype.render = function () {
        if (!this._renderer) {
            return;
        }
        var ratio = this.width / this.height;
        this._canvas.width = this._canvas.clientWidth;
        this._canvas.height = this._canvas.clientWidth / ratio;
        var scale = this._canvas.width / this.width;
        var ctx = this._canvas.getContext('2d');
        ctx.translate(0, this._canvas.height);
        ctx.scale(scale, -scale);
        ctx.save();
        this._renderer(new Graphics(this, ctx, scale));
        ctx.restore();
    };
    return Stage;
}());
var Suite = (function () {
    function Suite(context) {
        this.context = context;
        this.images = {
            'big_dog_anim0': null,
            'big_dog_anim1': null,
            'little_dog_anim0': null,
            'little_dog_anim1': null,
            'big_dog_sitting': null,
            'little_dog_sitting': null,
            'tree': null
        };
        this.loading = 0;
    }
    Suite.prototype.createImage = function (width, height) {
        var image = document.createElement("img");
        if (width && height) {
            image.width = width;
            image.height = height;
        }
        return image;
    };
    Suite.prototype.load = function () {
        var _this = this;
        var deferred = this.context.defer();
        var _loop_1 = function(name_1) {
            if (this_1.images[name_1] === null) {
                this_1.loading++;
                var image = this_1.createImage();
                image.onload = function () {
                    _this.loading -= 1;
                    if (_this.loading === 0) {
                        deferred.resolve();
                    }
                };
                image.onerror = function () {
                    console.error('Failed to load image: ' + name_1);
                };
                image.src = "riddles/dogs/" + name_1 + ".svg";
                this_1.images[name_1] = image;
            }
        };
        var this_1 = this;
        for (var name_1 in this.images) {
            _loop_1(name_1);
        }
        if (this.loading === 0) {
            deferred.resolve();
        }
        return deferred.promise;
    };
    Suite.prototype.log = function (message) {
        this.context.log({
            content: message,
            type: 'plain'
        });
    };
    Suite.prototype.test = function () {
        var totalDistance = Math.round(Math.random() * 10 + 15);
        var speed = Math.round(Math.random() * 2 + 3);
        return this.execute(totalDistance, speed);
    };
    Suite.prototype.test2 = function () {
        if (this.context.maxScore <= 0) {
            return;
        }
        this.logItem = this.context.log({
            content: 'And once more, because it was so much fun!',
            type: 'markdown',
            classname: 'info'
        });
        var totalDistance = Math.round(Math.random() * 20 + 40);
        var speed = Math.round(Math.random() * 2 + 3);
        return this.execute(totalDistance, speed);
    };
    Suite.prototype.testLoops = function () {
        if (this.context.maxScore <= 0) {
            return;
        }
        var loopCount = this.context.countLoops();
        if (loopCount > 0) {
            this.context.maxScore = 1;
        }
        else {
            this.logItem = this.context.log({
                content: 'Your code does not contain any loops.',
                type: 'plain',
                classname: 'success',
                icon: 'fa-info-circle'
            });
            this.logItem.mark('ok');
            this.context.maxScore = 3;
        }
    };
    Suite.prototype.testCalcs = function () {
        if (this.context.maxScore <= 0) {
            return;
        }
        var calcCount = this.context.countCalculations() + this.context.countLogicals();
        if (calcCount > 0) {
            this.context.maxScore = 2;
        }
        else {
            this.logItem = this.context.log({
                content: 'Your code does not contain any calculations.',
                type: 'plain',
                classname: 'success',
                icon: 'fa-info-circle'
            });
            this.logItem.mark('ok');
            this.context.maxScore = 3;
        }
    };
    Suite.prototype.execute = function (totalDistance, speed) {
        var _this = this;
        if (totalDistance === void 0) { totalDistance = 25; }
        if (speed === void 0) { speed = 4; }
        this.logItem = this.context.log();
        this.simulationDeferred = this.context.defer();
        this.totalDistance = totalDistance;
        this.distanceA = this.distanceB = 0;
        this.speed = speed;
        this.timestamp = undefined;
        this.context.sequence(0.25, function () { return _this.logItem.markdown("Your task:").addClass('info large'); }, 0.5, function () { return _this.logItem.markdown("The distance to the tree is **" + totalDistance + " m**."); }, 0.25, function () { return _this.logItem.markdown("The big dog runs with **" + (speed * 2) + " m/s**, the little dog runs with **" + speed + " m/s**."); }, 0.5, function () {
            _this.logItem = _this.context.log();
            _this.logItem.write('Your estimation: ').addClass('warning fade-in');
        }, 0.5, function () {
            var result = _this.context.invokeFn(totalDistance, speed);
            _this.logItem.write(result).addClass('info');
            _this.logItem.space();
            _this.logItem.write('m').addClass('warning');
            if (result === undefined || result === null || typeof result !== 'number') {
                _this.context.log({
                    content: 'You need to return a number.',
                    type: 'markdown',
                    classname: 'error',
                    icon: 'fa-times-circle'
                });
                _this.context.maxScore = 0;
                _this.simulationDeferred.resolve();
                return;
            }
            _this.estimation = result;
            _this.simulate();
        }).catch(function (err) { return _this.simulationDeferred.reject(err); });
        var deferred = this.context.defer();
        this.simulationDeferred.promise.then(function () {
            _this.context.postpone(1, function () {
                if (Math.abs(_this.estimation - _this.totalDistance * 2) < 0.1) {
                    _this.logItem = _this.context.log({
                        content: 'Your estimation was correct.',
                        type: 'plain',
                        classname: 'success',
                        icon: 'fa-info-circle'
                    });
                    _this.logItem.mark('ok');
                    _this.context.maxScore = 3;
                }
                else {
                    _this.logItem = _this.context.log({
                        content: 'Your estimation was not correct.',
                        type: 'plain',
                        classname: 'error',
                        icon: 'fa-times-circle'
                    });
                    _this.logItem.mark('not-ok');
                    _this.context.maxScore = 0;
                }
                deferred.resolve();
            }).catch(function (err) { return deferred.reject(err); });
        }, function (err) { return deferred.reject(err); });
        return deferred.promise;
    };
    Suite.prototype.simulate = function () {
        var _this = this;
        this.context.sequence(0.5, function () {
            _this.logItem = _this.context.log();
            _this.logItem.markdown('Let\'s simulate this:').addClass('fade-in');
        }, 0.5, function () {
            return _this.load().then(function () {
                _this.stage = new Stage(_this.totalDistance + 3, 6, _this.images);
                _this.logItem.element(_this.stage.canvas).addClass('layout-grow layout-shrink full-width fade-in');
                _this.stage.renderer = function (g) {
                    g.translate(1, 0);
                    g.drawImage('tree', _this.totalDistance + 1, 0);
                    g.drawImage('big_dog_sitting', 0, 0.3);
                    g.drawImage('little_dog_sitting', -0.25, 0.1, true);
                };
            });
        }, 1, function () {
            _this.stage.renderer = function (g) {
                var anim = Math.floor(_this.timestamp / 50);
                var dogA = _this.distanceA;
                var mirrorA = false;
                var remaining = _this.totalDistance;
                if (dogA > remaining) {
                    dogA -= remaining;
                    remaining = remaining / 3 * 2;
                    while (dogA > remaining) {
                        dogA -= remaining;
                        remaining = remaining / 3;
                    }
                    if (dogA < remaining / 2) {
                        mirrorA = true;
                        dogA = _this.totalDistance - dogA;
                    }
                    else {
                        dogA = _this.totalDistance - remaining + dogA;
                    }
                }
                g.translate(1, 0);
                g.drawImage('tree', _this.totalDistance + 1, 0);
                g.drawImage((anim % 4) < 2 ? 'big_dog_anim0' : 'big_dog_anim1', dogA, 0.3, mirrorA);
                g.drawImage((anim % 2) < 1 ? 'little_dog_anim0' : 'little_dog_anim1', _this.distanceB - 0.25, 0.1);
            };
            window.requestAnimationFrame(function (timestamp) { return _this.animate(timestamp); });
        }).catch(function (err) { return _this.simulationDeferred.reject(err); });
    };
    Suite.prototype.animate = function (timestamp) {
        var _this = this;
        var dt = (this.timestamp !== undefined) ? (timestamp - this.timestamp) / 1000 : 0;
        try {
            this.context.check();
        }
        catch (err) {
            var tree_1 = this.totalDistance;
            var dogA_1 = this.distanceA;
            var dogB_1 = this.distanceB;
            var remaining = this.totalDistance;
            if (dogA_1 > remaining) {
                dogA_1 -= remaining;
                remaining = remaining / 3 * 2;
                while (dogA_1 > remaining) {
                    dogA_1 -= remaining;
                    remaining = remaining / 3;
                }
                if (dogA_1 < remaining / 2) {
                    dogA_1 = this.totalDistance - dogA_1;
                }
                else {
                    dogA_1 = this.totalDistance - remaining + dogA_1;
                }
            }
            this.stage.renderer = function (g) {
                g.translate(1, 0);
                g.drawImage('tree', tree_1 + 1, 0);
                g.drawImage('big_dog_sitting', dogA_1, 0.3);
                g.drawImage('little_dog_sitting', dogB_1 - 0.25, 0.1, true);
            };
            throw err;
        }
        this.timestamp = timestamp;
        this.distanceA += this.speed * 2 * dt;
        this.distanceB += this.speed * dt;
        if (this.distanceA > this.totalDistance * 2) {
            this.distanceA = this.totalDistance;
        }
        if (this.distanceB > this.totalDistance) {
            this.distanceB = this.totalDistance;
        }
        this.stage.render();
        if (this.distanceA < this.totalDistance || this.distanceB < this.totalDistance) {
            window.requestAnimationFrame(function (timestamp) { return _this.animate(timestamp); });
        }
        else {
            var x_1 = this.totalDistance;
            this.stage.renderer = function (g) {
                g.translate(1, 0);
                g.drawImage('tree', x_1 + 1, 0);
                g.drawImage('big_dog_sitting', x_1, 0.3);
                g.drawImage('little_dog_sitting', x_1 - 0.25, 0.1, true);
            };
            this.simulationDeferred.resolve();
        }
    };
    Suite.prototype.wrap = function (n, min, max) {
        if (min === void 0) { min = 0; }
        if (max === void 0) { max = 1; }
        return n - Math.floor((n - min) / (max - min)) * (max - min);
    };
    return Suite;
}());
exports.Suite = Suite;
//# sourceMappingURL=suite.js.map