/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import { ConsoleService, ConsoleLogItem } from './console.service';
import { EvalQuizService } from './evalquiz.service';
import { Riddle, RiddleDetail, RiddleState, Member } from './riddle';
import { RiddleRunner, XXX } from './riddle.runner';
import { UIService } from './ui.service';
import { Injectable } from './utils';

@Injectable(module, 'riddleService')
export class RiddleService {

    static $inject = ['evalQuizService', '$http', '$q', '$timeout', 'consoleService', 'uiService'];

    private runner: RiddleRunner | null = null;

    constructor(protected evalQuizService: EvalQuizService, protected $http: ng.IHttpService, protected $q: ng.IQService, protected $timeout: ng.ITimeoutService, protected consoleService: ConsoleService, protected uiService: UIService) {
    }

    prepare(riddle: Riddle): angular.IPromise<Riddle> {
        var deferred = this.$q.defer();

        if (riddle.detail) {
            deferred.resolve(riddle);

            return deferred.promise;
        }

        this.$http.get('riddles/' + riddle.location + '/detail.json').then((result: angular.IHttpPromiseCallbackArg<RiddleDetail>) => {
            let detail = result.data!;

            this.processTextReference(riddle.location, detail, 'description');
            this.processTextReference(riddle.location, detail, 'hints');
            this.processTextReference(riddle.location, detail, 'suite');

            detail.api = detail.api || [];

            detail.api.forEach(member => this.processMember(riddle.location, member));

            this.processMember(riddle.location, detail.member);

            if (!detail.stub) {
                detail.stub = `function ${detail.member.name}(${detail.member.paramsString}) {\n\t\n}`;
            }

            riddle.detail = detail;

            if (!riddle.state.code) {
                riddle.state.code = detail.stub;
            }

            deferred.resolve(riddle);
        }, (err) => {
            deferred.reject(err);
        });

        return deferred.promise;
    }

    private processTextReference(location: string, obj: any, key: string): void {
        let text = obj[key];

        if (text && text.indexOf('file:') === 0) {
            this.$http.get(`riddles/${location}/${text.substring(5).trim()}`).then(
                response => obj[key] = response.data,
                err => console.error(`Failed to resolve text reference "${text}":`, err)
            );

            obj[key] = '...';
        }
    }

    private processMember(location: string, member: Member): Member {
        member.paramsString = '';
        member.signature = member.name;

        this.processTextReference(location, member, 'description');
        this.processTextReference(location, member, 'explanation');

        if (member.params) {
            member.params.forEach(param => {
                this.processMember(location, param);

                param.signatureDescription = `Parameter \`${param.signature}\` - ${param.description}`;
            });

            member.paramsString = member.params.map(param => param.name).join(', ');
            member.signature += `(${member.paramsString})`;
        }

        if (member.properties) {
            member.properties.forEach(property => {
                this.processMember(location, property);

                if (property.signature!.indexOf('(') >= 0) {
                    property.signatureDescription = `Function \`${property.signature}\` - ${property.description}`;
                }
                else {
                    property.signatureDescription = `Property \`${property.signature}\` - ${property.description}`;
                }
            });
        }

        if (member.type) {
            member.signature += `: ${member.type}`;
        }

        return member;
    }

    isSolved(riddle: Riddle): boolean {
        if (!riddle.state) {
            return false;
        }

        return riddle.state.score >= riddle.minScoreToSolve;
    }

    isAvailable(riddle: Riddle): boolean {
        if (!riddle) {
            return false;
        }

        if ((!riddle.dependsOn) || (!riddle.dependsOn.length)) {
            return true;
        }

        for (let riddleId of riddle.dependsOn) {
            let dependsOnRiddle = this.evalQuizService.getRiddle(riddleId);

            if (dependsOnRiddle === undefined) {
                console.error(`Invalid dependsOn declaration "${riddleId}" in riddle "${riddle.id}"`);
            }
            else if (!this.isSolved(dependsOnRiddle)) {
                return false;
            }
        }

        return true;
    }

    get running(): boolean {
        return !!this.runner;
    }

    execute(riddle: Riddle): angular.IPromise<XXX> {
        this.evalQuizService.saveRiddle(riddle);

        this.consoleService.clear();
        this.consoleService.log().markdown(`# ${riddle.title}`);

        let deferred = this.$q.defer<XXX>();

        try {
            this.runner = new RiddleRunner(this.$q, this.uiService, this.consoleService, riddle);

            this.runner.execute().then((result: XXX) => {
                this.runner = null;

                if (result.aborted) {
                    deferred.resolve(result);
                    return;
                }

                let passed: boolean = result.score > 0;

                if (!passed) {
                    this.consoleService.log().withContentClass('center fade-in').markdown('## Tests failed\n\nYour code did not pass all tests.').addClass('error');

                    if (result.messages && result.messages.length) {
                        result.messages.forEach(message => this.consoleService.log(message));
                    }

                    this.consoleService.log().markdown('Refine your code and try again. Good luck.');

                    deferred.resolve(result);
                    return;
                }

                let solved: boolean = result.score >= riddle.minScoreToSolve;
                let logItem = this.consoleService.log().withContentClass('center');

                if (solved) {
                    logItem.h2('Contrgatulations').addClass('fade-in');
                }
                else {
                    logItem.h2('Tests passed').addClass('fade-in');
                }

                logItem.mark(result.score >= 1 ? 'star' : 'no-star').attr('style', 'animation-delay: 0.5s');
                logItem.mark(result.score >= 2 ? 'star' : 'no-star').attr('style', 'animation-delay: 0.75s');
                logItem.mark(result.score >= 3 ? 'star' : 'no-star').attr('style', 'animation-delay: 1s');

                if (solved) {
                    logItem.markdown('You\'ve sovled the riddle!').addClass('move-in').attr('style', 'animation-delay: 1.5s');
                }
                else {
                    logItem.markdown('Your code has passed the tests.').addClass('move-in').attr('style', 'animation-delay: 1.5s');
                }

                this.uiService.postpone(1.5, () => {
                    if (result.messages && result.messages.length) {
                        result.messages.forEach(message => this.consoleService.log(message));
                    }
                });

                if (result.score < 3) {
                    this.uiService.postpone(2, () => {
                        let logItem = this.consoleService.log();

                        if (solved) {
                            if (result.score < 3) {
                                logItem.markdown('Want more stars? Try the next goal of this riddle!').addClass('fade-in');
                            }
                        }
                        else {
                            if (riddle.minScoreToSolve === 2) {
                                let subItem = logItem.sub().withContentClass('fade-in');

                                subItem.write('That was okay, but you need at least two stars (');
                                subItem.icon('fa-star');
                                subItem.space();
                                subItem.icon('fa-star');
                                subItem.space();
                                subItem.icon('fa-star-o');
                                subItem.write(') to solve this level. Keep trying! Can you achieve the next goal?');
                            }

                            if (riddle.minScoreToSolve === 3) {
                                let subItem = logItem.sub().withContentClass('fade-in');

                                subItem.write('That was okay, but you need at least three stars (');
                                subItem.icon('fa-star');
                                subItem.space();
                                subItem.icon('fa-star');
                                subItem.space();
                                subItem.icon('fa-star');
                                subItem.write(') to solve this level. Keep trying! Can you achieve the next goal?');
                            }
                        }

                        let nextGoal = result.score + 1;

                        if (nextGoal <= 3) {
                            let subItem = logItem.sub().withContentClass('layout-row layout-baseline fade-in');

                            subItem.icon(nextGoal >= 1 ? 'fa-star' : 'fa-star-o').addClass('warning');
                            subItem.space();
                            subItem.icon(nextGoal >= 2 ? 'fa-star' : 'fa-star-o').addClass('warning');
                            subItem.space();
                            subItem.icon(nextGoal >= 3 ? 'fa-star' : 'fa-star-o').addClass('warning');
                            subItem.space(3);
                            subItem.markdown(riddle.detail!.goals[nextGoal - 1]);
                        }
                    });
                }

                let nextRiddle = this.evalQuizService.getNextRiddle(riddle);

                if (nextRiddle && this.isAvailable(nextRiddle)) {
                    this.uiService.postpone(2.5, () => {
                        this.consoleService.log("The next riddle is available!").withContentClass('warning move-in');
                    });
                }

                if (result.score > 0) {
                    if (result.score >= riddle.state.score) {
                        riddle.state.score = result.score;
                    }

                    let key = result.score === 1 ? '1 Star' : result.score + ' Stars';

                    riddle.state.savedCode = riddle.state.savedCode || {};
                    riddle.state.savedCode[key] = riddle.state.code!;

                    this.evalQuizService.saveRiddle(riddle);
                }

                deferred.resolve(result);
            }, err => deferred.reject(err));
        }
        catch (err) {
            this.runner = null;

            this.consoleService.log({
                content: `Failed to compile and run code: ${err}`,
                type: 'markdown',
                classname: 'error',
                icon: 'fa-times-circle'
            });

            console.error('Failed to compile and run code:', err);
            
            deferred.reject(err);
        }

        return deferred.promise;
    }

    abort(): void {
        if (this.runner) {
            this.runner.abort();
        }
    }
}

