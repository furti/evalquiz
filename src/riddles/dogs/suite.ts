/// <reference path="./../index.d.ts" />

class Graphics {

    constructor(private readonly stage: Stage, private readonly ctx: CanvasRenderingContext2D, private readonly scale: number) {

    }

    drawImage(name: string, x: number, y: number, mirrored: boolean = false): void {
        let image: HTMLImageElement | null = this.stage.images[name];

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
    }
}

class Stage {
    private _canvas: HTMLCanvasElement;
    private _renderer: (g: Graphics) => void;

    constructor(public readonly width: number, public readonly height: number, public readonly images: { [name: string]: HTMLImageElement | null }) {
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

        // this._canvas.width = this.width;
        // this._canvas.height = this.height / this.width * this._canvas.clientWidth;

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

                image.src = `/riddles/dogs/${name}.svg`;

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
        return this.initCanvas();
    }
    // draw(f: number): void {
    //     let fa = f;
    //     let fb = this.wrap(f * 2, f, 2 - f);

    //     //    ctx.
    // }

    initCanvas(width: number = 640, height: number = 240, scale: number = 0.5): angular.IPromise<void> {
        let deferred = this.context.defer<void>();

        this.load().then(() => {
            this.stage = new Stage(640, 240, this.images);

            let logItem = this.context.log().element(this.stage.canvas).addClass('layout-grow layout-shrink full-width');

            this.stage.renderer = (g: Graphics) => {
                g.drawImage('big_dog_sitting', 48, 32);
                g.drawImage('little_dog_sitting', 48, 16, true);
                g.drawImage('tree', 640 - 48, 0);
            };

            deferred.resolve();
        });

        return deferred.promise;
    }

    wrap(n: number, min: number = 0, max: number = 1): number {
        return n - Math.floor((n - min) / (max - min)) * (max - min);
    }

}

