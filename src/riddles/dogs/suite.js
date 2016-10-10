"use strict";
var Graphics = (function () {
    function Graphics(stage, ctx, scale) {
        this.stage = stage;
        this.ctx = ctx;
        this.scale = scale;
    }
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
            this.ctx.scale(-1, -1);
        }
        else {
            this.ctx.scale(1, -1);
        }
        this.ctx.translate(-image.width / 2, -image.height);
        this.ctx.drawImage(image, 0, 0);
        this.ctx.restore();
        this.ctx.restore();
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
                image.src = "/riddles/dogs/" + name_1 + ".svg";
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
        return this.initCanvas();
    };
    Suite.prototype.initCanvas = function (width, height, scale) {
        var _this = this;
        if (width === void 0) { width = 640; }
        if (height === void 0) { height = 240; }
        if (scale === void 0) { scale = 0.5; }
        var deferred = this.context.defer();
        this.load().then(function () {
            _this.stage = new Stage(640, 240, _this.images);
            var logItem = _this.context.log().element(_this.stage.canvas).addClass('layout-grow layout-shrink full-width');
            _this.stage.renderer = function (g) {
                g.drawImage('big_dog_sitting', 48, 32);
                g.drawImage('little_dog_sitting', 48, 16, true);
                g.drawImage('tree', 640 - 48, 0);
            };
            deferred.resolve();
        });
        return deferred.promise;
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