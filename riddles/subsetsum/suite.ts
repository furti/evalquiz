/// <reference path="./../index.d.ts" />

interface Config {
    count: number;
    maximum: number;
    step: number;
}

const DAYS = 7;
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CONFIG: Config[] = [{
    count: 8,
    maximum: 100,
    step: 10
}, {
    count: 12,
    maximum: 200,
    step: 10
}, {
    count: 16,
    maximum: 400,
    step: 10
}, {
    count: 32,
    maximum: 600,
    step: 10
}, {
    count: 64,
    maximum: 600,
    step: 10
}, {
    count: 256,
    maximum: 200,
    step: 5
}, {
    count: 1024,
    maximum: 100,
    step: 1
}];
const MAX_LENGTH = 24;

interface Day {
    index: number;
    data: number[];
    maximum: number;
    start: number;
    end: number;
}

export class Suite {

    private days: Day[];
    private logItem: suite.LogItem;
    private complexity: string;

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

        this.days = [];

        for (let i = 0; i < DAYS; i++) {
            this.days[i] = this.create(i, CONFIG[i]);

            count += this.days[i].data.length;
        }

        this.context.log({
            content: `Peter and Jürgen collected ${count} values during ${DAYS} days in Austria.`,
            type: 'markdown',
            classname: 'info',
            icon: 'fa-info-circle'
        });
    }

    testDay1(): angular.IPromise<void> {
        return this.execute(this.days[0]);
    }

    testDay2(): angular.IPromise<void> {
        return this.execute(this.days[1]);
    }

    testDay3(): angular.IPromise<void> {
        return this.execute(this.days[2]);
    }

    testDay4(): angular.IPromise<void> | void {
        if (this.context.maxScore <= 0) {
            return;
        }

        return this.execute(this.days[3]);
    }

    testDay5(): angular.IPromise<void> | void {
        if (this.context.maxScore <= 0) {
            return;
        }

        return this.execute(this.days[4]);
    }

    testDay6(): angular.IPromise<void> | void {
        if (this.context.maxScore <= 0) {
            return;
        }

        return this.execute(this.days[5]);
    }

    testDay7(): angular.IPromise<void> | void {
        if (this.context.maxScore <= 0) {
            return;
        }

        return this.execute(this.days[6]);
    }

    testComplexity(): void {
        if (this.context.maxScore < 3) {
            return;
        }

        let success = true;
        let classname = 'fade-in';

        if (this.complexity === 'O(n)') {
            classname += ' success';
        }
        else {
            this.context.maxScore = 1;
            success = false;
            classname += ' warning';

            this.context.message({
                content: 'This problem can be solved with a single loop, that uses each data value just once.',
                type: 'markdown',
                classname: 'warning fade-in',
                icon: 'fa-info-circle'
            });
        }

        let logItem = this.context.log({
            content: `The algorithm has a complexity of ${this.complexity}.`,
            type: 'plain',
            classname,
            icon: 'fa-info-circle'
        });

        if (success) {
            logItem.mark('ok');
        };
    }

    testConditions(): void {
        if (this.context.maxScore < 3) {
            return;
        }

        let classname = 'fade-in';
        let count = this.context.countConditions();

        if (count <= 0) {
            classname += ' success';

            let logItem = this.context.log({
                content: `The code does not contain any conditional statements.`,
                type: 'plain',
                classname,
                icon: 'fa-info-circle'
            });

            logItem.mark('ok');
        }
        else {
            this.context.maxScore = 2;
        }
    }

    create(index: number, config: Config): Day {
        let range = Math.round(Math.random() * config.maximum / (config.step * 2)) * config.step + config.maximum / 2;
        let data: number[] = [];

        for (let i = 0; i < config.count; i++) {
            data.push(-range + Math.round(range * 2 * i / (config.count - 1) / config.step) * config.step);
        }

        while (true) {
            this.shuffle(data);

            let maximum: number = 0;
            let current: number = 0;
            let start: number = 0;
            let nextStart: number = 0;
            let end: number = 0;

            for (let i = 0; i < data.length; i++) {
                current = Math.max(0, current + data[i]);

                if (current <= 0) {
                    nextStart = i + 1;
                }

                if (current > maximum) {
                    maximum = current;
                    start = nextStart;
                    end = i;
                }
            }

            if (start > 0 && end < data.length - 1 && end - start > config.count / 4) {
                return { index, data, maximum, start, end };
            }
        }
    }

    execute(day: Day): angular.IPromise<void> {
        return this.context.sequence<void>(() => {
            this.logItem = this.context.log();
            this.logItem.markdown(`${DAY_NAMES[day.index]}: ${day.data.length} values`).addClass('large');
        },
            0.5, () => this.write(day),
            0.5, () => {
                this.logItem.markdown(`Expected result: ${day.maximum} ft`);
            },
            0.5, () => {
                let result = this.context.invokeInstrumentedFn(day.data.slice());
                let element = this.logItem.write(`Your result: ${result} ft`);

                this.complexity = this.context.estimateComplexity(day.data.length, this.complexity);

                if (result === day.maximum) {
                    element.addClass('success');
                    this.logItem.mark('ok');
                    this.context.maxScore = 3;
                }
                else {
                    element.addClass('error');
                    this.logItem.mark('not-ok');
                    this.context.maxScore = 0;
                }
            });
    }

    write(day: Day): angular.IPromise<void> {
        let visuals = day.data.map(v => {
            return {
                text: v.toString(),
                highlight: false
            }
        });

        let visualStart = day.start;
        let visualEnd = day.end;

        visuals[day.start].highlight = true;
        visuals[day.end].highlight = true;

        if (visuals.length > MAX_LENGTH && visualStart > 4) {
            let cutLength = Math.min(visualStart - 2, visuals.length - MAX_LENGTH);

            visualStart -= cutLength;
            visualEnd -= cutLength;
            visuals.splice(0, cutLength,
                {
                    text: '... ',
                    highlight: false
                }
            );
        }

        if (visuals.length > MAX_LENGTH && visualEnd < visuals.length - 4) {
            let cutStart = Math.max(visualEnd + 4, MAX_LENGTH);

            visuals.splice(cutStart, visuals.length - cutStart,
                {
                    text: '... ',
                    highlight: false
                }
            );
        }

        if (visuals.length > MAX_LENGTH) {
            let cutLength = Math.min(visualEnd - visualStart - 4, visuals.length - MAX_LENGTH);

            visuals.splice(Math.floor((visualStart + visualEnd - cutLength) / 2), cutLength, {
                text: '... ',
                highlight: false
            });
        }

        for (let i = visuals.length - 1; i > 0; i--) {
            visuals.splice(i, 0, {
                text: ', ',
                highlight: false
            });
        }

        visuals.push({
            text: '.',
            highlight: false
        });

        return this.context.map(visuals, visual => {
            return this.context.postpone(1 / 16, () => {
                let element = this.logItem.write(visual!.text);

                if (!visual!.highlight) {
                    element.addClass('info');
                }

                element.addClass('fade-in');
            });
        });
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


