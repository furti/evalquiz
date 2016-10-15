/// <reference path="./../index.d.ts" />

export class Coin {

}

export class Suite {

    private logItem: suite.LogItem;
    private weightings: number = 0;
    private weightingLogs: string[] = [];
    private coins: Coin[];
    private goldCoin: Coin;
    private leadCoins: Coin[];

    constructor(private context: suite.Context) {
    }

    weight(left: any, right: any): number {
        this.weightings++;

        let leftCoins = this.toCoinArray(left);
        let rightCoins = this.toCoinArray(right);

        this.context.check();

        if (!this.context.quiet) {
            this.logItem.markdown(`Weighting coins: ${leftCoins.length} on the left and ${rightCoins.length} on the right.`).addClass('info');
        }

        if (!this.verifyNotEmpty(leftCoins) || !this.verifyNotEmpty(rightCoins) || !this.verifyNoDuplicates(leftCoins) || !this.verifyNoDuplicates(rightCoins) || !this.verifyNoSames(leftCoins, rightCoins)) {
            this.context.check();
        }


        let leftWeight = this.getWeight(leftCoins);
        let rightWeight = this.getWeight(rightCoins);

        if (leftWeight > rightWeight) {
            if (!this.context.quiet) {
                this.logItem.markdown(`The left side is heavier.`);
            }

            return -1;
        }

        if (leftWeight < rightWeight) {
            if (!this.context.quiet) {
                this.logItem.markdown(`The right side is heavier.`);
            }

            return 1;
        }

        if (!this.context.quiet) {
            this.logItem.markdown(`The weight is balanced.`);
        }

        return 0;
    }

    toCoinArray(source: any, target: Coin[] = []): Coin[] {
        if (angular.isArray(source)) {
            source.forEach(coin => this.toCoinArray(coin, target));
            return target;
        }

        if (!source) {
            return target;
        }

        if (this.coins.indexOf(source) >= 0) {
            target.push(source);
            return target;
        }

        this.context.log({
            content: 'This ain\'t no coins, that\'s rubbish!',
            type: 'markdown',
            icon: 'fa-times-circle',
            classname: 'error'
        });

        this.context.skip();

        return [];
    }

    verifyNotEmpty(coins: Coin[]): boolean {
        if (!coins.length) {
            this.context.log({
                content: 'You cannot weight nothing.',
                type: 'markdown',
                icon: 'fa-times-circle',
                classname: 'error'
            });

            this.context.skip();

            return false;
        }

        return true;
    }

    verifyNoDuplicates(coins: Coin[]): boolean {
        for (let i = 0; i < coins.length; i++) {
            for (let j = i + 1; j < coins.length; j++) {
                if (coins[i] === coins[j]) {
                    this.context.log({
                        content: 'Your array contains the same coin object twice.',
                        type: 'markdown',
                        icon: 'fa-times-circle',
                        classname: 'error'
                    });

                    this.context.skip();

                    return false;
                }
            }
        }

        return true;
    }

    verifyNoSames(left: Coin[], right: Coin[]): boolean {
        for (let i = 0; i < left.length; i++) {
            if (right.indexOf(left[i]) >= 0) {
                this.context.log({
                    content: 'How did you put the same coin on both sides, you litte distractor of the universe?',
                    type: 'markdown',
                    icon: 'fa-times-circle',
                    classname: 'error'
                });

                this.context.skip();

                return false;
            }
        }

        return true;
    }

    verifySames(left: Coin[], right: Coin[]): boolean {
        for (let i = 0; i < left.length; i++) {
            if (right.indexOf(left[i]) < 0) {
                this.context.log({
                    content: 'Where did you get the coins from? I suspect you are cheating!',
                    type: 'markdown',
                    icon: 'fa-times-circle',
                    classname: 'error'
                });

                this.context.skip();

                return false;
            }
        }

        return true;
    }

    getWeight(coins: Coin[]): number {
        return coins.map(coin => coin === this.goldCoin ? 11 : 10).reduce((a, b) => a + b, 0);
    }

    log(message: any): void {
        this.context.log({
            content: message,
            type: 'plain'
        });
    }

    showCoins(deferred: angular.IDeferred<void>, numberOfCoins: number): angular.IPromise<void> {
        let maxCoins = numberOfCoins > 20 ? 10 : 5;

        if (numberOfCoins > maxCoins) {
            this.logItem.html(`<img src="riddles/badmoney2/coin${maxCoins}.svg" class="move-in"/>`);
            this.context.postpone(0.05, () => this.showCoins(deferred, numberOfCoins - maxCoins).catch(err => deferred.reject(err))).catch(err => deferred.reject(err));

            return deferred.promise;
        }

        if (numberOfCoins > 0) {
            this.logItem.html(`<img src="riddles/badmoney2/coin${numberOfCoins}.svg" class="move-in" />`);
        }

        deferred.resolve();

        return deferred.promise;
    }

    test(): angular.IPromise<void> {
        this.logItem = this.context.log();

        let numberOfCoins = 27;
        let goldCoinIndex = Math.floor(Math.random() * (numberOfCoins - 2)) + 1;

        for (let i = 0; i < 4; i++) {
            if (this.preview(numberOfCoins, goldCoinIndex, 3)) {
                console.log(this.preview(numberOfCoins, goldCoinIndex, 3));
                break;
            }

            goldCoinIndex = (goldCoinIndex + 8) % 27;
        }

        return this.execute(numberOfCoins, goldCoinIndex, 3);
    }

    testExtra(): angular.IPromise<void> | undefined {
        if (this.context.maxScore < 3) {
            return;
        }

        let deferred = this.context.defer<void>();

        this.logItem = this.context.log();
        this.logItem.markdown('Can you do this with more coins?').addClass('large');

        let numberOfCoins = 101 + Math.floor(Math.random() * 30);
        let goldCoinIndex;

        for (let i = 0; i < 98; i++) {
            goldCoinIndex = Math.floor(Math.random() * (numberOfCoins - 2)) + 1;

            if (this.preview(numberOfCoins, goldCoinIndex, 5)) {
                break;
            }

            numberOfCoins++;
        }

        this.context.optional = true;
        this.execute(numberOfCoins, goldCoinIndex, 5).then(() => {
            let passed: boolean = this.context.maxScore >= 3;

            this.context.optional = false;

            if (passed) {
                this.context.log({
                    content: 'You passed the extra test.',
                    type: 'markdown',
                    icon: 'fa-exclamation-triangle',
                    classname: 'success large'
                });
            }
            else {
                this.context.log({
                    content: 'You failed the extra test.',
                    type: 'markdown',
                    icon: 'fa-exclamation-triangle',
                    classname: 'error large'
                });

                this.context.maxScore = 2;
            }

            deferred.resolve();
        }, err => {
            this.context.optional = false;

            this.context.log({
                content: 'You failed the extra test.',
                type: 'markdown',
                icon: 'fa-exclamation-triangle',
                classname: 'error large'
            });

            this.context.maxScore = 2;

            deferred.resolve();
        });

        return deferred.promise;
    }

    execute(numberOfCoins: number, goldCoinIndex: number, maxWeightings: number): angular.IPromise<void> {
        let deferred = this.context.defer<void>();

        this.init(numberOfCoins, goldCoinIndex);

        this.step().then(coins => {
            if (!coins || !coins.length) {
                this.context.log({
                    content: 'You did not return anything.',
                    type: 'plain',
                    icon: 'fa-times-circle',
                    classname: 'error'
                }).mark('not-ok');

                this.context.maxScore = 0;
                deferred.resolve();
                return;
            }

            if (this.goldCoin !== coins[0]) {
                this.context.log({
                    content: 'You did return the wrong coin.',
                    type: 'plain',
                    icon: 'fa-times-circle',
                    classname: 'error'
                }).mark('not-ok');

                this.context.maxScore = 0;
                deferred.resolve();
                return;
            }

            if (this.weightings > maxWeightings) {
                this.context.log({
                    content: `You have found the gold coin, but ${this.weightings} weightings are more than expected.`,
                    type: 'plain',
                    icon: 'fa-check-circle',
                    classname: 'warning'
                }).mark('ok');
                this.context.maxScore = 1;
            }
            else {
                this.context.log({
                    content: `You have found the gold coin with a minimum amount of ${this.weightings} weightings.`,
                    type: 'plain',
                    icon: 'fa-check-circle',
                    classname: 'success'
                }).mark('ok');
                this.context.maxScore = 3;
            }

            deferred.resolve();
        }, err => deferred.reject(err));

        return deferred.promise;
    }

    step(deferred: angular.IDeferred<Coin[] | undefined> = this.context.defer<Coin[] | undefined>()): angular.IPromise<Coin[] | undefined> {
        this.context.sequence(0.125, () => {
            this.logItem.markdown(`Captain Coppercranium still has ${this.coins.length} coins.`).addClass('info fade-in');
        }, 0.125, () => {
            return this.showCoins(this.context.defer<void>(), this.coins.length);
        }, 0.125, () => {
            let index = this.coins.indexOf(this.goldCoin);

            if (index < 0) {
                this.logItem.markdown(`The gold coin isn't among these coins, but Captain Coppercranium does not know this, of course.`).addClass('error');
            }
            {
                this.logItem.markdown(`The gold coin is #${index + 1}, but Captain Coppercranium does not know this, of course.`).addClass('info');
            }
        }, 0.125, () => {
            let result: Coin | Coin[] | null | undefined = this.context.invokeFn(this.coins.slice());

            if (result === null || result === undefined) {
                deferred.resolve([]);
                return;
            }

            let remainingCoins: Coin[] = this.toCoinArray(result);

            if (angular.equals(remainingCoins, this.coins)) {
                this.context.log({
                    content: 'The array of coins was not modified. This triggers an endless loop.',
                    type: 'markdown',
                    icon: 'fa-times-circle',
                    classname: 'error'
                });
                this.context.skip();
                deferred.resolve(undefined);
                return;
            }

            this.context.check();

            this.verifyNoDuplicates(remainingCoins);
            this.verifySames(remainingCoins, this.coins);
            this.context.check();
            this.coins = remainingCoins.slice();

            if (this.coins.length > 1) {
                this.step(deferred);
            }
            else {
                deferred.resolve(remainingCoins);
            }
        }).catch(err => deferred.reject(err));

        return deferred.promise;
    }

    preview(numberOfCoins: number, goldCoinIndex: number, maxWeightings: number): string | undefined {
        let deferred = this.context.defer<void>();


        this.init(numberOfCoins, goldCoinIndex);
        this.context.optional = this.context.quiet = true;

        try {
            while (this.coins.length > 1) {
                let result: Coin | Coin[] | null | undefined = this.context.invokeFn(this.coins.slice());

                if (result === null || result === undefined) {
                    return 'empty';
                }

                let remainingCoins: Coin[] = this.toCoinArray(result);

                if (angular.equals(remainingCoins, this.coins)) {
                    return 'unmodified';
                }

                this.verifyNoDuplicates(remainingCoins);
                this.verifySames(remainingCoins, this.coins);
                this.coins = remainingCoins.slice();
            }

            if (!this.coins || !this.coins.length) {
                return 'empty';
            }

            if (this.goldCoin !== this.coins[0]) {
                return 'invalid';
            }

            if (this.weightings > maxWeightings) {
                return 'tooManyWeightings';
            }

            if (this.context.isSkipped() || this.context.maxScore < 1) {
                return 'failed';
            }

        }
        catch (err) {
            console.error('Preview failed:', err);
            return err;
        }
        finally {
            this.context.optional = this.context.quiet = false;
        }

        return undefined;
    }

    init(numberOfCoins: number, goldCoinIndex: number): void {
        this.weightings = 0;
        this.weightingLogs = [];
        this.coins = [];
        this.goldCoin = new Coin();
        this.leadCoins = [];

        for (let i = 1; i < numberOfCoins; i++) {
            let leadCoin = new Coin();

            this.coins.push(leadCoin);
            this.leadCoins.push(leadCoin);
        }

        this.coins.splice(goldCoinIndex, 0, this.goldCoin);
    }

}