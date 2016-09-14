(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Utils_1 = require('./Utils');
var module = angular.module('evalquiz');
var Controller = (function () {
    function Controller($mdDialog) {
        this.$mdDialog = $mdDialog;
    }
    Controller.prototype.close = function () {
        this.$mdDialog.hide();
    };
    Controller.$inject = ['$mdDialog'];
    Controller = __decorate([
        Utils_1.Dialog(module, 'creditsDialog', {
            clickOutsideToClose: true,
            escapeToClose: true,
            focusOnOpen: true,
            hasBackdrop: true,
            templateUrl: 'script/CreditsDialog.html'
        }), 
        __metadata('design:paramtypes', [Object])
    ], Controller);
    return Controller;
}());

},{"./Utils":12}],2:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var module = angular.module('evalquiz');
var Utils_1 = require('./Utils');
var Controller = (function () {
    function Controller() {
    }
    Controller = __decorate([
        Utils_1.Component(module, 'memberInfo', {
            templateUrl: 'script/MemberInfoComponent.html',
            bindings: {
                member: '<'
            }
        }), 
        __metadata('design:paramtypes', [])
    ], Controller);
    return Controller;
}());

},{"./Utils":12}],3:[function(require,module,exports){
"use strict";
var Program = (function () {
    function Program(code) {
        this.code = code;
        this.tree = esprima.parse(code);
    }
    Program.prototype.countTypes = function () {
        var types = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            types[_i - 0] = arguments[_i];
        }
        var count = 0;
        this.crawl(this.tree, function (node) {
            if (types.indexOf(node.type) >= 0) {
                count++;
            }
        });
        return count;
    };
    Program.prototype.countLoops = function () {
        return this.countTypes('ForStatement', 'WhileStatement', 'DoWhileStatement');
    };
    Program.prototype.countConditions = function () {
        return this.countTypes('IfStatement', 'SwitchStatement', 'ConditionalExpression');
    };
    Program.prototype.countCalculations = function () {
        return this.countTypes('BinaryExpression', 'AssignmentExpression');
    };
    Program.prototype.countLogicals = function () {
        return this.countTypes('LogicalExpression');
    };
    Program.prototype.countStatements = function () {
        return this.countTypes('ForStatement', 'WhileStatement', 'DoWhileStatement', 'IfStatement', 'SwitchStatement', 'ExpressionStatement', 'ReturnStatement');
    };
    Program.prototype.countOperators = function () {
        var operators = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operators[_i - 0] = arguments[_i];
        }
        var count = 0;
        this.crawl(this.tree, function (node) {
            if ((node.type == 'BinaryExpression') || (node.type == 'UpdateExpression') || (node.type == 'AssignmentExpression')) {
                if (operators.indexOf(node.operator) >= 0) {
                    count++;
                }
            }
        });
        return count;
    };
    Program.prototype.crawl = function (node, callback) {
        if (node instanceof Array) {
            for (var i = 0; i < node.length; i++) {
                this.crawl(node[i], callback);
            }
        }
        else {
            callback(node);
            if (node.body) {
                this.crawl(node.body, callback);
            }
            if (node.test) {
                this.crawl(node.test, callback);
            }
            if (node.left) {
                this.crawl(node.left, callback);
            }
            if (node.right) {
                this.crawl(node.right, callback);
            }
            if (node.consequent) {
                this.crawl(node.consequent, callback);
            }
            if (node.expression) {
                this.crawl(node.expression, callback);
            }
            if (node.argument) {
                this.crawl(node.argument, callback);
            }
            if (node.arguments) {
                this.crawl(node.arguments, callback);
            }
            if (node.declaration) {
                this.crawl(node.declaration, callback);
            }
        }
    };
    return Program;
}());
exports.Program = Program;

},{}],4:[function(require,module,exports){
"use strict";
require('./MemberInfoComponent');
require('./SolvedDialog');
var module = angular.module('evalquiz');
var RiddleController = (function () {
    function RiddleController($routeParams, riddleManager, $mdDialog, $location, solvedDialog, consoleService, uiService) {
        var _this = this;
        this.$routeParams = $routeParams;
        this.riddleManager = riddleManager;
        this.$mdDialog = $mdDialog;
        this.$location = $location;
        this.solvedDialog = solvedDialog;
        this.consoleService = consoleService;
        this.uiService = uiService;
        this.selectedTab = 0;
        this.loading = true;
        var cmChange = function (editor, change) {
            if (change.origin === 'setValue') {
                editor.markText({ line: 0, ch: 0 }, { line: 1 }, { readOnly: true });
                editor.markText({ line: editor.lastLine(), ch: 0 }, {
                    line: editor.lastLine(),
                    ch: 2
                }, { readOnly: true });
                editor.setCursor(3, 1);
                editor.off('change', cmChange);
            }
        };
        this.editorOptions = {
            lineNumbers: true,
            mode: 'javascript',
            gutters: ['CodeMirror-lint-markers'],
            lint: true,
            autofocus: true,
            extraKeys: {
                "Ctrl-Enter": function () {
                    _this.solve();
                }
            },
            onLoad: function (cm) {
                cm.on('change', cmChange);
            }
        };
        riddleManager.startRiddle($routeParams['riddleId']).then(function (riddle) {
            _this.riddle = riddle;
            _this.loading = false;
        });
    }
    Object.defineProperty(RiddleController.prototype, "available", {
        get: function () {
            return this.riddleManager.initialized && !this.loading;
        },
        enumerable: true,
        configurable: true
    });
    RiddleController.prototype.trash = function ($event) {
        var _this = this;
        var self = this;
        this.uiService.confirm('Trash Your Code', 'Are you sure that you want to clear the editor?\n\n' +
            'This will **delete all the code** you have written for this riddle.', 'Delete', 'Abort').then(function () {
            self.riddle.code = self.riddle.member.stub;
            _this.uiService.toast('Code trashed.');
        });
    };
    RiddleController.prototype.save = function () {
        this.riddleManager.saveRiddle(this.riddle);
        this.uiService.toast('Code saved successfully.');
    };
    RiddleController.prototype.solve = function () {
        this.selectedTab = 1;
        this.consoleService.clear();
        this.consoleService.block().markdown('# Solving riddle: ' + this.riddle.title);
        try {
            var result = this.riddleManager.solveRiddle(this.riddle), ctrl = this;
            if (result.solved) {
                this.solvedDialog.show({
                    result: result
                });
            }
            else {
                this.consoleService.errorBlock()
                    .markdown('Evaluation failed.')
                    .markdown('Hmmm... something seems to be wrong. Change some code and try it again.')
                    .markdown(result.failedMessage);
                this.uiService.toast('Failed to solve riddle. See console for more info.');
            }
        }
        catch (err) {
            console.error(err);
            this.consoleService.errorBlock().markdown('Failed to execute function:').code(err);
            this.uiService.toast('Execution failed. See console for more info.');
        }
    };
    RiddleController.$inject = ['$routeParams', 'riddleManager', '$mdDialog', '$location', 'SolvedDialog', 'consoleService', 'uiService'];
    return RiddleController;
}());
module.controller('RiddleController', RiddleController);
module.config(['$mdThemingProvider', '$routeProvider', function ($mdThemingProvider, $routeProvider) {
        console.log('Hmmm... I dont\'t think you need the console right now ;)');
        $mdThemingProvider.theme('default')
            .accentPalette('lime');
        $routeProvider.when('/riddles/:riddleId', {
            templateUrl: 'script/RiddleComponent.html',
            controller: 'RiddleController',
            controllerAs: '$ctrl'
        });
    }]);

},{"./MemberInfoComponent":2,"./SolvedDialog":8}],5:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var module = angular.module('evalquiz');
var RiddleManager_1 = require('./RiddleManager');
var Utils_1 = require('./Utils');
var Controller = (function () {
    function Controller(riddleManager, $mdDialog, $location, $timeout) {
        this.riddleManager = riddleManager;
        this.$mdDialog = $mdDialog;
        this.$location = $location;
        this.$timeout = $timeout;
    }
    Controller.prototype.startRiddle = function (riddle) {
        var _this = this;
        this.$timeout(function () {
            _this.$mdDialog.hide();
            _this.$location.path('/riddles/' + riddle.id);
        }, 200);
    };
    Controller.prototype.closeDialog = function () {
        this.$mdDialog.hide();
    };
    Controller.$inject = ['riddleManager', '$mdDialog', '$location', '$timeout'];
    Controller = __decorate([
        Utils_1.Component(module, 'riddleList', {
            templateUrl: 'script/RiddleListComponent.html'
        }), 
        __metadata('design:paramtypes', [RiddleManager_1.RiddleManager, Object, Object, Function])
    ], Controller);
    return Controller;
}());

},{"./RiddleManager":7,"./Utils":12}],6:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var module = angular.module('evalquiz');
require('./RiddleListComponent');
var RiddleManager_1 = require('./RiddleManager');
var StorageService_1 = require('./StorageService');
var UIService_1 = require('./UIService');
var Utils_1 = require('./Utils');
var Controller = (function () {
    function Controller($mdDialog, $location, riddleManager, storageService, uiService) {
        this.$mdDialog = $mdDialog;
        this.$location = $location;
        this.riddleManager = riddleManager;
        this.storageService = storageService;
        this.uiService = uiService;
    }
    Controller.prototype.clear = function () {
        var _this = this;
        this.uiService.confirm('Clear Progress?', "I am fully aware, that proceeding this action will:\n\n* **erase** all saved riddles\n* **remove** all achieved stars\n* **reset** the progress to the first riddle", 'Erase Everything', 'Abort Action').then(function () {
            _this.storageService.clearSaveGames();
            _this.riddleManager.setupRiddles().then(function () {
                _this.$location.path('/riddles/intro');
            });
        });
    };
    Controller.prototype.close = function () {
        this.$mdDialog.hide();
    };
    Controller.$inject = ['$mdDialog', '$location', 'riddleManager', 'storageService', 'uiService'];
    Controller = __decorate([
        Utils_1.Dialog(module, 'riddleListDialog', {
            clickOutsideToClose: true,
            escapeToClose: true,
            focusOnOpen: true,
            hasBackdrop: true,
            templateUrl: 'script/RiddleListDialog.html'
        }), 
        __metadata('design:paramtypes', [Object, Object, RiddleManager_1.RiddleManager, StorageService_1.StorageService, UIService_1.UIService])
    ], Controller);
    return Controller;
}());

},{"./RiddleListComponent":5,"./RiddleManager":7,"./StorageService":9,"./UIService":11,"./Utils":12}],7:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var module = angular.module('evalquiz');
var console_service_1 = require('./console.service');
var Program_1 = require('./Program');
var StorageService_1 = require('./StorageService');
var UIService_1 = require('./UIService');
var Utils_1 = require('./Utils');
var SAVE_GAME_KEY = 'riddleQuiz.saveGames';
var LAST_RIDDLE_KEY = 'riddleQuiz.lastPlayedRiddle';
var RiddleManager = (function () {
    function RiddleManager($http, $q, storageService, consoleService, uiService) {
        this.$http = $http;
        this.$q = $q;
        this.storageService = storageService;
        this.consoleService = consoleService;
        this.uiService = uiService;
        this.initialized = false;
    }
    RiddleManager.prototype.setupRiddles = function () {
        var _this = this;
        var deferred = this.$q.defer();
        this.initialized = false;
        this.riddleList = null;
        this.riddleMap = null;
        this.$http.get('riddles/riddles.json').then(function (response) {
            var riddles = response.data;
            for (var i = 0; i < riddles.length; i++) {
                riddles[i].level = i + 1;
            }
            _this.prepareRiddles(riddles);
            deferred.resolve();
        }, function (error) {
            _this.uiService.alert('Loading Riddles', 'Unfortunately, the index file of the riddles could not be loaded. This is a show stopper. Sorry.');
            deferred.reject();
        });
        return deferred.promise;
    };
    RiddleManager.prototype.prepareRiddles = function (riddles) {
        var _this = this;
        if (!riddles) {
            return;
        }
        var saveGames = this.storageService.loadSaveGames();
        this.riddleMap = {};
        riddles.forEach(function (riddle) {
            _this.riddleMap[riddle.id] = riddle;
            riddle.score = riddle.score || (riddle.finished ? 1 : 0);
        });
        for (var id in saveGames) {
            var riddle = this.riddleMap[id];
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
    };
    RiddleManager.prototype.startRiddle = function (riddleId) {
        var _this = this;
        var promise = this.initializeRiddle(riddleId);
        promise.then(function () {
            _this.storageService.storeLastPlayedRiddleId(riddleId);
        });
        return promise;
    };
    RiddleManager.prototype.initializeRiddle = function (riddleId) {
        var _this = this;
        var defered = this.$q.defer();
        var riddle = this.riddleMap[riddleId];
        if (!riddle || riddle.initialized) {
            defered.resolve(riddle);
            return defered.promise;
        }
        var descriptionPromise = this.$http.get('riddles/' + riddle.location + '/description.md');
        var functionPromise = this.$http.get('riddles/' + riddle.location + '/function.json');
        var functionEnginePromise = this.$http.get('riddles/' + riddle.location + '/engine.js');
        this.$q.all({
            'description': descriptionPromise,
            'member': functionPromise,
            'functionEngine': functionEnginePromise
        }).then(function (data) {
            riddle.description = data.description.data;
            riddle.engine = data.functionEngine.data;
            riddle.member = _this.processMember(riddle, data.member.data);
            if (!riddle.code) {
                riddle.code = riddle.member.stub;
            }
            riddle.initialized = true;
            defered.resolve(riddle);
        });
        return defered.promise;
    };
    RiddleManager.prototype.processMember = function (riddle, member) {
        var _this = this;
        member.signature = member.name;
        this.processMemberReference(riddle, member, 'description');
        this.processMemberReference(riddle, member, 'explanation');
        if (member.params) {
            member.params.forEach(function (param) {
                _this.processMember(riddle, param);
                param.signatureDescription = "Parameter `" + param.signature + "` - " + param.description;
            });
            var paramsString = member.params.map(function (param) { return param.name; }).join(', ');
            member.signature += "(" + paramsString + ")";
            member.stub = "function " + member.name + "(" + paramsString + ") {\n\t\"use strict\";\n\t\n\t\n}";
        }
        if (member.properties) {
            member.properties.forEach(function (property) {
                _this.processMember(riddle, property);
                property.signatureDescription = "Property `" + property.signature + "` - " + property.description;
            });
        }
        if (member.type) {
            member.signature += ": " + member.type;
        }
        return member;
    };
    RiddleManager.prototype.processMemberReference = function (riddle, member, key) {
        var text = member[key];
        if (text && text.indexOf('file:') === 0) {
            this.$http.get("riddles/" + riddle.location + "/" + text.substring(5).trim()).then(function (response) { return member[key] = response.data; });
            member[key] = '';
        }
    };
    RiddleManager.prototype.saveRiddle = function (riddle) {
        this.storageService.storeSaveGames(riddle);
    };
    RiddleManager.prototype.solveRiddle = function (riddle) {
        var solve = this.parseCode(riddle);
        var syntax = this.analyzeCode(riddle);
        var riddleEngine = this.buildEngine(riddle);
        this.consoleService.block().markdown('Initializing engine ...');
        riddleEngine.init();
        this.consoleService.block().markdown('Starting tests ...');
        var score = riddleEngine.run(solve, syntax);
        var solved = score > 0;
        var result = {
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
            var next = this.nextRiddle(riddle);
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
    };
    RiddleManager.prototype.nextRiddle = function (riddle) {
        var pos = this.riddleList.indexOf(riddle);
        if (this.riddleList.length > pos + 1) {
            return this.riddleList[pos + 1];
        }
    };
    RiddleManager.prototype.parseCode = function (riddle) {
        var create = new Function('return ' + riddle.code.trim());
        return create();
    };
    RiddleManager.prototype.analyzeCode = function (riddle) {
        var syntax = new Program_1.Program(riddle.code);
        return syntax;
    };
    RiddleManager.prototype.buildEngine = function (riddle) {
        var factory = new Function('return ' + riddle.engine);
        return factory();
    };
    RiddleManager.$inject = ['$http', '$q', 'storageService', 'consoleService', 'uiService'];
    RiddleManager = __decorate([
        Utils_1.Service(module, 'riddleManager'), 
        __metadata('design:paramtypes', [Function, Function, StorageService_1.StorageService, console_service_1.ConsoleService, UIService_1.UIService])
    ], RiddleManager);
    return RiddleManager;
}());
exports.RiddleManager = RiddleManager;

},{"./Program":3,"./StorageService":9,"./UIService":11,"./Utils":12,"./console.service":13}],8:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var module = angular.module('evalquiz');
var Utils_1 = require('./Utils');
var Controller = (function () {
    function Controller(result, $mdDialog, $location) {
        this.result = result;
        this.$mdDialog = $mdDialog;
        this.$location = $location;
    }
    Controller.prototype.sameRiddle = function () {
        this.$mdDialog.hide();
    };
    Controller.prototype.nextRiddle = function () {
        this.$mdDialog.hide();
        this.$location.path('/riddles/' + this.result.nextRiddleId);
    };
    Controller.$inject = ['result', '$mdDialog', '$location'];
    Controller = __decorate([
        Utils_1.Dialog(module, 'SolvedDialog', {
            clickOutsideToClose: false,
            escapeToClose: false,
            focusOnOpen: true,
            hasBackdrop: true,
            templateUrl: 'script/SolvedDialog.html'
        }), 
        __metadata('design:paramtypes', [Object, Object, Object])
    ], Controller);
    return Controller;
}());
exports.Controller = Controller;

},{"./Utils":12}],9:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var module = angular.module('evalquiz');
var Utils_1 = require('./Utils');
var SAVE_GAME_KEY = 'evalQuiz.saveGames';
var LAST_PLAYED_RIDDLE_ID = 'evalQuiz.lastPlayedRiddleId';
var StorageService = (function () {
    function StorageService(storage) {
        this.storage = storage;
    }
    StorageService.prototype.loadSaveGames = function () {
        return this.storage.get(SAVE_GAME_KEY) || {};
    };
    StorageService.prototype.storeSaveGames = function () {
        var riddles = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            riddles[_i - 0] = arguments[_i];
        }
        var saveGames = this.loadSaveGames();
        riddles.forEach(function (riddle) {
            var saveGame = {
                finished: riddle.finished,
                score: riddle.score
            };
            if (riddle.code) {
                saveGame.code = riddle.code;
            }
            saveGames[riddle.id] = saveGame;
        });
        this.storage.set(SAVE_GAME_KEY, saveGames);
    };
    StorageService.prototype.clearSaveGames = function () {
        this.storage.clearAll();
    };
    StorageService.prototype.storeLastPlayedRiddleId = function (riddleId) {
        this.storage.set(LAST_PLAYED_RIDDLE_ID, riddleId);
    };
    StorageService.prototype.loadLastPlayedRiddleId = function () {
        return this.storage.get(LAST_PLAYED_RIDDLE_ID) || 'intro';
    };
    StorageService.$inject = ['localStorageService'];
    StorageService = __decorate([
        Utils_1.Service(module, 'storageService'), 
        __metadata('design:paramtypes', [Object])
    ], StorageService);
    return StorageService;
}());
exports.StorageService = StorageService;

},{"./Utils":12}],10:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var module = angular.module('evalquiz');
require('./CreditsDialog');
require('./RiddleListDialog');
var RiddleManager_1 = require('./RiddleManager');
var Utils_1 = require('./Utils');
var Controller = (function () {
    function Controller(riddleManager, creditsDialog, riddleListDialog) {
        this.riddleManager = riddleManager;
        this.creditsDialog = creditsDialog;
        this.riddleListDialog = riddleListDialog;
    }
    Controller.prototype.showRiddleListDialog = function ($event) {
        this.riddleListDialog.show();
    };
    Controller.prototype.showCreditsDialog = function ($event) {
        this.creditsDialog.show();
    };
    Controller.$inject = ['riddleManager', 'creditsDialog', 'riddleListDialog'];
    Controller = __decorate([
        Utils_1.Component(module, 'toolbar', {
            templateUrl: 'script/ToolbarComponent.html'
        }), 
        __metadata('design:paramtypes', [RiddleManager_1.RiddleManager, Object, Object])
    ], Controller);
    return Controller;
}());

},{"./CreditsDialog":1,"./RiddleListDialog":6,"./RiddleManager":7,"./Utils":12}],11:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var module = angular.module('evalquiz');
var Utils_1 = require('./Utils');
var UIService = (function () {
    function UIService($mdDialog, $mdToast, $sanitize, markdownConverter) {
        this.$mdDialog = $mdDialog;
        this.$mdToast = $mdToast;
        this.$sanitize = $sanitize;
        this.markdownConverter = markdownConverter;
    }
    UIService.prototype.markdownToHtml = function (markdown) {
        return markdown ? this.$sanitize(this.markdownConverter.makeHtml(markdown)) : '';
    };
    UIService.prototype.toast = function (content) {
        this.$mdToast.show(this.$mdToast.simple()
            .textContent(content)
            .position('top right')
            .hideDelay(3000));
    };
    UIService.prototype.info = function (title, content, ok) {
        if (ok === void 0) { ok = 'Ok'; }
        return this.$mdDialog.show(this.$mdDialog.alert()
            .title(title)
            .htmlContent(this.markdownToHtml(content))
            .ok(ok));
    };
    UIService.prototype.alert = function (title, content, ok) {
        if (ok === void 0) { ok = 'Got it!'; }
        return this.$mdDialog.show(this.$mdDialog.alert()
            .title(title)
            .htmlContent(this.markdownToHtml(content))
            .ok(ok));
    };
    UIService.prototype.confirm = function (title, content, ok, cancel) {
        if (ok === void 0) { ok = 'Yes'; }
        if (cancel === void 0) { cancel = 'No'; }
        return this.$mdDialog.show(this.$mdDialog.confirm()
            .title(title)
            .htmlContent(this.markdownToHtml(content))
            .ok(ok)
            .cancel(cancel));
    };
    UIService.$inject = ['$mdDialog', '$mdToast', '$sanitize', 'markdownConverter'];
    UIService = __decorate([
        Utils_1.Service(module, 'uiService'), 
        __metadata('design:paramtypes', [Object, Object, Function, Object])
    ], UIService);
    return UIService;
}());
exports.UIService = UIService;

},{"./Utils":12}],12:[function(require,module,exports){
"use strict";
function Component(nameOrModule, selector, options) {
    return function (controller) {
        var module = angular.isString(nameOrModule) ? angular.module(nameOrModule) : nameOrModule;
        module.component(selector, angular.extend(options || {}, {
            controller: controller
        }));
    };
}
exports.Component = Component;
function Service(nameOrModule, selector) {
    return function (service) {
        var module = angular.isString(nameOrModule) ? angular.module(nameOrModule) : nameOrModule;
        module.service(selector, service);
    };
}
exports.Service = Service;
function Dialog(nameOrModule, selector, options) {
    return function (dialog) {
        var LocalDialogService = (function () {
            function LocalDialogService($mdDialog, $q) {
                this.$mdDialog = $mdDialog;
                this.$q = $q;
            }
            LocalDialogService.prototype.show = function (params) {
                var resolve = {};
                if (params) {
                    for (var key in params) {
                        if (isPromise(params[key])) {
                            resolve[key] = params[key];
                            delete params[key];
                        }
                    }
                }
                return this.$mdDialog.show(angular.extend(options || {}, {
                    controller: dialog,
                    controllerAs: '$ctrl',
                    locals: params,
                    resolve: resolve
                }));
            };
            ;
            LocalDialogService.$inject = ['$mdDialog', '$q'];
            return LocalDialogService;
        }());
        var module = angular.isString(nameOrModule) ? angular.module(nameOrModule) : nameOrModule;
        module.service(selector, LocalDialogService);
    };
}
exports.Dialog = Dialog;
function isPromise(obj) {
    return obj && angular.isFunction(obj.then);
}
exports.isPromise = isPromise;

},{}],13:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var module = angular.module('evalquiz');
var UIService_1 = require('./UIService');
var Utils_1 = require('./Utils');
var ConsoleService = (function () {
    function ConsoleService(uiService) {
        this.uiService = uiService;
        this.index = 0;
    }
    ConsoleService.prototype.clear = function () {
        var consoleElement = document.getElementById('console');
        while (consoleElement.firstChild) {
            consoleElement.removeChild(consoleElement.firstChild);
        }
    };
    ConsoleService.prototype.block = function (className, icon) {
        var id = 'console-block-' + (this.index++);
        var consoleElement = document.getElementById('console');
        var blockElement = document.createElement('div');
        var blockClassName = 'block';
        if (className) {
            blockClassName += ' ' + className;
        }
        blockElement.id = id;
        blockElement.className = blockClassName;
        var iconElement = document.createElement('div');
        iconElement.className = 'icon';
        if (icon) {
            iconElement.innerHTML = '<i class="icon fa ' + icon + '" aria-hidden="true"></i>';
        }
        blockElement.appendChild(iconElement);
        var contentElement = document.createElement('div');
        contentElement.className = 'content';
        blockElement.appendChild(contentElement);
        consoleElement.appendChild(blockElement);
        return new ConsoleBlock(this.uiService, blockElement, contentElement);
    };
    ConsoleService.prototype.errorBlock = function () {
        return this.block('error', 'fa-exclamation-circle');
    };
    ConsoleService.$inject = ['uiService'];
    ConsoleService = __decorate([
        Utils_1.Service(module, 'consoleService'), 
        __metadata('design:paramtypes', [UIService_1.UIService])
    ], ConsoleService);
    return ConsoleService;
}());
exports.ConsoleService = ConsoleService;
var ConsoleBlock = (function () {
    function ConsoleBlock(uiService, blockElement, contentElement) {
        this.uiService = uiService;
        this.blockElement = blockElement;
        this.contentElement = contentElement;
    }
    ConsoleBlock.prototype.append = function (name, className, html) {
        var element = document.createElement(name);
        if (className) {
            element.className = className;
        }
        element.innerHTML = html;
        this.contentElement.appendChild(element);
        return element;
    };
    ConsoleBlock.prototype.markdown = function (s) {
        this.append('div', null, this.uiService.markdownToHtml(s));
        return this;
    };
    ConsoleBlock.prototype.code = function (s) {
        this.append('pre', 'code', s);
        return this;
    };
    return ConsoleBlock;
}());
exports.ConsoleBlock = ConsoleBlock;

},{"./UIService":11,"./Utils":12}],14:[function(require,module,exports){
"use strict";
var module = angular.module('evalquiz', ['ngRoute', 'ngMaterial', 'ui.codemirror', 'LocalStorageModule', 'btford.markdown']);
require('./console.service');
require('./RiddleComponent');
require('./ToolbarComponent');
module.config(function ($mdThemingProvider) {
    $mdThemingProvider
        .theme('default')
        .primaryPalette('indigo')
        .accentPalette('orange')
        .warnPalette('deep-orange')
        .backgroundPalette('grey');
});
module.run(['$location', 'riddleManager', 'storageService', function ($location, riddleManager, storageService) {
        riddleManager.setupRiddles().then(function () {
            var id = storageService.loadLastPlayedRiddleId();
            $location.path('/riddles/' + id);
        });
        ;
    }]);

},{"./RiddleComponent":4,"./ToolbarComponent":10,"./console.service":13}]},{},[14]);
