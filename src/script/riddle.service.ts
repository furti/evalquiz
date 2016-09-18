/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import {ConsoleService, ConsoleBlock} from './console.service';
import {EvalQuizService} from './evalquiz.service';
import {Program} from './program';
import {Riddle, RiddleDetail, RiddleState, Member} from './riddle';
import {UIService} from './ui.service';
import {Service} from './utils';

export interface Result {
    riddle: Riddle;
    score: number;
    message?: string;
}

@Service(module, 'riddleService')
export class RiddleService {

    static $inject = ['evalQuizService', '$http', '$q', 'consoleService', 'uiService'];

    constructor(protected evalQuizService: EvalQuizService, protected $http: ng.IHttpService, protected $q: ng.IQService, protected consoleService: ConsoleService, protected uiService: UIService) {
    }

    prepare(riddle: Riddle): angular.IPromise<Riddle> {
        var deferred = this.$q.defer();

        if (!riddle || riddle.detail) {
            deferred.resolve(riddle);

            return deferred.promise;
        }

        this.$http.get('riddles/' + riddle.location + '/detail.json').then((result: angular.IHttpPromiseCallbackArg<RiddleDetail>) => {
            let detail: RiddleDetail = result.data;

            this.processTextReference(riddle.location, detail, 'description');
            this.processTextReference(riddle.location, detail, 'hints');
            this.processTextReference(riddle.location, detail, 'engine');

            this.processMember(riddle.location, detail.member);

            if (!detail.stub) {
                detail.stub = `function ${detail.member.name}(${detail.member.paramsString}) {\n\t"use strict";\n\t\n\t\n}`;
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
            if (!this.isSolved(this.evalQuizService.getRiddle(riddleId))) {
                return false;
            }
        }

        return true;
    }

    execute(riddle: Riddle): angular.IPromise<Result> {
        let deferred = this.$q.defer<Result>();

        try {
            let solve = this.parseCode(riddle);
            let syntax = this.analyzeCode(riddle);
            let engine = this.buildEngine(riddle);

            this.consoleService.block().markdown('Initializing engine ...');

            engine.init();

            this.consoleService.block().markdown('Starting tests ...');

            let score = engine.run(solve, syntax);

            let result = {
                riddle,
                score, 
                message: 'TODO FIXME WRITEME HATEME KILLME IGNOREME'
            }

            deferred.resolve(result);
        }
        catch (err) {
            deferred.reject(err);
        }
        // let solved = score > 0;

        // if (solved) {
        //     // result.solvedMessage = engine.solvedMessage(result.score);
        //     riddle.state.solved = true;

        //     if (score >= riddle.state.score) {
        //         riddle.state.score = score;
        //     }

        //     let next = this.nextRiddle(<RiddleDetail>riddle);

        //     if (next) {
        //         result.nextRiddleId = next.id;

        //         this.storageService.save(riddle, next);
        //     }
        //     else {
        //         this.storageService.save(riddle);
        //     }
        // }
        // else {
        //     result.failedMessage = engine.failedMessage();

        //     this.storageService.save(riddle);
        // }

        return deferred.promise;
    }

    private parseCode(riddle: Riddle): any {
        var create = new Function('return ' + riddle.state.code.trim());

        return create();
    }

    private analyzeCode(riddle: Riddle): Program {
        var syntax = new Program(riddle.state.code.trim());

        return syntax;
    }

    private buildEngine(riddle: Riddle): any {
        var factory = new Function('return ' + riddle.detail.engine);

        return factory();
    }

}


