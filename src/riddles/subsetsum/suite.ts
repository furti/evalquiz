/// <reference path="./../index.d.ts" />

interface Config {
    count: number,
    maximum: number
}

const DAYS = 7;
const CONFIG: Config[] = [{
    count: 4,
    maximum: 100
}, {
    count: 8,
    maximum: 300
}, {
    count: 16,
    maximum: 500
}, {
    count: 32,
    maximum: 500
}, {
    count: 32,
    maximum: 500
}, {
    count: 32,
    maximum: 500
}, {
    count: 32,
    maximum: 500
}];

export class Suite {

    private samples: number[][];
    private logItem: suite.LogItem;

    constructor(private context: suite.Context) {
    }

    log(message: any): void {
        this.context.log({
            content: message,
            type: 'plain'
        });
    }

    testInit(): void {
        let count = 0;

        this.samples = [];

        for (let day = 0; day < DAYS; day++) {
            this.samples[day] = [];

            let max = Math.round(Math.random() * CONFIG[day].maximum / 20) * 10 + CONFIG[day].maximum / 2;

            for (var i = 0; i < CONFIG[day].count; i++) {
                this.samples[day][i] = -max + Math.round(max * 2 * i / (CONFIG[day].count - 1) / 10) * 10;
                count++;
            }

            this.shuffle(this.samples[day]);
        }

        this.context.log({
            content: `Peter and Jürgen collected ${count} values during ${DAYS} days.`,
            type: 'markdown',
            classname: 'info',
            icon: 'fa-info-circle'
        });
    }

    test1(): angular.IPromise<void> {
        return this.execute(1);
    }

    test2(): angular.IPromise<void> {
        return this.execute(2);
    }

    test3(): angular.IPromise<void> {
        return this.execute(3);
    }

    test4(): angular.IPromise<void> {
        return this.execute(4);
    }

    test5(): angular.IPromise<void> {
        return this.execute(5);
    }

    test6(): angular.IPromise<void> {
        return this.execute(6);
    }

    test7(): angular.IPromise<void> {
        return this.execute(7);
    }

    execute(day: number): angular.IPromise<void> {
        let data = this.samples[day - 1];
        let maximum: number = 0;
        let current: number = 0;
        let start: number | undefined;
        let end: number | undefined;

        for (let i = 0; i < data.length; i++) {
            if (maximum + data[i] > maximum) {
                maximum += data[i];
                start = start || i;
                end = i;
            }
            else {
                if (data[i] > 0) {
                    start = end = i;
                    maximum = data[i];
                }
                else {
                    maximum = 0;
                }
            }
        }

        console.log(`start: ${start}, end: ${end}`);

        let texts = data.map(v => v.toString());

        texts[start!] = '!' + texts[start!];
        texts[end!] = '!' + texts[end!];

        if (texts.length > 40) {
            texts.splice(32, texts.length - 36, ' ...');
        }

        for (let i = texts.length - 1; i > 0; i--) {
            texts.splice(i, 0, ', ');
        }

        texts.push('.');
        // texts[texts.length - 1] = data[data.length - 1] + '.';

        return this.context.sequence<void>(() => {
            this.logItem = this.context.log();
            this.logItem.markdown(`Day ${day}: ${data.length} values`).addClass('large');
        }, 0.5, () => this.context.map(texts, text => {
            return this.context.postpone(1 / 16, () => {
                if (text!.indexOf('!') === 0) {
                    this.logItem.write(text!.substring(1)).addClass('warning fade-in');
                }
                else {
                    this.logItem.write(text).addClass('info fade-in');
                }
            });
        }));
    }

    shuffle<Any>(array: Any[]): Any[] {
        for (let i = array.length; i > 0; i--) {
            let j = Math.floor(Math.random() * i);
            let tmp = array[i - 1];
            array[i - 1] = array[j];
            array[j] = tmp;
        }

        return array;
    }

}


