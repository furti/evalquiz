/// <reference path="./../index.d.ts" />

export class Coin {

}

export interface Sack {

    getCoins(numberOfCoins?: number | undefined | null): Coin[];

}

export class Set {
    sacks: Sack[] = [];
    leadSacks: Sack[] = [];
    goldSacks: Sack[] = [];
    coins: Coin[] = [];
    leadCoins: Coin[] = [];
    goldCoins: Coin[] = [];
    others: any[] = [];
    weight: number = 0;
}

export class Suite {

    private logItem: suite.LogItem;
    private weightings: number = 0;
    private weightingLogs: string[] = [];
    private sacks: Sack[];
    private goldSack: Sack;
    private leadSacks: Sack[];
    private coinsOfSacks: Coin[][];
    private goldCoins: Coin[];
    private leadCoins: Coin[];
    private selected: any;

    constructor(private context: suite.Context) {
    }

    weight(thing: any): number {
        this.weightings++;

        let set = this.isolate(thing);
        let what: string[] = [];

        if (set.sacks.length > 1) {
            what.push(set.sacks.length + ' sacks');
        }
        else if (set.sacks.length > 0) {
            what.push('one sack');
        }

        if (set.coins.length > 1) {
            what.push(set.coins.length + ' coins');
        }
        else if (set.coins.length > 0) {
            what.push('one coin');
        }

        if (set.sacks.length + set.coins.length === 0) {
            what.push('nothing');
        }

        let text = `You weight ${what.join(', ')} with ${set.weight} gram.`

        if (set.others.length > 1) {
            text += ` Let's ignore the ${set.others.length} other things.`;
        }
        else if (set.others.length > 0) {
            text += ` Let's ignore the other thing.`;
        }

        this.weightingLogs.push(text);

        return set.weight;
    }

    private isolate(thing: any, set: Set = new Set()): Set {
        if (!thing || (angular.isArray(thing) && thing.length === 0)) {
            return set;
        }

        if (angular.isArray(thing)) {
            (thing as any[]).forEach(sackOrCoin => this.isolate(sackOrCoin, set));

            return set;
        }

        if (this.isGoldSack(thing)) {
            set.sacks.push(thing as Sack);
            set.goldSacks.push(thing as Sack);
            set.weight += this.getWeightOfThing(thing);

            return set;
        }

        if (this.isLeadSack(thing)) {
            set.sacks.push(thing as Sack);
            set.leadSacks.push(thing as Sack);
            set.weight += this.getWeightOfThing(thing);

            return set;
        }

        if (this.isGoldCoin(thing)) {
            set.coins.push(thing as Coin);
            set.goldCoins.push(thing as Coin);
            set.weight += this.getWeightOfThing(thing);

            return set;
        }

        if (this.isLeadCoin(thing)) {
            set.coins.push(thing as Coin);
            set.goldCoins.push(thing as Coin);
            set.weight += this.getWeightOfThing(thing);

            return set;
        }

        set.others.push(thing);

        return set;
    }

    private getCoinsOfSack(sack: any): Coin[] {
        let index = this.sacks.indexOf(sack)

        if (index < 0) {
            return [];
        }

        return this.coinsOfSacks[index];
    }

    private getWeightOfThings(things: any[]): number {
        return things.map(thing => this.getWeightOfThing(thing)).reduce((a, b) => a + b, 0);
    }

    private getWeightOfThing(thing: any): number {
        if (angular.isArray(thing)) {
            return this.getWeightOfThings(thing as any[]);
        }

        if (this.isGoldSack(thing) || this.isLeadSack(thing)) {
            return this.getWeightOfThings(this.getCoinsOfSack(thing));
        }

        if (this.isGoldCoin(thing)) {
            return 11;
        }

        if (this.isLeadCoin(thing)) {
            return 10;
        }

        return 0;
    }

    private isGoldSack(thing: any): boolean {
        return this.goldSack === thing;
    }

    private isLeadSack(thing: any): boolean {
        return this.leadSacks.indexOf(thing) >= 0;
    }

    private isGoldCoin(thing: any): boolean {
        return this.goldCoins.indexOf(thing) >= 0;
    }

    private isLeadCoin(thing: any): boolean {
        return this.leadCoins.indexOf(thing) >= 0;
    }

    log(message: any): void {
        this.context.log({
            content: message,
            type: 'plain'
        });
    }

    test(): angular.IPromise<void> {
        let deferred = this.context.defer<void>();
        let numberOfSacks = 25;
        let index = this.prepare(numberOfSacks, 100);

        this.logItem = this.context.log();
        this.logItem.markdown(`Captain Coppercranium places **${numberOfSacks} sacks** infront of you.`);

        return this.context.sequence<void>(0.5, () => {
            return this.context.map(this.sacks, sack => {
                return this.context.postpone(0.125, () => {
                    if (this.isGoldSack(sack)) {
                        this.logItem.html('<img src="/riddles/badmoney/sack.svg" class="move-in">');
                    }
                    else {
                        this.logItem.html('<img src="/riddles/badmoney/bad_sack.svg" class="move-in">');
                    }
                });
            });
        }, 0.5, () => {
            this.selected = this.context.invokeFn(this.sacks.slice());

            if (this.weightingLogs.length > 10) {
                this.weightingLogs.splice(5, this.weightingLogs.length - 7, '...');
            }

            return this.context.map(this.weightingLogs, log => {
                return this.context.postpone(0.25, () => {
                    this.logItem.markdown(log!).addClass('info');
                });
            });
        }, 0.5, () => {
            this.verify(this.selected, this.weightings);
        });


        // let selectedSack = this.context.invokeFn(this.sacks);

        // this.verify(selectedSack);
    }

    prepare(numberOfSacks: number, numberOfCoins: number): number {
        let index = Math.floor(Math.random() * (numberOfSacks - 2)) + 1;

        this.weightings = 0;
        this.sacks = [];
        this.leadSacks = [];
        this.coinsOfSacks = [];
        this.goldCoins = [];
        this.leadCoins = [];
        this.selected = undefined;

        for (let i = 0; i < numberOfSacks; i++) {
            let coins: Coin[] = [];

            for (let j = 0; j < numberOfCoins; j++) {
                coins.push(new Coin());
            }

            let sack = {
                getCoins: (numberOfCoins?: number | undefined | null): Coin[] => {
                    if (numberOfCoins === undefined) {
                        return coins.splice(0, coins.length);
                    }

                    if (numberOfCoins === null || numberOfCoins < 0) {
                        this.context.log({
                            content: `You cannot take **${numberOfCoins} coins** out of whatever - at least not in this universe.`,
                            type: 'markdown',
                            icon: 'fa-error-circle',
                            classname: 'error'
                        });

                        return [];
                    }

                    if (numberOfCoins > coins.length) {
                        this.context.log({
                            content: `You cannot take **${numberOfCoins} coins** out of a sack with **${coins.length} coins** in it, you greedy fool.`,
                            type: 'markdown',
                            icon: 'fa-error-circle',
                            classname: 'error'
                        });

                        return [];
                    }

                    return coins.splice(0, numberOfCoins);
                }
            };

            this.sacks.push(sack);
            this.coinsOfSacks.push(coins);

            if (i === index) {
                this.goldSack = sack;
                this.goldCoins.push(...coins);
            }
            else {
                this.leadSacks.push(sack);
                this.leadCoins.push(...coins);
            }
        }

        return index;
    }

    verify(selected: any, weightings: number): void {
        let set = this.isolate(selected);

        if (set.sacks.length === 1 && set.goldSacks.length === 1) {
            if (set.coins.length > 1 || set.others.length > 1) {
                this.context.log({
                    content: 'You have choosen the right sack, but took other things, too. Captain Coppercranium respects your curiosity and just cuts off ears.',
                    type: 'markdown',
                    icon: 'fa-error-circle',
                    classname: 'error'
                });

                this.context.fail();
                return;
            }

            if (weightings <= 0) {
                this.context.log({
                    content: 'You are cheating! Captain Coppercranium respects your ingenuity and just cuts off your head.',
                    type: 'markdown',
                    icon: 'fa-error-circle',
                    classname: 'error'
                });

                this.context.fail();
                return;
            }

            if (weightings === 1) {
                this.context.log({
                    content: '**You choose the right sack with only one weighing.**\n\nCaptain Coppercranium admires your skill.',
                    type: 'markdown',
                    icon: 'fa-thumbs-up',
                    classname: 'warning'
                });

                this.context.score = 3;
                return;
            }

            this.context.log({
                content: `**You choose the right sack.**\n\nBut it took you **${weightings} weightings**. Captain Coppercranium respects your endurance, but he will not let you go.`,
                type: 'markdown',
                icon: 'fa-thumbs-up',
                classname: 'warning'
            });

            this.context.score = 1;
            this.context.stop();
            return;

        }

        if (set.sacks.length === 0 && set.coins.length === 0 && set.others.length === 0) {
            this.context.log({
                content: 'You took nothing. Captain Coppercranium respects your modesty and just cuts off your tongue.',
                type: 'markdown',
                icon: 'fa-error-circle',
                classname: 'error'
            });

            this.context.fail();
            return;
        }

        if (set.sacks.length > 1) {
            this.context.log({
                content: 'You did take multiple sacks. Captain Coppercranium respects your greed and just cuts off your hands.',
                type: 'markdown',
                icon: 'fa-error-circle',
                classname: 'error'
            });

            this.context.fail();
            return;
        }

        if (set.coins.length > 1) {
            this.context.log({
                content: 'You did take loose coins. Captain Coppercranium respects your haste and just cuts off your feet.',
                type: 'markdown',
                icon: 'fa-error-circle',
                classname: 'error'
            });

            this.context.fail();
            return;
        }

        if (set.sacks.length === 1) {
            this.context.log({
                content: 'You did pick the wrong sack. Captain Coppercranium has not respect for this and will cut you into tiny little pieces.',
                type: 'markdown',
                icon: 'fa-error-circle',
                classname: 'error'
            });

            this.context.fail();
            return;
        }

        if (set.coins.length === 1) {
            this.context.log({
                content: 'You did take a single coin? Captain Coppercranium respects your persnicketiness and just cuts off your fingers.',
                type: 'markdown',
                icon: 'fa-error-circle',
                classname: 'error'
            });

            this.context.fail();
            return;
        }

        this.context.log({
            content: 'What\'s that in your hands? Captain Coppercranium respects your disgustingty and just cuts off your toes.',
            type: 'markdown',
            icon: 'fa-error-circle',
            classname: 'error'
        });

        this.context.fail();
    }
}