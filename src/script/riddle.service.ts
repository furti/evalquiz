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
                err => console.error(`Failed to resolve text reference "${text}": %o`, err)
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

                property.signatureDescription = `Property \`${property.signature}\` - ${property.description}`;
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

    execute(riddle: Riddle): angular.IPromise<XXX> {
        this.evalQuizService.saveRiddle(riddle);

        this.consoleService.clear();
        this.consoleService.log().markdown(`# Solving riddle: ${riddle.title}`);

        let deferred = this.$q.defer<XXX>();

        try {
            let runner = new RiddleRunner(this.$q, this.uiService, this.consoleService, riddle);

            runner.execute().then((result: XXX) => {
                let passed: boolean = result.score > 0;
                let solved: boolean = result.score >= riddle.minScoreToSolve;

                if (!passed) {
                    this.consoleService.log().withClass("error").markdown('## Tests failed\n\nYour code failed to pass the tests.');

                    if (result.message) {
                        this.consoleService.log().markdown(result.message);
                    }

                    this.consoleService.log('Refine your code and try again. Good luck.');
                }
                else {
                    let logItem = this.consoleService.log().withClass('large');

                    logItem.mark('star').addClass('xlarge');
                    logItem.mark('star').addClass('xlarge');
                    logItem.mark('star').addClass('xlarge');
                    // .markdown('## Bravo\n\nYour code passed all tests.');

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

                deferred.resolve();
            }, err => deferred.reject(err));
        }
        catch (err) {
            deferred.reject(err);
        }

        // try {
        //     let solve = this.parseCode(riddle);
        //     let syntax = this.analyzeCode(riddle);
        //     let engine = this.buildEngine(riddle);

        //     this.consoleService.block().markdown('Initializing engine ...');

        //     engine.init();

        //     this.consoleService.block().markdown('Starting tests ...');

        //     let score = engine.run(solve, syntax);

        //     let result = {
        //         riddle,
        //         score, 
        //         message: 'TODO FIXME WRITEME HATEME KILLME IGNOREME'
        //     }

        //     deferred.resolve(result);
        // }
        // catch (err) {
        //     deferred.reject(err);
        // }

        return deferred.promise;
    }

}

