/// <reference path="./../index.d.ts" />

export class Suite {

    private hp = 1000000;
    private performAttack: boolean = false;

    private faster = false;
    private correct = false;


    constructor(private context: suite.Context) {
    }

    log(message: any): void {
        this.context.log(message);
    }

    attack(): void {
        this.performAttack = true;
    }

    doAttack(dwarf: number): angular.IPromise<boolean> {
        let logItem: suite.LogItem = this.context.log();

        logItem.markdown(`**The dwarf** has **${Math.floor(Math.random() * 10 + 10)} HPs**.`);

        return this.context.sequence(
            0.25,
            () => {
                logItem.markdown(`![Dwarf](/riddles/dwarfs/dwarf_${dwarf}.svg) **The dwarf** attacks **the dragon** with **bare hands**.`).addClass('info');
            },
            1,
            () => {
                let d = Math.floor(Math.random() * 18);

                if (d < 1) {
                    logItem.markdown("**The dwarf** hits **himself**.").addClass('warning');
                }
                else if (d < 12) {
                    logItem.markdown("**The dwarf** misses **the dragon**.").addClass('warning');;
                }
                else if (d > 16) {
                    this.hp = Math.round(this.hp / 2);

                    logItem.markdown("**The dwarf** hits **the dragon** with a critical hit.").addClass('warning');;
                }
                else {
                    d = d - 11;
                    this.hp -= d;

                    logItem.markdown(`**The dwarf** hits **the dragon**.`).addClass('warning');;
                }
            },
            1,
            () => {
                logItem.markdown(`**The dragon** has **${this.hp} HPs**.`);
            },
            0.25,
            () => {
                logItem.markdown("**The dragon** attacks **the dwarf** with **fire**.").addClass('info');
            },
            1,
            () => {
                logItem.markdown("**The dragon** hits **the dwarf**.").addClass('warning');
            },
            0.25,
            () => {
                logItem.markdown("It smells of fried dwarf. **The dwarf** is dead.").addClass('error');
                return false;
            }
        );
    }

    test(): angular.IPromise<suite.Result> {
        let dwarfs: number[] = [];

        for (let i = 0; i < 8; i++) {
            dwarfs.push(i);
        }

        this.shuffle(dwarfs);

        return this.execute(0.5, false, dwarfs);
    }

    testSecondTake(): angular.IPromise<suite.Result> | undefined {
        if (this.context.isFailure()) {
            return;
        }
        
        this.context.log().markdown('The dragon couldn\'t believe, that the dwarfs solved his riddle. He decided to capture more dwarfs to try once more.');

        let dwarfs: number[] = [];

        for (let i = 0; i < 64; i++) {
            dwarfs.push(i % 8);
        }

        this.shuffle(dwarfs);

        return this.execute(0.125, true, dwarfs);
    }

    

    execute(delay: number, small: boolean, dwarfs: number[]): angular.IPromise<suite.Result> {
        let deferred = this.context.defer<suite.Result>();
        let line: number[] = [];
        let log = this.context.log();
        let content = log.content;

        this.context.map(dwarfs, dwarf => this.leaveCave(content, delay, small, dwarf!, line)).then((results: boolean[]) => {
            let missing = results.indexOf(false) >= 0;

            if (missing) {
                log.mark('not-ok');
                this.context.log().withIcon('fa-times-circle').withClass('error').markdown("There are dwarfs missing in the line.");
                deferred.resolve({
                    success: false
                });
                return;
            }

            let blues = line.map(dwarf => dwarf < 4);
            let failed = blues[0] ? (blues.lastIndexOf(true) > blues.indexOf(false)) : (blues.lastIndexOf(false) > blues.indexOf(true));

            if (failed) {
                log.mark('not-ok');
                this.context.log().withIcon('fa-times-circle').withClass('error').markdown("The dwarfs failed to line up correctly.");
                deferred.resolve({
                    success: false
                });
                return;
            }

            log.mark('ok');
            deferred.resolve({
                success: true
            });
        }, err => deferred.reject(err));

        return deferred.promise;
    }

    leaveCave(content: JQuery, delay: number, small: boolean, dwarf: number, line: number[]): angular.IPromise<boolean> {
        return this.context.postpone(delay, () => {
            let hats: string[] = line.map(dwarf => dwarf <= 3 ? 'red' : 'blue');
            let originalHats: string[] = hats.slice();
            let index = this.context.invokeFn(hats);

            if (!angular.equals(hats, originalHats)) {
                this.context.addMessage('You are manipulation the hats array. This serves no purpose, as it will not reorder the dwarfs.')
            }

            if (this.performAttack) {
                this.performAttack = false;
                return this.doAttack(dwarf);
            }

            if (index === null || index === undefined) {
                this.context.log().withIcon('fa-exclamation-circle').withClass('warning').markdown(`![Dwarf](/riddles/dwarfs/dwarf_${dwarf}.svg) A dwarf abandonned himself to despair (the function returned ${index}).`);
                return false;
            }

            if (index < 0 || index > line.length) {
                this.context.log().withIcon('fa-exclamation-circle').withClass('warning').markdown(`![Dwarf](/riddles/dwarfs/dwarf_${dwarf}.svg) A dwarf places himself at position ${index} of ${line.length} dwarfs. He got eaten by the dragon for this impossibility.`);
                return false;
            }


            let element = angular.element(`<img src="/riddles/dwarfs/dwarf_${dwarf}.svg" class="move-in">`);

            if (small) {
                element.attr('style', 'max-width: 16px');
            }

            if (content.is(':empty') || index >= line.length) {
                content.append(element);
            }
            else {
                element.insertBefore(content.find(':nth-child(' + (index + 1) + ')'));
            }

            line.splice(index, 0, dwarf);

            return true;
        });
    }

    shuffle(a) {
        var j, x, i;
        for (i = a.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = a[i - 1];
            a[i - 1] = a[j];
            a[j] = x;
        }
    }

}


