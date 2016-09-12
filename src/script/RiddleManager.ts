/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

import {Program} from './Program';
import {SaveGame, StorageService} from './StorageService';
import UIService from './UIService';
import {Service} from './Utils';

var SAVE_GAME_KEY = 'riddleQuiz.saveGames';
var LAST_RIDDLE_KEY = 'riddleQuiz.lastPlayedRiddle';

export interface RiddleData {
    id: string;
    level: number;
    title: string;
    shortDescription: string;
    goals: Array<String>;
    minScoreToSolve: number;
    finished: boolean;
    score: number;
}

export interface Riddle extends RiddleData {
    description: string;
    member: Member;
    code: string;
    engine: string;
}

interface FullRiddle extends Riddle {
    location: string;
    initialized: boolean;
}

export interface Member {
    name?: string;
    type?: string;
    description?: string;
    explanation?: string;
    params?: Member[];
    properties?: Member[];
    signature?: string;
    signatureDescription?: string;
    stub?: string;
}

export interface Result {
    solved: boolean;
    score: number;
    riddle: Riddle;
    nextRiddleId?: string;
    solvedMessage?: string;
    failedMessage?: string;
}

@Service(module, 'riddleManager')
export class RiddleManager {
    public initialized: boolean = false;
    public riddleList: FullRiddle[];
    protected riddleMap: { [id: string]: FullRiddle };

    static $inject = ['$http', '$q', 'storageService', 'uiService'];

    constructor(protected $http: ng.IHttpService, protected $q: ng.IQService, protected storageService: StorageService, protected uiService: UIService) {
    }

    /**
     * Loads the index of the riddles from the the riddle.json file.
     * 
     * @memberOf RiddleManager
     */
    public setupRiddles(): angular.IPromise<any> {
        let deferred = this.$q.defer();

        this.initialized = false;
        this.riddleList = null;
        this.riddleMap = null;

        this.$http.get('riddles/riddles.json').then(response => {
            let riddles: FullRiddle[] = response.data as FullRiddle[];

            for (let i = 0; i < riddles.length; i++) {
                riddles[i].level = i + 1;
            }

            this.prepareRiddles(riddles);

            deferred.resolve();
        }, (error: any) => {
            this.uiService.alert('Loading Riddles', 'Unfortunately, the index file of the riddles could not be loaded. This is a show stopper. Sorry.');

            deferred.reject();
        });

        return deferred.promise;
    }

    /**
     * Load the saved games and add the data to the riddle index. Additionally it initilized the local riddle map
     * that holds all the riddles with the id as key.
     * 
     * @private
     * @param {FullRiddle[]} riddles the riddle index
     * @returns {void}
     * 
     * @memberOf RiddleManager
     */
    private prepareRiddles(riddles: FullRiddle[]): void {
        if (!riddles) {
            return;
        }

        let saveGames = this.storageService.loadSaveGames();

        this.riddleMap = {};

        riddles.forEach((riddle) => {
            this.riddleMap[riddle.id] = riddle;

            riddle.score = riddle.score || (riddle.finished ? 1 : 0);
        });

        for (let id in saveGames) {
            let riddle = this.riddleMap[id];

            if (riddle) {
                riddle.finished = saveGames[id].finished;
                riddle.score = saveGames[id].score;

                if (saveGames[id].code) {
                    riddle.code = saveGames[id].code;
                }
            }
        }

        this.riddleList = riddles;
        this.initialized = true;
    }

    public startRiddle(riddleId: string): angular.IPromise<Riddle> {
        var promise = this.initializeRiddle(riddleId);

        promise.then(() => {
            this.storageService.storeLastPlayedRiddleId(riddleId);
        });

        return promise;
    }

    /**
     * Loads the riddle data from the site. Initialized all the necessary information for playing this level.
     * 
     * @private
     * @param {string} riddleId the id of the riddle
     * @returns {angular.IPromise<FullRiddle>} a promise delivering the riddle
     * 
     * @memberOf RiddleManager
     */
    private initializeRiddle(riddleId: string): angular.IPromise<FullRiddle> {
        var defered = this.$q.defer();

        let riddle = this.riddleMap[riddleId];

        if (!riddle || riddle.initialized) {
            defered.resolve(riddle);

            return defered.promise;
        }

        //Load the description
        let descriptionPromise = this.$http.get('riddles/' + riddle.location + '/description.md');
        let functionPromise = this.$http.get('riddles/' + riddle.location + '/function.json');
        let functionEnginePromise = this.$http.get('riddles/' + riddle.location + '/engine.js');

        //Wait until all data is available
        this.$q.all({
            'description': descriptionPromise,
            'member': functionPromise,
            'functionEngine': functionEnginePromise
        }).then((data: any) => {
            riddle.description = data.description.data;
            riddle.engine = data.functionEngine.data;
            riddle.member = this.processMember(riddle, data.member.data);

            if (!riddle.code) {
                riddle.code = riddle.member.stub;
            }

            riddle.initialized = true;

            defered.resolve(riddle);
        });

        return defered.promise;
    }

    private processMember(riddle: FullRiddle, member: Member): Member {
        member.signature = member.name;

        this.processMemberReference(riddle, member, 'description');
        this.processMemberReference(riddle, member, 'explanation');

        if (member.params) {
            member.params.forEach(param => {
                this.processMember(riddle, param);

                param.signatureDescription = `Parameter \`${param.signature}\` - ${param.description}`;
            });

            let paramsString = member.params.map(param => param.name).join(', ');

            member.signature += `(${paramsString})`;
            member.stub = `function ${member.name}(${paramsString}) {\n\t"use strict";\n\t\n\t\n}`;
        }

        if (member.properties) {
            member.properties.forEach(property => {
                this.processMember(riddle, property);

                property.signatureDescription = `Property \`${property.signature}\` - ${property.description}`;
            });
        }

        if (member.type) {
            member.signature += `: ${member.type}`;
        }

        return member;
    }

    private processMemberReference(riddle: FullRiddle, member: Member, key: string): void {
        let text = member[key];

        if (text && text.indexOf('file:') === 0) {
            this.$http.get(`riddles/${riddle.location}/${text.substring(5).trim()}`).then(response => member[key] = response.data);
            member[key] = '';
        }
    }

    public saveRiddle(riddle: Riddle): void {
        this.storageService.storeSaveGames(riddle);
    }

    public solveRiddle(riddle: Riddle): Result {
        var solve = this.parseCode(riddle);
        var syntax = this.analyzeCode(riddle);
        var riddleEngine = this.buildEngine(riddle);

        riddleEngine.init();

        var score = riddleEngine.run(solve, syntax);
        var solved = score > 0;

        var result: Result = {
            solved: solved,
            score: score,
            riddle: riddle
        };

        if (solved) {
            result.solvedMessage = riddleEngine.solvedMessage(result.score);
            riddle.finished = true;

            if (score >= riddle.score) {
                riddle.score = score;
            }

            var next = this.nextRiddle(<FullRiddle>riddle);

            if (next) {
                result.nextRiddleId = next.id;

                this.storageService.storeSaveGames(riddle, next);
            }
            else {
                this.storageService.storeSaveGames(riddle);
            }
        }
        else {
            result.failedMessage = riddleEngine.failedMessage();

            this.storageService.storeSaveGames(riddle);
        }

        return result;
    }

    private nextRiddle(riddle: FullRiddle): FullRiddle {
        //Get the position of the actual riddle
        var pos = this.riddleList.indexOf(riddle);

        //If more riddles are available --> return the next one.
        if (this.riddleList.length > pos + 1) {
            return this.riddleList[pos + 1];
        }
    }

    private parseCode(riddle: Riddle): any {
        var create = new Function('return ' + riddle.code.trim());

        return create();
    }

    private analyzeCode(riddle: Riddle): Program {
        var syntax = new Program(riddle.code);

        return syntax;
    }

    private buildEngine(riddle: Riddle): any {
        var factory = new Function('return ' + riddle.engine);

        return factory();
    }

}


