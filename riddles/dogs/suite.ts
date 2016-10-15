/// <reference path="./../index.d.ts" /> 

const PIXEL_TO_METERS = 0.025;

class Graphics {

    constructor(private readonly stage: Stage, private readonly ctx: CanvasRenderingContext2D, private readonly scale: number) {

    }

    translate(x: number, y: number): this {
        this.ctx.translate(x, y);

        return this;
    }

    drawImage(name: string, x: number, y: number, mirrored: boolean = false): this {
        let image: HTMLImageElement | null = this.stage.images[name];

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
    }
}

class Stage {
    private _canvas: HTMLCanvasElement;
    private _renderer: (g: Graphics) => void;

    constructor(public readonly width: number, public readonly height: number, public readonly images: {
        [name: string]: HTMLImageElement | null
    }) {
        this._canvas = document.createElement("canvas");
        this._canvas.width = width;
        this._canvas.height = height;

        window.addEventListener('resize', () => this.render());
    }

    get canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    get renderer(): (g: Graphics) => void {
        return this._renderer;
    }

    set renderer(renderer: (g: Graphics) => void) {
        this._renderer = renderer;

        this.render();
    }

    render(): void {
        if (!this._renderer) {
            return;
        }

        let ratio = this.width / this.height;

        this._canvas.width = this._canvas.clientWidth;
        this._canvas.height = this._canvas.clientWidth / ratio;

        let scale = this._canvas.width / this.width;
        let ctx: CanvasRenderingContext2D = this._canvas.getContext('2d') !;

        ctx.translate(0, this._canvas.height);
        ctx.scale(scale, -scale);

        ctx.save();
        this._renderer(new Graphics(this, ctx, scale));
        ctx.restore();
    }
}

export class Suite {

    private images: { [name: string]: HTMLImageElement | null } = {
        'big_dog_anim0': null,
        'big_dog_anim1': null,
        'little_dog_anim0': null,
        'little_dog_anim1': null,
        'big_dog_sitting': null,
        'little_dog_sitting': null,
        'tree': null
    };
    private stage: Stage;
    private loading: number = 0;

    private logItem: suite.LogItem;
    private simulationDeferred: angular.IDeferred<void>;
    private totalDistance: number;
    private distanceA: number;
    private distanceB: number;
    private speed: number;
    private estimation: number;
    private timestamp: number | undefined;

    constructor(private context: suite.Context) {
    }

    createImage(width?: number, height?: number): HTMLImageElement {
        let image = document.createElement("img");

        if (width && height) {
            image.width = width;
            image.height = height;
        }

        return image;
    }

    load(): angular.IPromise<void> {
        let deferred = this.context.defer<void>();

        for (let name in this.images) {
            if (this.images[name] === null) {
                this.loading++;

                let image = this.createImage();

                image.onload = () => {
                    this.loading -= 1;

                    if (this.loading === 0) {
                        deferred.resolve();
                    }
                }

                image.onerror = () => {
                    console.error('Failed to load image: ' + name);
                }

                image.src = `riddles/dogs/${name}.svg`;

                this.images[name] = image;
            }
        }

        if (this.loading === 0) {
            deferred.resolve();
        }

        return deferred.promise;
    }

    log(message: any): void {
        this.context.log({
            content: message,
            type: 'plain'
        });
    }

    test(): angular.IPromise<void> {
        let totalDistance = Math.round(Math.random() * 10 + 15);
        let speed = Math.round(Math.random() * 2 + 3);

        return this.execute(totalDistance, speed);
    }

    test2(): angular.IPromise<void> | void {
        if (this.context.maxScore <= 0) {
            return;
        }

        this.logItem = this.context.log({
            content: 'And once more, because it was so much fun!',
            type: 'markdown',
            classname: 'info'
        });

        let totalDistance = Math.round(Math.random() * 20 + 40);
        let speed = Math.round(Math.random() * 2 + 3);

        return this.execute(totalDistance, speed);
    }

    testLoops(): void {
        if (this.context.maxScore <= 0) {
            return;
        }

        let loopCount = this.context.countLoops();

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
    }

    testCalcs(): void {
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
    }

    execute(totalDistance: number = 25, speed: number = 4): angular.IPromise<void> {
        this.logItem = this.context.log();
        this.simulationDeferred = this.context.defer<void>();
        this.totalDistance = totalDistance;
        this.distanceA = this.distanceB = 0;
        this.speed = speed;
        this.timestamp = undefined;

        this.context.sequence(
            0.25, () => this.logItem.markdown(`Your task:`).addClass('info large'),
            0.5, () => this.logItem.markdown(`The distance to the tree is **${totalDistance} m**.`),
            0.25, () => this.logItem.markdown(`The big dog runs with **${(speed * 2)} m/s**, the little dog runs with **${speed} m/s**.`),
            0.5, () => {
                this.logItem = this.context.log();
                this.logItem.write('Your estimation: ').addClass('warning fade-in');
            },
            0.5, () => {
                let result = this.context.invokeFn(totalDistance, speed);

                this.logItem.write(result).addClass('info');
                this.logItem.space();
                this.logItem.write('m').addClass('warning');

                if (result === undefined || result === null || typeof result !== 'number') {
                    this.context.log({
                        content: 'You need to return a number.',
                        type: 'markdown',
                        classname: 'error',
                        icon: 'fa-times-circle'
                    });
                    this.context.maxScore = 0;
                    this.simulationDeferred.resolve();
                    return;
                }

                this.estimation = result;
                this.simulate();
            }).catch(err => this.simulationDeferred.reject(err));

        let deferred = this.context.defer<void>();

        this.simulationDeferred.promise.then(() => {
            this.context.postpone(1, () => {
                if (Math.abs(this.estimation - this.totalDistance * 2) < 0.1) {
                    this.logItem = this.context.log({
                        content: 'Your estimation was correct.',
                        type: 'plain',
                        classname: 'success',
                        icon: 'fa-info-circle'
                    });
                    this.logItem.mark('ok');
                    this.context.maxScore = 3;
                }
                else {
                    this.logItem = this.context.log({
                        content: 'Your estimation was not correct.',
                        type: 'plain',
                        classname: 'error',
                        icon: 'fa-times-circle'
                    });
                    this.logItem.mark('not-ok');
                    this.context.maxScore = 0;
                }
                deferred.resolve();
            }).catch(err => deferred.reject(err));
        }, err => deferred.reject(err));

        return deferred.promise;
    }

    simulate(): void {
        this.context.sequence(
            0.5, () => {
                this.logItem = this.context.log();
                this.logItem.markdown('Let\'s simulate this:').addClass('fade-in');
            },
            0.5, () => {
                return this.load().then(() => {
                    this.stage = new Stage(this.totalDistance + 3, 6, this.images);

                    this.logItem.element(this.stage.canvas).addClass('layout-grow layout-shrink full-width fade-in');

                    this.stage.renderer = (g: Graphics) => {
                        g.translate(1, 0);
                        g.drawImage('tree', this.totalDistance + 1, 0);
                        g.drawImage('big_dog_sitting', 0, 0.3);
                        g.drawImage('little_dog_sitting', -0.25, 0.1, true);
                    };
                });
            },
            1, () => {
                this.stage.renderer = (g: Graphics) => {
                    let anim = Math.floor(this.timestamp / 50);
                    let dogA = this.distanceA;
                    let mirrorA = false;
                    let remaining = this.totalDistance;

                    if (dogA > remaining) {
                        dogA -= remaining;
                        remaining = remaining / 3 * 2;

                        while (dogA > remaining) {
                            dogA -= remaining;
                            remaining = remaining / 3;
                        }

                        if (dogA < remaining / 2) {
                            mirrorA = true;
                            dogA = this.totalDistance - dogA;
                        }
                        else {
                            dogA = this.totalDistance - remaining + dogA;
                        }
                    }

                    g.translate(1, 0);
                    g.drawImage('tree', this.totalDistance + 1, 0);
                    g.drawImage((anim % 4) < 2 ? 'big_dog_anim0' : 'big_dog_anim1', dogA, 0.3, mirrorA);
                    g.drawImage((anim % 2) < 1 ? 'little_dog_anim0' : 'little_dog_anim1', this.distanceB - 0.25, 0.1);
                };

                window.requestAnimationFrame(timestamp => this.animate(timestamp));
            }).catch(err => this.simulationDeferred.reject(err));
    }

    animate(timestamp: number): void {
        let dt = (this.timestamp !== undefined) ? (timestamp - this.timestamp) / 1000 : 0;

        try {
            this.context.check();
        }
        catch (err) {
            // this variable survive the next animation 
            let tree = this.totalDistance;
            let dogA = this.distanceA;
            let dogB = this.distanceB;
            let remaining = this.totalDistance;

            if (dogA > remaining) {
                dogA -= remaining;
                remaining = remaining / 3 * 2;

                while (dogA > remaining) {
                    dogA -= remaining;
                    remaining = remaining / 3;
                }

                if (dogA < remaining / 2) {
                    dogA = this.totalDistance - dogA;
                }
                else {
                    dogA = this.totalDistance - remaining + dogA;
                }
            }

            this.stage.renderer = (g: Graphics) => {
                g.translate(1, 0);
                g.drawImage('tree', tree + 1, 0);
                g.drawImage('big_dog_sitting', dogA, 0.3);
                g.drawImage('little_dog_sitting', dogB - 0.25, 0.1, true);
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
            window.requestAnimationFrame(timestamp => this.animate(timestamp));
        }
        else {
            // this variable survive the next animation 
            let x = this.totalDistance;

            this.stage.renderer = (g: Graphics) => {
                g.translate(1, 0);
                g.drawImage('tree', x + 1, 0);
                g.drawImage('big_dog_sitting', x, 0.3);
                g.drawImage('little_dog_sitting', x - 0.25, 0.1, true);
            };

            this.simulationDeferred.resolve();
        }
    }

    wrap(n: number, min: number = 0, max: number = 1): number {
        return n - Math.floor((n - min) / (max - min)) * (max - min);
    }

} 
