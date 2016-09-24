/// <reference path="./index.d.ts" />

let module = angular.module('evalquiz');

export interface Member {
    name: string;
    type: string;
    description?: string;
    explanation?: string;
    params?: Member[];
    paramsString?: string;
    properties?: Member[];
    signature?: string;
    signatureDescription?: string;
}

export interface RiddleDetail {
    goals: string[];
    description: string;
    hints: string;
    api: Member[];
    member: Member;
    suite: string;

    stub?: string;
}

export interface RiddleState {
    score: number;
    code?: string;
    savedCode?: { [name: string]: string };
}

export interface Riddle {
    id: string;
    level: number;
    title: string;
    shortDescription: string;
    minScoreToSolve: number;
    location: string;
    dependsOn?: string[];

    state: RiddleState;
    detail: RiddleDetail | null;
}
