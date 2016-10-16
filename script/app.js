webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var module = angular.module('evalquiz', ['ngRoute', 'ngMaterial', 'ui.codemirror', 'LocalStorageModule', 'btford.markdown']);
	__webpack_require__(1);
	__webpack_require__(3);
	__webpack_require__(8);
	module.config(function ($mdThemingProvider) {
	    $mdThemingProvider
	        .theme('default')
	        .primaryPalette('indigo')
	        .accentPalette('amber')
	        .warnPalette('deep-orange')
	        .backgroundPalette('grey');
	});
	module.run(['evalQuizService', function (evalQuizService) {
	        evalQuizService.initialize().then(function () {
	            evalQuizService.goto(evalQuizService.path);
	        });
	    }]);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

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
	var utils_1 = __webpack_require__(2);
	console.log('tata');
	var AnalyticsService = (function () {
	    function AnalyticsService() {
	    }
	    Object.defineProperty(AnalyticsService.prototype, "active", {
	        get: function () {
	            return window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
	        },
	        enumerable: true,
	        configurable: true
	    });
	    AnalyticsService.prototype.pageview = function (path) {
	        if (path.indexOf('/') !== 0) {
	            throw new Error('Paths must start with a slash');
	        }
	        this.send('pageview', path);
	    };
	    AnalyticsService.prototype.event = function (category, action, label, value) {
	        this.send('event', category, action, label, value);
	    };
	    AnalyticsService.prototype.send = function () {
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i - 0] = arguments[_i];
	        }
	        if (this.active) {
	            ga.apply(void 0, ['send'].concat(args));
	        }
	        else {
	            console.info('Analytics: %o', args);
	        }
	    };
	    AnalyticsService = __decorate([
	        utils_1.Injectable(module, 'analyticsService'), 
	        __metadata('design:paramtypes', [])
	    ], AnalyticsService);
	    return AnalyticsService;
	}());
	exports.AnalyticsService = AnalyticsService;


/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	exports.MILLIS_MULTIPLIER = 1000;
	function Component(nameOrModule, selector, options) {
	    return function (controller) {
	        var module = angular.isString(nameOrModule) ? angular.module(nameOrModule) : nameOrModule;
	        module.component(selector, angular.extend(options || {}, {
	            controller: controller
	        }));
	    };
	}
	exports.Component = Component;
	function Injectable(nameOrModule, selector) {
	    return function (service) {
	        var module = angular.isString(nameOrModule) ? angular.module(nameOrModule) : nameOrModule;
	        module.service(selector, service);
	    };
	}
	exports.Injectable = Injectable;
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


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	__webpack_require__(4);
	__webpack_require__(5);
	var module = angular.module('evalquiz');
	var OverviewComponent = (function () {
	    function OverviewComponent($routeParams, evalQuizService, riddleService, uiService, analyticsService) {
	        var _this = this;
	        this.$routeParams = $routeParams;
	        this.evalQuizService = evalQuizService;
	        this.riddleService = riddleService;
	        this.uiService = uiService;
	        this.analyticsService = analyticsService;
	        this.evalQuizService.whenInitialized(function () {
	            _this.init();
	        });
	    }
	    OverviewComponent.prototype.init = function () {
	        this.riddles = this.evalQuizService.getRiddles();
	        this.totalScore = this.riddles.map(function (riddle) { return riddle.state.score; }).reduce(function (a, b) { return a + b; }, 0);
	        this.analyticsService.pageview('/overview');
	    };
	    OverviewComponent.prototype.isSolved = function (riddle) {
	        return this.riddleService.isSolved(riddle);
	    };
	    OverviewComponent.prototype.isAvailable = function (riddle) {
	        return this.riddleService.isAvailable(riddle);
	    };
	    OverviewComponent.prototype.code = function (riddle) {
	        var result = {};
	        if (!riddle.state.savedCode) {
	            return result;
	        }
	        for (var score = 1; score <= 3; score++) {
	            var key = score === 1 ? '1 Star' : score + ' Stars';
	            var code = riddle.state.savedCode[key];
	            if (code) {
	                result[score] = code.trim();
	            }
	        }
	        return result;
	    };
	    OverviewComponent.prototype.print = function () {
	        window.print();
	    };
	    OverviewComponent.prototype.back = function () {
	        this.evalQuizService.gotoRiddle(this.evalQuizService.lastRiddleId);
	    };
	    OverviewComponent.$inject = ['$routeParams', 'evalQuizService', 'riddleService', 'uiService', 'analyticsService'];
	    return OverviewComponent;
	}());
	module.controller('OverviewComponent', OverviewComponent);
	module.config(['$routeProvider', function ($routeProvider) {
	        $routeProvider.when('/overview', {
	            template: __webpack_require__(7),
	            controller: 'OverviewComponent',
	            controllerAs: '$ctrl'
	        });
	    }]);


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

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
	var utils_1 = __webpack_require__(2);
	var Controller = (function () {
	    function Controller($element) {
	        this.$element = $element;
	    }
	    Controller.prototype.$onInit = function () {
	        this.update();
	    };
	    Controller.prototype.update = function () {
	        var _this = this;
	        if (!this.code) {
	            this.$element.empty();
	            return;
	        }
	        this.code = this.code.trim();
	        this.$element.each(function (index, element) {
	            window.CodeMirror(element, {
	                value: _this.code,
	                mode: _this.mode || 'javascript',
	                indentUnit: 4,
	                tabSize: 4,
	                indentWithTabs: true,
	                lineNumbers: true,
	                lineWrapping: true,
	                readOnly: true
	            });
	        });
	    };
	    Controller.$inject = ['$element'];
	    Controller = __decorate([
	        utils_1.Component(module, 'highlighter', {
	            template: '<div></div>',
	            bindings: {
	                code: '<',
	                mode: '@?'
	            }
	        }), 
	        __metadata('design:paramtypes', [Object])
	    ], Controller);
	    return Controller;
	}());


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

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
	var utils_1 = __webpack_require__(2);
	var module = angular.module('evalquiz');
	var OverviewComponent = (function () {
	    function OverviewComponent() {
	    }
	    OverviewComponent.prototype.$onChanges = function (changes) {
	        if (changes['count'] || changes['maximum']) {
	            this.list = [];
	            for (var index = 0; index < (this.maximum || 3); index++) {
	                this.list[index] = {
	                    index: index,
	                    classname: index < this.count ? 'fa-star' : 'fa-star-o lightest'
	                };
	            }
	        }
	    };
	    OverviewComponent = __decorate([
	        utils_1.Component(module, 'stars', {
	            template: __webpack_require__(6),
	            bindings: {
	                count: '<',
	                maximum: '<?'
	            }
	        }), 
	        __metadata('design:paramtypes', [])
	    ], OverviewComponent);
	    return OverviewComponent;
	}());


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = "<span ng-repeat=\"item in $ctrl.list\" class=\"layout-no-resize\"><i class=\"fa {{item.classname}}\"></i>&nbsp;</span>";

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = "<div class=\"overview md-body-1\">\r\n\t<div class=\"layout-row layout-baseline\">\r\n\t\t<h1 class=\"layout-grow\"><code>eval(Quiz)</code> Solutions</h1>\r\n\t\t<span>Score: <i class=\"fa fa-star\"></i> {{$ctrl.totalScore}}</span>\r\n\t</div>\r\n\r\n\t<p>\r\n\t\t<a href=\"http://furti.github.io/evalquiz/\" target=\"_blank\">http://furti.github.io/evalquiz/</a>\r\n\t</p>\r\n\r\n\t<div class=\"buttons\">\r\n\t\t<md-button class=\"md-fab md-primary\">\r\n\t\t\t<md-icon ng-click=\"$ctrl.print()\"><i class=\"fa fa-print\"></i></md-icon>\r\n\t\t</md-button>\r\n\r\n\t\t<br />\r\n\r\n\t\t<md-button class=\"md-fab md-accent\">\r\n\t\t\t<md-icon ng-click=\"$ctrl.back()\"><i class=\"fa fa-arrow-left\"></i></md-icon>\r\n\t\t</md-button>\r\n\t</div>\r\n\r\n\t<div ng-repeat=\"riddle in $ctrl.riddles\" ng-if=\"$ctrl.isSolved(riddle)\">\r\n\t\t<img ng-src=\"riddles/{{riddle.location}}/icon.svg\" class=\"riddle-icon-small float-right\" />\r\n\t\t<h2>\r\n\t\t\t<i class=\"layout-no-resize fa\" ng-class=\"{'fa-square-o': !$ctrl.isSolved(riddle), 'fa-check-square-o': $ctrl.isSolved(riddle)}\"></i>&nbsp;\r\n\t\t\t<span class=\"lighter\">Level {{riddle.level}}:</span>&nbsp;<span>{{riddle.title}}</span>&nbsp;\r\n\t\t\t<stars count=\"riddle.state.score\"></stars>\r\n\t\t</h2>\r\n\r\n\t\t<p class=\"markdown\" btf-markdown=\"riddle.shortDescription\"></p>\r\n\r\n\t\t<div ng-repeat=\"(score, code) in $ctrl.code(riddle)\" class=\"solution\">\r\n\t\t\t<stars count=\"score\"></stars>\r\n\t\t\t<highlighter code=\"code\"></highlighter>\r\n\t\t</div>\r\n\t</div>\r\n</div>";

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var module = angular.module('evalquiz');
	__webpack_require__(9);
	__webpack_require__(12);
	__webpack_require__(97);
	var PageComponent = (function () {
	    function PageComponent($routeParams, evalQuizService, riddleService, uiService, analyticsService) {
	        var _this = this;
	        this.$routeParams = $routeParams;
	        this.evalQuizService = evalQuizService;
	        this.riddleService = riddleService;
	        this.uiService = uiService;
	        this.analyticsService = analyticsService;
	        this.evalQuizService.whenInitialized(function () {
	            var riddleId = _this.$routeParams['riddleId'];
	            var riddle = _this.evalQuizService.getRiddle(riddleId);
	            _this.analyticsService.pageview('/riddles/' + riddleId);
	            if (!riddle) {
	                _this.uiService.alert('Error', "Unknown riddle: " + riddleId).then(function () {
	                    _this.evalQuizService.gotoRiddle('intro');
	                });
	            }
	            else {
	                _this.riddleService.prepare(riddle).then(function (r) {
	                    _this.selectedRiddle = r;
	                }, function (err) {
	                    console.error("Failed to load riddle \"" + riddleId + "\":", err);
	                    _this.uiService.alert('Error', "Failed to load riddle: " + riddleId).then(function () {
	                        _this.evalQuizService.gotoRiddle('intro');
	                    });
	                });
	            }
	            _this.evalQuizService.lastRiddleId = riddleId;
	        });
	    }
	    Object.defineProperty(PageComponent.prototype, "riddles", {
	        get: function () {
	            return this.evalQuizService.getRiddles();
	        },
	        enumerable: true,
	        configurable: true
	    });
	    PageComponent.prototype.isAvailable = function (riddle) {
	        return this.riddleService.isAvailable(riddle);
	    };
	    PageComponent.$inject = ['$routeParams', 'evalQuizService', 'riddleService', 'uiService', 'analyticsService'];
	    return PageComponent;
	}());
	module.controller('PageComponent', PageComponent);
	module.config(['$routeProvider', function ($routeProvider) {
	        console.log('Hmmm... I don\'t think you\'ll need the console right now ;)');
	        $routeProvider.when('/riddles/:riddleId', {
	            template: __webpack_require__(103),
	            controller: 'PageComponent',
	            controllerAs: '$ctrl'
	        });
	    }]);


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

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
	var storage_service_1 = __webpack_require__(10);
	var utils_1 = __webpack_require__(2);
	var Controller = (function () {
	    function Controller(storageService) {
	        this.storageService = storageService;
	    }
	    Object.defineProperty(Controller.prototype, "dataStorageAllowed", {
	        get: function () {
	            return this.storageService.dataStorageAllowed;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Controller.prototype.accept = function () {
	        this.storageService.saveDataStorageAllowed(true);
	    };
	    Controller.$inject = ['storageService'];
	    Controller = __decorate([
	        utils_1.Component(module, 'storageInfoBar', {
	            template: __webpack_require__(11)
	        }), 
	        __metadata('design:paramtypes', [(typeof (_a = typeof storage_service_1.StorageService !== 'undefined' && storage_service_1.StorageService) === 'function' && _a) || Object])
	    ], Controller);
	    return Controller;
	    var _a;
	}());


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

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
	var utils_1 = __webpack_require__(2);
	var STATE_KEY = 'evalQuiz.state';
	var PATH_KEY = 'evalQuiz.path';
	var LAST_RIDDLE_ID_KEY = 'evalQuiz.lastRiddleId';
	var DATA_STORAGE_ALLOWED_KEY = 'evalQuiz.agreement';
	var StorageService = (function () {
	    function StorageService(storage) {
	        this.storage = storage;
	    }
	    StorageService.prototype.loadRiddles = function () {
	        return this.storage.get(STATE_KEY) || {};
	    };
	    StorageService.prototype.saveRiddles = function () {
	        var riddles = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            riddles[_i - 0] = arguments[_i];
	        }
	        var map = this.loadRiddles();
	        riddles.forEach(function (riddle) {
	            if (!riddle.state) {
	                console.error("Riddle is missing state:", riddle);
	                return;
	            }
	            map[riddle.id] = angular.copy(riddle.state);
	        });
	        if (!this.dataStorageAllowed) {
	            this.storage.set(STATE_KEY, map);
	        }
	    };
	    StorageService.prototype.clear = function () {
	        this.storage.clearAll();
	        this._dataStorageAllowed = undefined;
	    };
	    StorageService.prototype.loadPath = function () {
	        return this.storage.get(PATH_KEY) || '/riddles/' + this.loadLastRiddleId();
	    };
	    StorageService.prototype.savePath = function (path) {
	        if (!this.dataStorageAllowed) {
	            this.storage.set(PATH_KEY, path);
	        }
	    };
	    StorageService.prototype.loadLastRiddleId = function () {
	        return this.storage.get(LAST_RIDDLE_ID_KEY) || 'intro';
	    };
	    StorageService.prototype.saveLastRiddleId = function (lastRiddleId) {
	        if (!this.dataStorageAllowed) {
	            this.storage.set(LAST_RIDDLE_ID_KEY, lastRiddleId);
	        }
	    };
	    Object.defineProperty(StorageService.prototype, "dataStorageAllowed", {
	        get: function () {
	            if (this._dataStorageAllowed !== undefined) {
	                return !!this._dataStorageAllowed;
	            }
	            return this._dataStorageAllowed = (this.storage.get(DATA_STORAGE_ALLOWED_KEY) || false);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    StorageService.prototype.saveDataStorageAllowed = function (dataStorageAllowed) {
	        this._dataStorageAllowed = dataStorageAllowed;
	        if (dataStorageAllowed) {
	            this.storage.set(DATA_STORAGE_ALLOWED_KEY, dataStorageAllowed);
	        }
	        else {
	            this.clear();
	        }
	    };
	    StorageService.$inject = ['localStorageService'];
	    StorageService = __decorate([
	        utils_1.Injectable(module, 'storageService'), 
	        __metadata('design:paramtypes', [Object])
	    ], StorageService);
	    return StorageService;
	}());
	exports.StorageService = StorageService;


/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = "<md-toolbar ng-if=\"!$ctrl.dataStorageAllowed\" class=\"md-accent md-whiteframe-1dp\">\r\n\t<div class=\"md-toolbar-tools\" layout=\"row\">\r\n\t\t<div class=\"md-toolbar-item\">\r\n\t\t\t<i class=\"fa fa-exclamation-triangle\"></i> eval(Quiz) needs to store information in the local storage of your browser.\r\n\t\t</div>\r\n\r\n\t\t<div flex></div>\r\n\r\n\t\t<div class=\"md-toolbar-item\">\r\n\t\t\t<md-button ng-click=\"$ctrl.accept()\" class=\"md-raised\">Accept</md-button>\r\n\t\t</div>\r\n\t</div>\r\n</md-toolbar>";

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

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
	var analytics_service_1 = __webpack_require__(1);
	__webpack_require__(13);
	var evalquiz_service_1 = __webpack_require__(15);
	__webpack_require__(17);
	var riddle_service_1 = __webpack_require__(20);
	var utils_1 = __webpack_require__(2);
	var Controller = (function () {
	    function Controller(evalQuizService, riddleService, creditsDialog, riddleListDialog, analyticsService) {
	        this.evalQuizService = evalQuizService;
	        this.riddleService = riddleService;
	        this.creditsDialog = creditsDialog;
	        this.riddleListDialog = riddleListDialog;
	        this.analyticsService = analyticsService;
	    }
	    Object.defineProperty(Controller.prototype, "solved", {
	        get: function () {
	            return this.selectedRiddle && this.riddleService.isSolved(this.selectedRiddle);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Controller.prototype, "nextRiddleId", {
	        get: function () {
	            if (!this.selectedRiddle) {
	                return undefined;
	            }
	            return this.evalQuizService.getNextRiddleId(this.selectedRiddle.id);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Controller.prototype, "nextAvailable", {
	        get: function () {
	            if (!this.solved) {
	                return false;
	            }
	            if (!this.nextRiddleId) {
	                return false;
	            }
	            return !!this.evalQuizService.getRiddle(this.nextRiddleId);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Controller.prototype, "running", {
	        get: function () {
	            return this.riddleService.running;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Controller.prototype.gotoRiddle = function (riddleId) {
	        this.analyticsService.event('navigation', 'next-riddle', riddleId);
	        this.evalQuizService.gotoRiddle(riddleId);
	    };
	    Controller.prototype.showOverview = function () {
	        this.evalQuizService.goto('/overview');
	    };
	    Controller.prototype.showRiddleListDialog = function () {
	        this.riddleListDialog.show({
	            riddles: this.riddles,
	            selectedRiddle: this.selectedRiddle
	        });
	    };
	    Controller.prototype.showCreditsDialog = function () {
	        this.creditsDialog.show();
	    };
	    Object.defineProperty(Controller.prototype, "totalScore", {
	        get: function () {
	            return this.evalQuizService.totalScore;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Controller.$inject = ['evalQuizService', 'riddleService', 'creditsDialog', 'riddleListDialog', 'analyticsService'];
	    Controller = __decorate([
	        utils_1.Component(module, 'toolbar', {
	            template: __webpack_require__(96),
	            bindings: {
	                riddles: '<',
	                selectedRiddle: '<'
	            }
	        }), 
	        __metadata('design:paramtypes', [(typeof (_a = typeof evalquiz_service_1.EvalQuizService !== 'undefined' && evalquiz_service_1.EvalQuizService) === 'function' && _a) || Object, (typeof (_b = typeof riddle_service_1.RiddleService !== 'undefined' && riddle_service_1.RiddleService) === 'function' && _b) || Object, (typeof (_c = typeof utils_1.DialogService !== 'undefined' && utils_1.DialogService) === 'function' && _c) || Object, (typeof (_d = typeof utils_1.DialogService !== 'undefined' && utils_1.DialogService) === 'function' && _d) || Object, (typeof (_e = typeof analytics_service_1.AnalyticsService !== 'undefined' && analytics_service_1.AnalyticsService) === 'function' && _e) || Object])
	    ], Controller);
	    return Controller;
	    var _a, _b, _c, _d, _e;
	}());


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

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
	var utils_1 = __webpack_require__(2);
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
	        utils_1.Dialog(module, 'creditsDialog', {
	            clickOutsideToClose: true,
	            escapeToClose: true,
	            focusOnOpen: true,
	            hasBackdrop: true,
	            template: __webpack_require__(14)
	        }), 
	        __metadata('design:paramtypes', [Object])
	    ], Controller);
	    return Controller;
	}());


/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = "<md-dialog aria-label=\"Credits\">\r\n\t<md-toolbar>\r\n\t\t<div class=\"md-toolbar-tools\">Credits</div>\r\n\t</md-toolbar>\r\n\r\n\t<img ng-src=\"style/title.svg\" />\r\n\r\n\t<md-dialog-content class=\"md-dialog-content\" layout=\"column\" layout-align=\"center center\">\r\n\t\t<p>&copy; 2015-2016 eval(Quiz) Team</p>\r\n\t</md-dialog-content>\r\n\r\n\t<md-dialog-content class=\"md-dialog-content\" layout=\"column\" layout-align=\"center center\">\r\n        <div>Licensed by <a href=\"http://www.apache.org/licenses/LICENSE-2.0\">Apache License 2.0</a>.</div>\r\n\t\t<div>Powered by <a href=\"https://angularjs.org/\" target=\"_blank\">AngularJS</a>.</div>\r\n\t\t<div>Styled by <a href=\"https://material.angularjs.org\" target=\"_blank\">Angular Material</a>.</div>\r\n\t\t<div>Icons by <a href=\"http://fortawesome.github.io/Font-Awesome\" target=\"_blank\">Font Awesome</a>.</div>\r\n\t\t<div>Hosted by <a href=\"https://github.com/furti/evalquiz\" target=\"_blank\">GitHub</a>.</div>\r\n\t</md-dialog-content>\r\n\r\n\t<md-dialog-actions layout=\"row\">\r\n\t\t<md-button ng-click=\"$ctrl.close()\">\r\n\t\t\tClose\r\n\t\t</md-button>\r\n\t</md-dialog-actions>\r\n</md-dialog>";

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

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
	var storage_service_1 = __webpack_require__(10);
	var ui_service_1 = __webpack_require__(16);
	var utils_1 = __webpack_require__(2);
	var EvalQuizService = (function () {
	    function EvalQuizService($location, $http, $q, storageService, uiService) {
	        this.$location = $location;
	        this.$http = $http;
	        this.$q = $q;
	        this.storageService = storageService;
	        this.uiService = uiService;
	        this._initialized = false;
	        this._initializeCallbacks = [];
	        this._totalScore = 0;
	    }
	    EvalQuizService.prototype.initialize = function () {
	        var _this = this;
	        var deferred = this.$q.defer();
	        this._initialized = false;
	        this._path = '';
	        this.riddles = [];
	        this.riddleMap = {};
	        this.$http.get('riddles/riddles.json').then(function (response) {
	            var riddles = response.data;
	            for (var i = 0; i < riddles.length; i++) {
	                riddles[i].level = i + 1;
	            }
	            _this.prepare(riddles);
	            deferred.resolve();
	        }, function (error) {
	            _this.uiService.alert('Loading Riddles', 'Unfortunately, the index file of the riddles could not be loaded. This is a show stopper. Sorry.');
	            deferred.reject();
	        });
	        return deferred.promise;
	    };
	    EvalQuizService.prototype.prepare = function (riddles) {
	        var _this = this;
	        if (!riddles) {
	            return;
	        }
	        this.riddles = riddles;
	        this.riddleMap = {};
	        riddles.forEach(function (riddle) {
	            riddle.state = {
	                score: 0
	            };
	            riddle.detail = null;
	            _this.riddleMap[riddle.id] = riddle;
	        });
	        var persistedRiddleStates = this.storageService.loadRiddles();
	        for (var id in persistedRiddleStates) {
	            var riddle = this.riddleMap[id];
	            if (riddle) {
	                riddle.state = angular.copy(persistedRiddleStates[id]);
	            }
	        }
	        this.updateStatistics();
	        this._initialized = true;
	        this._initializeCallbacks.forEach(function (fn) { return fn(); });
	    };
	    Object.defineProperty(EvalQuizService.prototype, "initialized", {
	        get: function () {
	            return this._initialized;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    EvalQuizService.prototype.whenInitialized = function (fn) {
	        if (this._initialized) {
	            fn();
	        }
	        else {
	            this._initializeCallbacks.push(fn);
	        }
	    };
	    EvalQuizService.prototype.reset = function (clear) {
	        var _this = this;
	        if (clear) {
	            this.storageService.clear();
	        }
	        this.initialize().then(function () {
	            _this.goto('/riddles/intro');
	        });
	    };
	    Object.defineProperty(EvalQuizService.prototype, "path", {
	        get: function () {
	            if (!this._path) {
	                this._path = this.storageService.loadPath();
	            }
	            return this._path;
	        },
	        set: function (path) {
	            if (this._path !== path) {
	                this._path = path;
	                this.storageService.savePath(path);
	            }
	        },
	        enumerable: true,
	        configurable: true
	    });
	    EvalQuizService.prototype.goto = function (path) {
	        this.$location.path(path);
	        this.path = path;
	    };
	    Object.defineProperty(EvalQuizService.prototype, "lastRiddleId", {
	        get: function () {
	            if (!this._lastRiddleId) {
	                this._lastRiddleId = this.storageService.loadLastRiddleId();
	            }
	            return this._lastRiddleId;
	        },
	        set: function (lastRiddleId) {
	            if (this._lastRiddleId !== lastRiddleId) {
	                this._lastRiddleId = lastRiddleId;
	                this.storageService.saveLastRiddleId(lastRiddleId);
	            }
	        },
	        enumerable: true,
	        configurable: true
	    });
	    EvalQuizService.prototype.gotoRiddle = function (riddleId) {
	        this.lastRiddleId = riddleId;
	        this.goto('/riddles/' + riddleId);
	    };
	    EvalQuizService.prototype.getRiddles = function () {
	        return this.riddles;
	    };
	    EvalQuizService.prototype.getRiddle = function (riddleId) {
	        return this.riddleMap[riddleId];
	    };
	    EvalQuizService.prototype.getNextRiddle = function (riddle) {
	        var pos = this.riddles.indexOf(riddle);
	        if (this.riddles.length > pos + 1) {
	            return this.riddles[pos + 1];
	        }
	        return undefined;
	    };
	    EvalQuizService.prototype.getNextRiddleId = function (riddleId) {
	        for (var i = 0; i < this.riddles.length; i++) {
	            if (this.riddles[i].id === riddleId) {
	                if (i + 1 >= this.riddles.length) {
	                    return undefined;
	                }
	                return this.riddles[i + 1].id;
	            }
	        }
	        return undefined;
	    };
	    EvalQuizService.prototype.saveRiddle = function () {
	        var riddles = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            riddles[_i - 0] = arguments[_i];
	        }
	        (_a = this.storageService).saveRiddles.apply(_a, riddles);
	        this.updateStatistics();
	        var _a;
	    };
	    EvalQuizService.prototype.updateStatistics = function () {
	        this._totalScore = this.riddles.map(function (riddle) { return riddle.state.score; }).reduce(function (a, b) { return a + b; }, 0);
	    };
	    Object.defineProperty(EvalQuizService.prototype, "totalScore", {
	        get: function () {
	            return this._totalScore;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    EvalQuizService.$inject = ['$location', '$http', '$q', 'storageService', 'uiService'];
	    EvalQuizService = __decorate([
	        utils_1.Injectable(module, 'evalQuizService'), 
	        __metadata('design:paramtypes', [Object, Object, Object, (typeof (_a = typeof storage_service_1.StorageService !== 'undefined' && storage_service_1.StorageService) === 'function' && _a) || Object, (typeof (_b = typeof ui_service_1.UIService !== 'undefined' && ui_service_1.UIService) === 'function' && _b) || Object])
	    ], EvalQuizService);
	    return EvalQuizService;
	    var _a, _b;
	}());
	exports.EvalQuizService = EvalQuizService;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

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
	var utils_1 = __webpack_require__(2);
	var MenuController = (function () {
	    function MenuController(mdPanelRef) {
	        this.mdPanelRef = mdPanelRef;
	    }
	    MenuController.prototype.select = function (item) {
	        this.deferred.resolve(item);
	        this.mdPanelRef.close();
	    };
	    MenuController.$inject = ['mdPanelRef'];
	    return MenuController;
	}());
	var UIService = (function () {
	    function UIService($mdPanel, $mdDialog, $mdToast, $q, $timeout, $sanitize, markdownConverter) {
	        this.$mdPanel = $mdPanel;
	        this.$mdDialog = $mdDialog;
	        this.$mdToast = $mdToast;
	        this.$q = $q;
	        this.$timeout = $timeout;
	        this.$sanitize = $sanitize;
	        this.markdownConverter = markdownConverter;
	    }
	    UIService.prototype.markdownToHtml = function (markdown) {
	        return markdown ? this.$sanitize(this.markdownConverter.makeHtml(markdown)) : '';
	    };
	    UIService.prototype.menu = function (relativeToSelector, items, selected) {
	        var deferred = this.$q.defer();
	        var position = this.$mdPanel.newPanelPosition()
	            .relativeTo(relativeToSelector)
	            .addPanelPosition(this.$mdPanel.xPosition.ALIGN_START, this.$mdPanel.yPosition.ABOVE);
	        this.$mdPanel.open({
	            controller: MenuController,
	            controllerAs: '$ctrl',
	            template: "\n<md-card class=\"md-whiteframe-12dp\" style=\"min-width: 12em\">\n    <md-list>\n        <md-list-item ng-repeat=\"item in $ctrl.items\" ng-click=\"$ctrl.select(item)\">\n            {{item}}\n        </md-list-item>\n    </md-list>\n</md-card>\n                ",
	            panelClass: 'ui-menu-panel',
	            position: position,
	            locals: { selected: selected, items: items, deferred: deferred },
	            clickOutsideToClose: true,
	            escapeToClose: true,
	            focusOnOpen: true,
	            zIndex: 200
	        });
	        return deferred.promise;
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
	    UIService.prototype.postpone = function (seconds, fn) {
	        var deferred = this.$q.defer();
	        this.$timeout(function () {
	            try {
	                var result = fn ? fn() : undefined;
	                if (utils_1.isPromise(result)) {
	                    result.then(function (obj) { return deferred.resolve(obj); }, function (err) { return deferred.reject(err); });
	                }
	                else {
	                    deferred.resolve(result);
	                }
	            }
	            catch (err) {
	                console.error('Unhandled error in postpone:', err);
	                deferred.reject(err);
	            }
	        }, seconds * utils_1.MILLIS_MULTIPLIER);
	        return deferred.promise;
	    };
	    UIService.$inject = ['$mdPanel', '$mdDialog', '$mdToast', '$q', '$timeout', '$sanitize', 'markdownConverter'];
	    UIService = __decorate([
	        utils_1.Injectable(module, 'uiService'), 
	        __metadata('design:paramtypes', [Object, Object, Object, Object, Object, Object, Object])
	    ], UIService);
	    return UIService;
	}());
	exports.UIService = UIService;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

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
	var evalquiz_service_1 = __webpack_require__(15);
	var riddle_1 = __webpack_require__(18);
	__webpack_require__(19);
	var ui_service_1 = __webpack_require__(16);
	var utils_1 = __webpack_require__(2);
	var Controller = (function () {
	    function Controller($mdDialog, evalQuizService, uiService, riddles, selectedRiddle) {
	        this.$mdDialog = $mdDialog;
	        this.evalQuizService = evalQuizService;
	        this.uiService = uiService;
	        this.riddles = riddles;
	        this.selectedRiddle = selectedRiddle;
	    }
	    Controller.prototype.clear = function () {
	        var _this = this;
	        this.uiService.confirm('Clear Progress?', "I am fully aware, that proceeding this action will:\n\n* **erase** all saved riddles\n* **remove** all achieved stars\n* **reset** the progress to the first riddle", 'Erase Everything', 'Abort Action').then(function () {
	            _this.evalQuizService.reset(true);
	        });
	    };
	    Controller.prototype.close = function () {
	        this.$mdDialog.hide();
	    };
	    Controller.$inject = ['$mdDialog', 'evalQuizService', 'uiService', 'riddles', 'selectedRiddle'];
	    Controller = __decorate([
	        utils_1.Dialog(module, 'riddleListDialog', {
	            clickOutsideToClose: true,
	            escapeToClose: true,
	            focusOnOpen: true,
	            hasBackdrop: true,
	            template: __webpack_require__(95)
	        }), 
	        __metadata('design:paramtypes', [Object, (typeof (_a = typeof evalquiz_service_1.EvalQuizService !== 'undefined' && evalquiz_service_1.EvalQuizService) === 'function' && _a) || Object, (typeof (_b = typeof ui_service_1.UIService !== 'undefined' && ui_service_1.UIService) === 'function' && _b) || Object, Array, (typeof (_c = typeof riddle_1.Riddle !== 'undefined' && riddle_1.Riddle) === 'function' && _c) || Object])
	    ], Controller);
	    return Controller;
	    var _a, _b, _c;
	}());


/***/ },
/* 18 */
/***/ function(module, exports) {

	"use strict";
	var module = angular.module('evalquiz');


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

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
	var analytics_service_1 = __webpack_require__(1);
	var evalquiz_service_1 = __webpack_require__(15);
	var riddle_service_1 = __webpack_require__(20);
	var utils_1 = __webpack_require__(2);
	var Controller = (function () {
	    function Controller(evalQuizService, riddleService, $mdDialog, $timeout, analyticsService) {
	        this.evalQuizService = evalQuizService;
	        this.riddleService = riddleService;
	        this.$mdDialog = $mdDialog;
	        this.$timeout = $timeout;
	        this.analyticsService = analyticsService;
	    }
	    Controller.prototype.isSolved = function (riddle) {
	        return this.riddleService.isSolved(riddle);
	    };
	    Controller.prototype.isAvailable = function (riddle) {
	        return this.riddleService.isAvailable(riddle);
	    };
	    Controller.prototype.gotoRiddle = function (riddleId) {
	        var _this = this;
	        this.analyticsService.event('navigation', 'goto-riddle', riddleId);
	        this.$timeout(function () {
	            _this.$mdDialog.hide();
	            _this.evalQuizService.gotoRiddle(riddleId);
	        }, 200);
	    };
	    Controller.prototype.closeDialog = function () {
	        this.$mdDialog.hide();
	    };
	    Controller.$inject = ['evalQuizService', 'riddleService', '$mdDialog', '$timeout', 'analyticsService'];
	    Controller = __decorate([
	        utils_1.Component(module, 'riddleList', {
	            template: __webpack_require__(94),
	            bindings: {
	                riddles: '<',
	                selectedRiddle: '<'
	            }
	        }), 
	        __metadata('design:paramtypes', [(typeof (_a = typeof evalquiz_service_1.EvalQuizService !== 'undefined' && evalquiz_service_1.EvalQuizService) === 'function' && _a) || Object, (typeof (_b = typeof riddle_service_1.RiddleService !== 'undefined' && riddle_service_1.RiddleService) === 'function' && _b) || Object, Object, Object, (typeof (_c = typeof analytics_service_1.AnalyticsService !== 'undefined' && analytics_service_1.AnalyticsService) === 'function' && _c) || Object])
	    ], Controller);
	    return Controller;
	    var _a, _b, _c;
	}());


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

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
	var analytics_service_1 = __webpack_require__(1);
	var console_service_1 = __webpack_require__(21);
	var evalquiz_service_1 = __webpack_require__(15);
	var riddle_runner_1 = __webpack_require__(22);
	var ui_service_1 = __webpack_require__(16);
	var utils_1 = __webpack_require__(2);
	var RiddleService = (function () {
	    function RiddleService(evalQuizService, $http, $q, $timeout, consoleService, uiService, analyticsService) {
	        this.evalQuizService = evalQuizService;
	        this.$http = $http;
	        this.$q = $q;
	        this.$timeout = $timeout;
	        this.consoleService = consoleService;
	        this.uiService = uiService;
	        this.analyticsService = analyticsService;
	        this.runner = null;
	    }
	    RiddleService.prototype.prepare = function (riddle) {
	        var _this = this;
	        var deferred = this.$q.defer();
	        if (riddle.detail) {
	            deferred.resolve(riddle);
	            return deferred.promise;
	        }
	        this.$http.get('riddles/' + riddle.location + '/detail.json').then(function (result) {
	            var detail = result.data;
	            _this.processTextReference(riddle.location, detail, 'description');
	            _this.processTextReference(riddle.location, detail, 'hints');
	            _this.processTextReference(riddle.location, detail, 'suite');
	            detail.api = detail.api || [];
	            detail.api.forEach(function (member) { return _this.processMember(riddle.location, member); });
	            _this.processMember(riddle.location, detail.member);
	            if (!detail.stub) {
	                detail.stub = "function " + detail.member.name + "(" + detail.member.paramsString + ") {\n\t\n}";
	            }
	            riddle.detail = detail;
	            if (!riddle.state.code) {
	                riddle.state.code = detail.stub;
	            }
	            deferred.resolve(riddle);
	        }, function (err) {
	            deferred.reject(err);
	        });
	        return deferred.promise;
	    };
	    RiddleService.prototype.processTextReference = function (location, obj, key) {
	        var text = obj[key];
	        if (text && text.indexOf('file:') === 0) {
	            this.$http.get("riddles/" + location + "/" + text.substring(5).trim()).then(function (response) { return obj[key] = response.data; }, function (err) { return console.error("Failed to resolve text reference \"" + text + "\":", err); });
	            obj[key] = '...';
	        }
	    };
	    RiddleService.prototype.processMember = function (location, member) {
	        var _this = this;
	        member.paramsString = '';
	        member.signature = member.name;
	        this.processTextReference(location, member, 'description');
	        this.processTextReference(location, member, 'explanation');
	        if (member.params) {
	            member.params.forEach(function (param) {
	                _this.processMember(location, param);
	                param.signatureDescription = "Parameter `" + param.signature + "` - " + param.description;
	            });
	            member.paramsString = member.params.map(function (param) { return param.name; }).join(', ');
	            member.signature += "(" + member.paramsString + ")";
	        }
	        if (member.properties) {
	            member.properties.forEach(function (property) {
	                _this.processMember(location, property);
	                if (property.signature.indexOf('(') >= 0) {
	                    property.signatureDescription = "Function `" + property.signature + "` - " + property.description;
	                }
	                else {
	                    property.signatureDescription = "Property `" + property.signature + "` - " + property.description;
	                }
	            });
	        }
	        if (member.type) {
	            member.signature += ": " + member.type;
	        }
	        return member;
	    };
	    RiddleService.prototype.isSolved = function (riddle) {
	        if (!riddle.state) {
	            return false;
	        }
	        return riddle.state.score >= riddle.minScoreToSolve;
	    };
	    RiddleService.prototype.isAvailable = function (riddle) {
	        if (!riddle) {
	            return false;
	        }
	        if ((!riddle.dependsOn) || (!riddle.dependsOn.length)) {
	            return true;
	        }
	        for (var _i = 0, _a = riddle.dependsOn; _i < _a.length; _i++) {
	            var riddleId = _a[_i];
	            var dependsOnRiddle = this.evalQuizService.getRiddle(riddleId);
	            if (dependsOnRiddle === undefined) {
	                console.error("Invalid dependsOn declaration \"" + riddleId + "\" in riddle \"" + riddle.id + "\"");
	            }
	            else if (!this.isSolved(dependsOnRiddle)) {
	                return false;
	            }
	        }
	        return true;
	    };
	    Object.defineProperty(RiddleService.prototype, "running", {
	        get: function () {
	            return !!this.runner;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    RiddleService.prototype.execute = function (riddle) {
	        var _this = this;
	        this.evalQuizService.saveRiddle(riddle);
	        this.consoleService.clear();
	        this.consoleService.log().markdown("# " + riddle.title);
	        var deferred = this.$q.defer();
	        try {
	            this.runner = new riddle_runner_1.RiddleRunner(this.$q, this.uiService, this.consoleService, riddle);
	            this.runner.execute().then(function (result) {
	                _this.runner = null;
	                if (result.aborted) {
	                    deferred.resolve(result);
	                    return;
	                }
	                var passed = result.score > 0;
	                _this.analyticsService.event('riddle', 'solve', riddle.id, result.score);
	                if (!passed) {
	                    _this.consoleService.log().withContentClass('center fade-in').markdown('## Tests failed\n\nYour code did not pass all tests.').addClass('error');
	                    if (result.messages && result.messages.length) {
	                        result.messages.forEach(function (message) { return _this.consoleService.log(message); });
	                    }
	                    _this.consoleService.log().markdown('Refine your code and try again. Good luck.');
	                    deferred.resolve(result);
	                    return;
	                }
	                var solved = result.score >= riddle.minScoreToSolve;
	                var logItem = _this.consoleService.log().withContentClass('center');
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
	                _this.uiService.postpone(1.5, function () {
	                    if (result.messages && result.messages.length) {
	                        result.messages.forEach(function (message) { return _this.consoleService.log(message); });
	                    }
	                });
	                if (result.score < 3) {
	                    _this.uiService.postpone(2, function () {
	                        var logItem = _this.consoleService.log();
	                        if (solved) {
	                            if (result.score < 3) {
	                                logItem.markdown('Want more stars? Try the next goal of this riddle!').addClass('fade-in');
	                            }
	                        }
	                        else {
	                            if (riddle.minScoreToSolve === 2) {
	                                var subItem = logItem.sub().withContentClass('fade-in');
	                                subItem.write('That was okay, but you need at least two stars (');
	                                subItem.icon('fa-star');
	                                subItem.space();
	                                subItem.icon('fa-star');
	                                subItem.space();
	                                subItem.icon('fa-star-o');
	                                subItem.write(') to solve this level. Keep trying! Can you achieve the next goal?');
	                            }
	                            if (riddle.minScoreToSolve === 3) {
	                                var subItem = logItem.sub().withContentClass('fade-in');
	                                subItem.write('That was okay, but you need at least three stars (');
	                                subItem.icon('fa-star');
	                                subItem.space();
	                                subItem.icon('fa-star');
	                                subItem.space();
	                                subItem.icon('fa-star');
	                                subItem.write(') to solve this level. Keep trying! Can you achieve the next goal?');
	                            }
	                        }
	                        var nextGoal = result.score + 1;
	                        if (nextGoal <= 3) {
	                            var subItem = logItem.sub().withContentClass('layout-row layout-baseline fade-in');
	                            subItem.icon(nextGoal >= 1 ? 'fa-star' : 'fa-star-o').addClass('warning');
	                            subItem.space();
	                            subItem.icon(nextGoal >= 2 ? 'fa-star' : 'fa-star-o').addClass('warning');
	                            subItem.space();
	                            subItem.icon(nextGoal >= 3 ? 'fa-star' : 'fa-star-o').addClass('warning');
	                            subItem.space(3);
	                            subItem.markdown(riddle.detail.goals[nextGoal - 1]);
	                        }
	                    });
	                }
	                var nextRiddle = _this.evalQuizService.getNextRiddle(riddle);
	                if (nextRiddle && _this.isAvailable(nextRiddle)) {
	                    _this.uiService.postpone(2.5, function () {
	                        _this.consoleService.log("The next riddle is available!").withContentClass('warning move-in');
	                    });
	                }
	                if (result.score > 0) {
	                    if (result.score >= riddle.state.score) {
	                        riddle.state.score = result.score;
	                    }
	                    var key = result.score === 1 ? '1 Star' : result.score + ' Stars';
	                    riddle.state.savedCode = riddle.state.savedCode || {};
	                    riddle.state.savedCode[key] = riddle.state.code;
	                    _this.evalQuizService.saveRiddle(riddle);
	                }
	                deferred.resolve(result);
	            }, function (err) { return deferred.reject(err); });
	        }
	        catch (err) {
	            this.runner = null;
	            this.consoleService.log({
	                content: "Failed to compile and run code: " + err,
	                type: 'markdown',
	                classname: 'error',
	                icon: 'fa-times-circle'
	            });
	            console.error('Failed to compile and run code:', err);
	            deferred.reject(err);
	        }
	        return deferred.promise;
	    };
	    RiddleService.prototype.abort = function () {
	        if (this.runner) {
	            this.runner.abort();
	        }
	    };
	    RiddleService.$inject = ['evalQuizService', '$http', '$q', '$timeout', 'consoleService', 'uiService', 'analyticsService'];
	    RiddleService = __decorate([
	        utils_1.Injectable(module, 'riddleService'), 
	        __metadata('design:paramtypes', [(typeof (_a = typeof evalquiz_service_1.EvalQuizService !== 'undefined' && evalquiz_service_1.EvalQuizService) === 'function' && _a) || Object, Object, Object, Object, (typeof (_b = typeof console_service_1.ConsoleService !== 'undefined' && console_service_1.ConsoleService) === 'function' && _b) || Object, (typeof (_c = typeof ui_service_1.UIService !== 'undefined' && ui_service_1.UIService) === 'function' && _c) || Object, (typeof (_d = typeof analytics_service_1.AnalyticsService !== 'undefined' && analytics_service_1.AnalyticsService) === 'function' && _d) || Object])
	    ], RiddleService);
	    return RiddleService;
	    var _a, _b, _c, _d;
	}());
	exports.RiddleService = RiddleService;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

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
	var ui_service_1 = __webpack_require__(16);
	var utils_1 = __webpack_require__(2);
	var ConsoleService = (function () {
	    function ConsoleService(uiService) {
	        this.uiService = uiService;
	        this.index = 0;
	    }
	    ConsoleService.prototype.clear = function () {
	        angular.element('#console').empty();
	    };
	    ConsoleService.prototype.log = function (message, dummy) {
	        if (dummy === void 0) { dummy = false; }
	        var id = 'console-log-item-' + (this.index++);
	        var consoleElement = angular.element('#console');
	        var itemElement = angular.element('<div></div>').attr({ id: id }).addClass('item');
	        var iconElement = angular.element('<div></div>').addClass('icon');
	        var contentElement = angular.element('<div></div>').addClass('content');
	        itemElement.append(iconElement, contentElement);
	        if (!dummy) {
	            consoleElement.append(itemElement);
	        }
	        var logItem = new ConsoleLogItem(this.uiService, consoleElement, itemElement, iconElement, contentElement);
	        if (message && typeof message === 'string') {
	            logItem.markdown(message);
	        }
	        else if (message) {
	            switch (message.type || 'plain') {
	                case 'plain':
	                    logItem.write(message.content);
	                    break;
	                case 'markdown':
	                    logItem.markdown(message.content);
	                    break;
	                case 'html':
	                    logItem.html(message.content);
	                    break;
	                case 'code':
	                    logItem.code(message.content);
	                    break;
	                default:
	                    throw new Error('Unsupported message type: ' + message.type);
	            }
	            if (message.icon) {
	                logItem.withIcon(message.icon);
	            }
	            if (message.classname) {
	                logItem.withContentClass(message.classname);
	            }
	        }
	        return logItem;
	    };
	    ConsoleService.$inject = ['uiService'];
	    ConsoleService = __decorate([
	        utils_1.Injectable(module, 'consoleService'), 
	        __metadata('design:paramtypes', [(typeof (_a = typeof ui_service_1.UIService !== 'undefined' && ui_service_1.UIService) === 'function' && _a) || Object])
	    ], ConsoleService);
	    return ConsoleService;
	    var _a;
	}());
	exports.ConsoleService = ConsoleService;
	var ConsoleLogItem = (function () {
	    function ConsoleLogItem(uiService, consoleElement, itemElement, iconElement, contentElement) {
	        this.uiService = uiService;
	        this.consoleElement = consoleElement;
	        this.itemElement = itemElement;
	        this.iconElement = iconElement;
	        this.contentElement = contentElement;
	    }
	    ConsoleLogItem.prototype.withClass = function (classname) {
	        this.itemElement.attr('class', 'item');
	        if (classname) {
	            this.itemElement.addClass(classname);
	        }
	        return this;
	    };
	    ConsoleLogItem.prototype.withIcon = function (icon) {
	        this.iconElement.empty();
	        if (icon) {
	            this.iconElement.append("<i class=\"icon fa " + icon + "\" aria-hidden=\"true\">");
	        }
	        return this;
	    };
	    ConsoleLogItem.prototype.withContentClass = function (classname) {
	        this.contentElement.attr('class', '');
	        if (classname) {
	            this.contentElement.addClass(classname);
	        }
	        return this;
	    };
	    Object.defineProperty(ConsoleLogItem.prototype, "content", {
	        get: function () {
	            return this.contentElement;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    ConsoleLogItem.prototype.append = function (element) {
	        this.lastElement = element;
	        this.contentElement.append(element);
	        this.consoleElement.animate({
	            scrollTop: this.consoleElement.prop('scrollHeight'),
	        }, 0);
	        return element;
	    };
	    ConsoleLogItem.prototype.sub = function () {
	        var itemElement = angular.element('<div></div>').addClass('item');
	        var iconElement = angular.element('<div></div>').addClass('icon');
	        var contentElement = angular.element('<div></div>').addClass('content');
	        itemElement.append(iconElement, contentElement);
	        this.contentElement.append(itemElement);
	        var block = new ConsoleLogItem(this.uiService, this.consoleElement, itemElement, iconElement, contentElement);
	        return block;
	    };
	    ConsoleLogItem.prototype.newLine = function () {
	        return this.append(angular.element('<br />'));
	    };
	    ConsoleLogItem.prototype.space = function (count) {
	        if (count === void 0) { count = 1; }
	        var npsps = '';
	        for (var i = 0; i < count; i++) {
	            npsps += '&nbsp;';
	        }
	        return this.append(angular.element("<span>" + npsps + "</span>"));
	    };
	    ConsoleLogItem.prototype.h1 = function (s) {
	        return this.append(angular.element("<h1>" + s + "</h1>"));
	    };
	    ConsoleLogItem.prototype.h2 = function (s) {
	        return this.append(angular.element("<h2>" + s + "</h2>"));
	    };
	    ConsoleLogItem.prototype.h3 = function (s) {
	        return this.append(angular.element("<h3>" + s + "</h3>"));
	    };
	    ConsoleLogItem.prototype.mark = function (mark) {
	        return this.append(angular.element("<span class=\"mark " + mark + "\"></span>"));
	    };
	    ConsoleLogItem.prototype.icon = function (icon) {
	        return this.append(angular.element("<i class=\"icon fa " + icon + "\" aria-hidden=\"true\"></i>"));
	    };
	    ConsoleLogItem.prototype.write = function (obj) {
	        if (obj === undefined) {
	            return this.append(angular.element('<span></span>').text('undefined'));
	        }
	        if (obj === null) {
	            return this.append(angular.element('<span></span>').text('null'));
	        }
	        if ((typeof obj === "boolean") || (typeof obj === "number") || (typeof obj === "string")) {
	            return this.append(angular.element('<span></span>').text(obj.toString()));
	        }
	        if (typeof obj === "function") {
	            return this.append(angular.element('<div></div>').text(obj.toString()));
	        }
	        if (angular.isArray(obj)) {
	            return this.append(angular.element('<div></div>').text(obj.toString()));
	        }
	        if (typeof obj === "object") {
	            return this.append(angular.element('<div></div>').text(JSON.stringify(obj)));
	        }
	        return this.append(angular.element('<div></div>').text("WHAT IS A " + typeof obj));
	    };
	    ConsoleLogItem.prototype.html = function (s) {
	        return this.append(angular.element(s));
	    };
	    ConsoleLogItem.prototype.markdown = function (s) {
	        return this.append(angular.element('<div></div>').html(this.uiService.markdownToHtml(s)));
	    };
	    ConsoleLogItem.prototype.code = function (s) {
	        return this.append(angular.element('<pre></pre>').addClass('code').text(s));
	    };
	    ConsoleLogItem.prototype.element = function (element) {
	        return this.append(angular.element(element));
	    };
	    return ConsoleLogItem;
	}());
	exports.ConsoleLogItem = ConsoleLogItem;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var utils_1 = __webpack_require__(2);
	var esprima = __webpack_require__(23);
	var esmangle = __webpack_require__(24);
	var escodegen = __webpack_require__(79);
	exports.ABORTED = 'Execution aborted.';
	exports.SKIPPED = 'Test skipped.';
	exports.INSTRUMENTATION_CALLBACK = '___';
	var SECONDS_BETWEEN_TESTS = 0.25;
	var RiddleRunner = (function () {
	    function RiddleRunner($q, uiService, consoleService, riddle) {
	        var _this = this;
	        this.$q = $q;
	        this.uiService = uiService;
	        this.consoleService = consoleService;
	        this.riddle = riddle;
	        this._aborted = false;
	        this._skipped = false;
	        this._optional = true;
	        this._quiet = false;
	        this._maxScore = 3;
	        this._lastSkipped = false;
	        this._lastMaxScore = 3;
	        this.messages = [];
	        this.code = riddle.state.code;
	        var detail = riddle.detail;
	        this.suiteFactory = new Function('var exports = {};\n' + detail.suite + '\nreturn exports;');
	        this.fnWrapperArgs = [];
	        detail.api.forEach(function (member) {
	            if (_this.fnWrapperArgs.indexOf(member.name) < 0) {
	                _this.fnWrapperArgs.push(member.name);
	            }
	        });
	    }
	    Object.defineProperty(RiddleRunner.prototype, "fnWrapper", {
	        get: function () {
	            if (this._fnWrapper) {
	                return this._fnWrapper;
	            }
	            var detail = this.riddle.detail;
	            var args = this.fnWrapperArgs.slice();
	            if (detail.member.params) {
	                args = args.concat(detail.member.params.map(function (param) { return param.name; }));
	            }
	            args.push("\"use strict\";\n" + this.code + "\nreturn " + detail.member.name + "(" + detail.member.paramsString + ");");
	            return this._fnWrapper = new (Function.bind.apply(Function, [void 0].concat(args)))();
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(RiddleRunner.prototype, "fnInstrumentedWrapper", {
	        get: function () {
	            if (this._fnInstrumentedWrapper) {
	                return this._fnInstrumentedWrapper;
	            }
	            var detail = this.riddle.detail;
	            var args = this.fnWrapperArgs.slice();
	            args.push(exports.INSTRUMENTATION_CALLBACK);
	            if (detail.member.params) {
	                args = args.concat(detail.member.params.map(function (param) { return param.name; }));
	            }
	            args.push("\"use strict\";\n" + this.instrumentedCode + "\nreturn " + detail.member.name + "(" + detail.member.paramsString + ");");
	            return this._fnInstrumentedWrapper = new (Function.bind.apply(Function, [void 0].concat(args)))();
	        },
	        enumerable: true,
	        configurable: true
	    });
	    RiddleRunner.prototype.isRunning = function () {
	        return this.executeDeferred !== undefined;
	    };
	    RiddleRunner.prototype.finish = function () {
	        if (!this.executeDeferred) {
	            return;
	        }
	        this.executeDeferred.resolve({
	            riddle: this.riddle,
	            aborted: this._aborted,
	            score: this._maxScore,
	            messages: this.messages
	        });
	        this.executeDeferred = undefined;
	    };
	    RiddleRunner.prototype.abort = function () {
	        this._aborted = true;
	        this._maxScore = 0;
	        this.finish();
	    };
	    RiddleRunner.prototype.execute = function () {
	        if (this.isRunning()) {
	            throw new Error('Already running.');
	        }
	        this.executeDeferred = this.$q.defer();
	        try {
	            this.prepare();
	        }
	        catch (err) {
	            this.executeDeferred.reject(err);
	        }
	        this.executeNextTestFn();
	        return this.executeDeferred.promise;
	    };
	    RiddleRunner.prototype.prepare = function () {
	        var _this = this;
	        try {
	            var exports = this.suiteFactory();
	            var suiteClass = exports['Suite'];
	            if (!suiteClass) {
	                var keys = Object.keys(exports);
	                if (keys.length < 1) {
	                    throw new Error('Expected at least one class in suite');
	                }
	                suiteClass = exports[keys[0]];
	            }
	            this.suite = new (suiteClass)(this);
	        }
	        catch (err) {
	            console.error("Failed to instantiate suite of riddle \"" + this.riddle.id + "\":", err);
	            throw err;
	        }
	        try {
	            this.testFns = Object.getOwnPropertyNames(Object.getPrototypeOf(this.suite))
	                .filter(function (name) { return name.indexOf('test') === 0; })
	                .map(function (name) { return _this.suite[name]; })
	                .filter(function (fn) { return typeof fn === 'function'; });
	        }
	        catch (err) {
	            console.error("Failed to detect test functions of riddle \"" + this.riddle.id + "\":", err);
	            throw err;
	        }
	        if (this.testFns.length <= 0) {
	            var message = "Failed to detect test functions of riddle \"" + this.riddle.id + "\" (name has to start with \"test\").";
	            console.error(message);
	            throw new Error(message);
	        }
	    };
	    RiddleRunner.prototype.fail = function () {
	        if (this.optional) {
	            this.skip();
	        }
	        else {
	            this.abort();
	        }
	    };
	    RiddleRunner.prototype.skip = function () {
	        this._skipped = true;
	        this._maxScore = 0;
	    };
	    RiddleRunner.prototype.isSkipped = function () {
	        return this._skipped;
	    };
	    Object.defineProperty(RiddleRunner.prototype, "optional", {
	        get: function () {
	            return this._optional;
	        },
	        set: function (optional) {
	            if (this._optional === optional) {
	                return;
	            }
	            if (!this._optional) {
	                this._lastSkipped = this._skipped;
	                this._lastMaxScore = this._maxScore;
	            }
	            this._optional = optional;
	            if (!optional) {
	                this._skipped = this._lastSkipped;
	                this._maxScore = this._lastMaxScore;
	            }
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(RiddleRunner.prototype, "quiet", {
	        get: function () {
	            return this._quiet;
	        },
	        set: function (quiet) {
	            this._quiet = quiet;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    RiddleRunner.prototype.executeNextTestFn = function () {
	        var _this = this;
	        this._skipped = false;
	        this._optional = false;
	        this._quiet = false;
	        var testFn = this.testFns.shift();
	        if (testFn === undefined) {
	            this.finish();
	            return;
	        }
	        this.invokeTestFn(testFn).then(function () { return _this.uiService.postpone(SECONDS_BETWEEN_TESTS, function () { return _this.executeNextTestFn(); }); }, function (err) { return _this.fail(); });
	    };
	    RiddleRunner.prototype.invokeTestFn = function (testFn) {
	        var _this = this;
	        var deferred = this.$q.defer();
	        try {
	            this.check();
	            var result = testFn.apply(this.suite);
	            this.check();
	            if (utils_1.isPromise(result)) {
	                result.then(function () { return deferred.resolve(); }, function (err) { return _this.handleInvokeTestFnError(err, deferred); });
	            }
	            else {
	                deferred.resolve();
	            }
	        }
	        catch (err) {
	            this.handleInvokeTestFnError(err, deferred);
	        }
	        return deferred.promise;
	    };
	    RiddleRunner.prototype.handleInvokeTestFnError = function (err, deferred) {
	        if (err === exports.ABORTED) {
	            this.log({
	                content: 'Execution aborted.',
	                type: 'markdown',
	                classname: 'error',
	                icon: 'fa-times-circle'
	            });
	            deferred.reject(err);
	        }
	        else if (err === exports.SKIPPED) {
	            this.log({
	                content: 'Test skipped.',
	                type: 'markdown',
	                classname: 'warning',
	                icon: 'fa-exclamation-triangle'
	            });
	            deferred.resolve();
	        }
	        else {
	            console.error('Unhandled error in test', err);
	            this.log({
	                content: "Unhandled error in test: " + err,
	                type: 'markdown',
	                classname: 'error',
	                icon: 'fa-times-circle'
	            });
	            deferred.reject(err);
	        }
	    };
	    RiddleRunner.prototype.check = function () {
	        if (this._aborted) {
	            throw exports.ABORTED;
	        }
	        if (this._skipped) {
	            throw exports.SKIPPED;
	        }
	    };
	    RiddleRunner.prototype.invokeFn = function () {
	        var params = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            params[_i - 0] = arguments[_i];
	        }
	        return this.invokeFnInternal.apply(this, [true].concat(params));
	    };
	    RiddleRunner.prototype.invokeInstrumentedFn = function () {
	        var params = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            params[_i - 0] = arguments[_i];
	        }
	        return this.invokeFnInternal.apply(this, [true].concat(params));
	    };
	    RiddleRunner.prototype.invokeFnInternal = function (instrumented) {
	        var _this = this;
	        var params = [];
	        for (var _i = 1; _i < arguments.length; _i++) {
	            params[_i - 1] = arguments[_i];
	        }
	        this.check();
	        var fnParams = [];
	        var _loop_1 = function(fnWrapperArg) {
	            if (this_1.suite[fnWrapperArg] === undefined) {
	                var message = "API reference \"" + fnWrapperArg + "\" of riddle \"" + this_1.riddle.id + "\" is missing in suite.";
	                console.error(message);
	                throw new Error(message);
	            }
	            fnParams.push(function () {
	                var args = [];
	                for (var _i = 0; _i < arguments.length; _i++) {
	                    args[_i - 0] = arguments[_i];
	                }
	                try {
	                    _this.check();
	                    var result = _this.suite[fnWrapperArg].apply(_this.suite, args);
	                    _this.check();
	                    return result;
	                }
	                catch (err) {
	                    if (err === exports.ABORTED || err === exports.SKIPPED) {
	                        throw err;
	                    }
	                    else {
	                        var message = "Unhandled error in API function \"" + fnWrapperArg + "\": ";
	                        console.error(message, err);
	                        if (!_this.quiet) {
	                            _this.log(message + err).withClass('error').withIcon('fa-times-circle');
	                        }
	                        _this.fail();
	                        throw err;
	                    }
	                }
	            });
	        };
	        var this_1 = this;
	        for (var _a = 0, _b = this.fnWrapperArgs; _a < _b.length; _a++) {
	            var fnWrapperArg = _b[_a];
	            _loop_1(fnWrapperArg);
	        }
	        if (instrumented) {
	            fnParams.push(function (id, that, fn) { return _this.incrementInvocationCount(id, that, fn); });
	        }
	        fnParams = fnParams.concat(params);
	        try {
	            this.invocationCount = {};
	            if (instrumented) {
	                return this.fnInstrumentedWrapper.apply(this.fnWrapper, fnParams);
	            }
	            return this.fnWrapper.apply(this.fnWrapper, fnParams);
	        }
	        catch (err) {
	            if (err === exports.ABORTED || err === exports.SKIPPED) {
	                throw err;
	            }
	            else {
	                var message = "Unhandled error in riddle function: ";
	                console.error(message, err);
	                if (!this.quiet) {
	                    this.log(message + err).withClass('error').withIcon('fa-times-circle');
	                }
	                this.fail();
	                throw err;
	            }
	        }
	        finally {
	            this.check();
	        }
	    };
	    Object.defineProperty(RiddleRunner.prototype, "maxScore", {
	        get: function () {
	            return this._maxScore;
	        },
	        set: function (maxScore) {
	            this._maxScore = Math.min(this._maxScore, maxScore);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    RiddleRunner.prototype.message = function (message) {
	        if (typeof message === 'string') {
	            message = {
	                content: message
	            };
	        }
	        if (this.messages.filter(function (m) { return message.content === m.content; }).length > 0) {
	            return;
	        }
	        this.messages.push(message);
	    };
	    RiddleRunner.prototype.log = function (message) {
	        return this.consoleService.log(message, this.quiet);
	    };
	    RiddleRunner.prototype.defer = function () {
	        this.check();
	        return this.$q.defer();
	    };
	    RiddleRunner.prototype.postpone = function (seconds, fn) {
	        this.check();
	        return this.uiService.postpone(seconds, fn);
	    };
	    RiddleRunner.prototype.sequence = function () {
	        var secondsOrStep = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            secondsOrStep[_i - 0] = arguments[_i];
	        }
	        return this.sequenceStep.apply(this, [this.defer(), undefined].concat(secondsOrStep));
	    };
	    RiddleRunner.prototype.sequenceStep = function (deferred, result) {
	        var _this = this;
	        var secondsOrStep = [];
	        for (var _i = 2; _i < arguments.length; _i++) {
	            secondsOrStep[_i - 2] = arguments[_i];
	        }
	        this.check();
	        try {
	            this.check();
	            var remaining_1 = secondsOrStep.slice();
	            var item = remaining_1.shift();
	            if (item === undefined) {
	                deferred.resolve(result);
	                return deferred.promise;
	            }
	            if (typeof item === 'number') {
	                this.postpone(item, function () { }).then(function () { return _this.sequenceStep.apply(_this, [deferred, result].concat(remaining_1)); }, function (err) { return deferred.reject(err); });
	                return deferred.promise;
	            }
	            var itemResult = item();
	            if (itemResult !== undefined) {
	                result = itemResult;
	            }
	            if (utils_1.isPromise(result)) {
	                result.then(function () { return _this.sequenceStep.apply(_this, [deferred, result].concat(remaining_1)); }, function (err) { return deferred.reject(err); });
	            }
	            else {
	                this.sequenceStep.apply(this, [deferred, result].concat(remaining_1));
	            }
	        }
	        catch (err) {
	            if (err === exports.ABORTED || err === exports.SKIPPED) {
	                deferred.reject(err);
	            }
	            else {
	                var message = "Unhandled error in sequence: " + err;
	                console.error(message, err);
	                this.log(message).withClass('error').withIcon('fa-times-circle');
	                deferred.reject(err);
	            }
	        }
	        return deferred.promise;
	    };
	    RiddleRunner.prototype.map = function (source, fn) {
	        var deferred = this.defer();
	        if (source === undefined) {
	            deferred.resolve(undefined);
	        }
	        else if (source === null) {
	            deferred.resolve(null);
	        }
	        else if (!source.length) {
	            deferred.resolve([]);
	        }
	        else {
	            var target = [];
	            this.mapStep(deferred, source, 0, target, fn);
	        }
	        return deferred.promise;
	    };
	    RiddleRunner.prototype.mapStep = function (deferred, source, sourceIndex, target, fn) {
	        var _this = this;
	        this.check();
	        if (sourceIndex >= source.length) {
	            deferred.resolve(target);
	            return;
	        }
	        try {
	            var result = fn(source[sourceIndex]);
	            if (utils_1.isPromise(result)) {
	                result.then(function (r) {
	                    target.push(r);
	                    _this.mapStep(deferred, source, sourceIndex + 1, target, fn);
	                }, function (err) { return deferred.reject(err); });
	            }
	            else {
	                target.push(result);
	                this.mapStep(deferred, source, sourceIndex + 1, target, fn);
	            }
	        }
	        catch (err) {
	            if (err === exports.ABORTED || err === exports.SKIPPED) {
	                deferred.reject(err);
	            }
	            else {
	                var message = "Unhandled error in map: " + err;
	                console.error(message, err);
	                this.log(message).withClass('error').withIcon('fa-times-circle');
	                deferred.reject(err);
	            }
	        }
	    };
	    Object.defineProperty(RiddleRunner.prototype, "ast", {
	        get: function () {
	            if (this._ast) {
	                return this._ast;
	            }
	            return this._ast = esprima.parse(this.code);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(RiddleRunner.prototype, "minifiedCode", {
	        get: function () {
	            if (this._mangledCode) {
	                return this._mangledCode;
	            }
	            var mangledAst = esmangle.mangle(esmangle.optimize(angular.copy(this.ast), null));
	            return this._mangledCode = escodegen.generate(mangledAst, {
	                format: {
	                    renumber: true,
	                    hexadecimal: true,
	                    escapeless: true,
	                    compact: true,
	                    semicolons: false,
	                    parentheses: false
	                }
	            });
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(RiddleRunner.prototype, "instrumentedCode", {
	        get: function () {
	            if (this._instrumentedCode) {
	                return this._instrumentedCode;
	            }
	            this.invocationId = 0;
	            var instrumentedAst = this.instrument(angular.copy(this.ast));
	            return this._instrumentedCode = escodegen.generate(instrumentedAst, {
	                format: {
	                    renumber: false,
	                    hexadecimal: false,
	                    escapeless: false,
	                    compact: false,
	                    semicolons: true,
	                    parentheses: true
	                }
	            });
	        },
	        enumerable: true,
	        configurable: true
	    });
	    RiddleRunner.prototype.instrument = function (node) {
	        if (node instanceof Array) {
	            for (var i = 0; i < node.length; i++) {
	                node[i] = this.instrument(node[i]);
	            }
	        }
	        else {
	            if (node.body) {
	                node.body = this.instrument(node.body);
	            }
	            if (node.test) {
	                node.test = this.instrument(node.test);
	            }
	            if (node.left) {
	                node.left = this.instrument(node.left);
	            }
	            if (node.right) {
	                node.right = this.instrument(node.right);
	            }
	            if (node.consequent) {
	                node.consequent = this.instrument(node.consequent);
	            }
	            if (node.expression) {
	                node.expression = this.instrument(node.expression);
	            }
	            if (node.argument) {
	                node.argument = this.instrument(node.argument);
	            }
	            if (node.arguments) {
	                node.arguments = this.instrument(node.arguments);
	            }
	            if (node.declaration) {
	                node.declaration = this.instrument(node.declaration);
	            }
	            switch (node.type) {
	                case 'CallExpression':
	                case 'LogicalExpression':
	                case 'UnaryExpression':
	                case 'BinaryExpression':
	                    node = this.instrumentNode(node);
	                    break;
	            }
	        }
	        return node;
	    };
	    RiddleRunner.prototype.instrumentNode = function (node) {
	        return {
	            type: 'CallExpression',
	            arguments: [
	                {
	                    type: 'Literal',
	                    value: this.invocationId++
	                },
	                {
	                    type: 'ThisExpression'
	                },
	                {
	                    type: 'FunctionExpression',
	                    params: [],
	                    id: null,
	                    generator: false,
	                    expression: false,
	                    defaults: [],
	                    body: {
	                        type: 'BlockStatement',
	                        body: [
	                            {
	                                type: 'ReturnStatement',
	                                argument: node
	                            }
	                        ]
	                    }
	                }
	            ],
	            callee: {
	                type: 'Identifier',
	                name: '___'
	            }
	        };
	    };
	    RiddleRunner.prototype.incrementInvocationCount = function (id, that, fn) {
	        this.invocationCount[id] = (this.invocationCount[id] || 0) + 1;
	        return fn.call(that);
	    };
	    Object.defineProperty(RiddleRunner.prototype, "maximumInvocationCount", {
	        get: function () {
	            var _this = this;
	            if (!Object.keys(this.invocationCount).length) {
	                throw new Error('No invocations recorded. Use invokeInstrumentedFn(...)');
	            }
	            return Object.keys(this.invocationCount).map(function (id) { return _this.invocationCount[id]; }).reduce(function (a, b) { return Math.max(a, b); });
	        },
	        enumerable: true,
	        configurable: true
	    });
	    RiddleRunner.prototype.estimateComplexity = function (n, min) {
	        var count = this.maximumInvocationCount;
	        if (min === 'O(d\u207f)' || count > Math.pow(2, n)) {
	            return 'O(d\u207f)';
	        }
	        if (min === 'O(n³)' || count > Math.pow(n, 3)) {
	            return 'O(n³)';
	        }
	        if (min === 'O(n²)' || count > Math.pow(n, 2)) {
	            return 'O(n²)';
	        }
	        if (min === 'O(n log n)' || count > n * Math.log(n)) {
	            return 'O(n log n)';
	        }
	        if (min === 'O(n)' || count > n) {
	            return 'O(n)';
	        }
	        if (min === 'O(log n)' || count > Math.log(n)) {
	            return 'O(log n)';
	        }
	        return 'O(1)';
	    };
	    RiddleRunner.prototype.countTypes = function () {
	        var types = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            types[_i - 0] = arguments[_i];
	        }
	        var count = 0;
	        this.crawl(this.ast, function (node) {
	            if (types.indexOf(node.type) >= 0) {
	                count++;
	            }
	        });
	        return count;
	    };
	    RiddleRunner.prototype.countLoops = function () {
	        return this.countTypes('ForStatement', 'WhileStatement', 'DoWhileStatement');
	    };
	    RiddleRunner.prototype.countConditions = function () {
	        return this.countTypes('IfStatement', 'SwitchStatement', 'ConditionalExpression');
	    };
	    RiddleRunner.prototype.countCalculations = function () {
	        return this.countTypes('UnaryExpression', 'BinaryExpression', 'AssignmentExpression');
	    };
	    RiddleRunner.prototype.countIdentifiers = function () {
	        var identifiers = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            identifiers[_i - 0] = arguments[_i];
	        }
	        var count = 0;
	        this.crawl(this.ast, function (node) {
	            if (node.type === 'Identifier') {
	                if (!identifiers.length || identifiers.indexOf(node.name) >= 0) {
	                    count++;
	                }
	            }
	            else if (node.type === 'Literal' && node.name === 'null') {
	                if (!identifiers.length || identifiers.indexOf(node.name) >= 0) {
	                    count++;
	                }
	            }
	        });
	        return count;
	    };
	    RiddleRunner.prototype.countLogicals = function () {
	        return this.countTypes('LogicalExpression');
	    };
	    RiddleRunner.prototype.countStatements = function () {
	        return this.countTypes('ForStatement', 'WhileStatement', 'DoWhileStatement', 'IfStatement', 'SwitchStatement', 'ExpressionStatement', 'ReturnStatement');
	    };
	    RiddleRunner.prototype.countVariableDeclarations = function () {
	        return this.countTypes('VariableDeclaration');
	    };
	    RiddleRunner.prototype.countOperators = function () {
	        var operators = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            operators[_i - 0] = arguments[_i];
	        }
	        var count = 0;
	        this.crawl(this.ast, function (node) {
	            if ((node.type === 'BinaryExpression') || (node.type === 'UpdateExpression') || (node.type === 'AssignmentExpression')) {
	                if (!operators.length || operators.indexOf(node.operator) >= 0) {
	                    count++;
	                }
	            }
	        });
	        return count;
	    };
	    RiddleRunner.prototype.crawl = function (node, callback) {
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
	    return RiddleRunner;
	}());
	exports.RiddleRunner = RiddleRunner;


/***/ },
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */,
/* 43 */,
/* 44 */,
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */,
/* 63 */,
/* 64 */,
/* 65 */,
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */,
/* 73 */,
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */,
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */,
/* 83 */,
/* 84 */,
/* 85 */,
/* 86 */,
/* 87 */,
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */,
/* 93 */,
/* 94 */
/***/ function(module, exports) {

	module.exports = "<md-list class=\"riddle-list\">\r\n    <md-list-item class=\"md-3-line\" ng-repeat=\"riddle in $ctrl.riddles\" ng-click=\"$ctrl.gotoRiddle(riddle.id)\" ng-disabled=\"!$ctrl.isAvailable(riddle)\" ng-class=\"{'lightest': !$ctrl.isAvailable(riddle)}\">\r\n         <img ng-src=\"riddles/{{riddle.location}}/icon.svg\" class=\"riddle-icon-small\" />\r\n         <div class=\"md-list-item-text\" layout=\"column\">\r\n            <md-headline class=\"no-wrap\" layout=\"row\">\r\n                <i class=\"layout-no-resize fa\" ng-class=\"{'fa-square-o': !$ctrl.isSolved(riddle), 'fa-check-square-o': $ctrl.isSolved(riddle)}\"></i>&nbsp;\r\n                <div flex style=\"min-width: 16em\"><span class=\"lighter\">Level {{riddle.level}}:</span>&nbsp;<span>{{riddle.title}}</span></div>\r\n                &nbsp;\r\n                <i class=\"layout-no-resize fa\" ng-class=\"{'fa-star-o lightest': riddle.state.score <= 0, 'fa-star': riddle.state.score > 0}\"></i>&nbsp;\r\n                <i class=\"layout-no-resize fa\" ng-class=\"{'fa-star-o lightest': riddle.state.score <= 1, 'fa-star': riddle.state.score > 1}\"></i>&nbsp;\r\n                <i class=\"layout-no-resize fa\" ng-class=\"{'fa-star-o lightest': riddle.state.score <= 2, 'fa-star': riddle.state.score > 2}\"></i>\r\n            </md-headline>\r\n            <p>{{riddle.shortDescription}}</p>\r\n        </div>\r\n    </md-list-item>\r\n</md-list>";

/***/ },
/* 95 */
/***/ function(module, exports) {

	module.exports = "<md-dialog aria-label=\"List of Riddles\">\r\n    <md-toolbar>\r\n        <div class=\"md-toolbar-tools\">List of Riddles</div>\r\n    </md-toolbar>\r\n\r\n    <md-dialog-content class=\"md-dialog-content\">\r\n        <riddle-list riddles = \"$ctrl.riddles\" selected-riddle=\"$ctrl.selectedRiddle\"></riddle-list>\r\n\r\n        <div layout-padding>\r\n            <p class=\"align-right\">\r\n                Want more riddles?\r\n                <a href=\"https://github.com/furti/evalquiz\" target=\"_blank\">Fork me on GitHub</a>!\r\n            </p>\r\n        </div>\r\n    </md-dialog-content>\r\n\r\n    <md-dialog-actions layout=\"row\">\r\n        <md-button ng-click=\"$ctrl.clear()\">Clear</md-button>\r\n        <span flex class=\"flex\"></span>\r\n        <md-button class=\"md-primary md-raised\" ng-click=\"$ctrl.close()\">Close</md-button>\r\n    </md-dialog-actions>\r\n</md-dialog>";

/***/ },
/* 96 */
/***/ function(module, exports) {

	module.exports = "<md-toolbar class=\"md-default-theme md-whiteframe-1dp\">\r\n    <div class=\"md-toolbar-tools\" layout=\"row\">\r\n        <div class=\"md-toolbar-item\">\r\n            <h1>eval(Quiz)</h1>\r\n        </div>\r\n\r\n        <div class=\"md-toolbar-item\">\r\n            <md-button ng-click=\"$ctrl.showCreditsDialog()\">About</md-button>\r\n        </div>\r\n\r\n        <div flex></div>\r\n\r\n        <div class=\"md-toolbar-item\">\r\n            <md-button ng-click=\"$ctrl.showOverview()\" class=\"md-raised\" ng-disabled=\"!$ctrl.riddles || $ctrl.running\">\r\n                Score:&nbsp;&nbsp;<i class=\"fa fa-star\"></i> {{$ctrl.totalScore}}\r\n            </md-button>\r\n        </div>\r\n\r\n        <div class=\"md-toolbar-item\">\r\n            <md-button ng-click=\"$ctrl.showRiddleListDialog()\" class=\"md-raised\" ng-disabled=\"!$ctrl.riddles || $ctrl.running\">\r\n                <i class=\"fa fa-bars separated\" aria-hidden=\"true\"></i> List of Riddles\r\n            </md-button>\r\n        </div>\r\n\r\n        <div class=\"md-toolbar-item\">\r\n            <md-button ng-click=\"$ctrl.gotoRiddle($ctrl.nextRiddleId)\" class=\"md-raised md-accent\" ng-disabled=\"!$ctrl.nextAvailable || $ctrl.running\">\r\n                Next Riddle\r\n                <i class=\"fa fa-arrow-right separated\" aria-hidden=\"true\"></i>\r\n            </md-button>\r\n        </div>\r\n    </div>\r\n</md-toolbar>";

/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

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
	var analytics_service_1 = __webpack_require__(1);
	__webpack_require__(98);
	var console_service_1 = __webpack_require__(21);
	var evalquiz_service_1 = __webpack_require__(15);
	__webpack_require__(100);
	var riddle_service_1 = __webpack_require__(20);
	var ui_service_1 = __webpack_require__(16);
	var utils_1 = __webpack_require__(2);
	var WorkbenchComponent = (function () {
	    function WorkbenchComponent(evalQuizService, riddleService, consoleService, uiService, analyticsService) {
	        var _this = this;
	        this.evalQuizService = evalQuizService;
	        this.riddleService = riddleService;
	        this.consoleService = consoleService;
	        this.uiService = uiService;
	        this.analyticsService = analyticsService;
	        this.selectedTab = 0;
	        var cmChange = function (editor, change) {
	            if (change.origin === 'setValue') {
	                editor.markText({ line: 0, ch: 0 }, { line: 0 }, { readOnly: true });
	                editor.markText({ line: editor.lastLine(), ch: 0 }, {
	                    line: editor.lastLine(),
	                    ch: 2
	                }, { readOnly: true });
	                editor.setCursor(1, 1);
	                editor.off('change', cmChange);
	            }
	        };
	        this.editorOptions = {
	            mode: 'javascript',
	            indentUnit: 4,
	            smartIndent: true,
	            tabSize: 4,
	            indentWithTabs: true,
	            lineNumbers: true,
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
	    }
	    Object.defineProperty(WorkbenchComponent.prototype, "solved", {
	        get: function () {
	            return this.riddleService.isSolved(this.riddle);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(WorkbenchComponent.prototype, "running", {
	        get: function () {
	            return this.riddleService.running;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    WorkbenchComponent.prototype.trash = function ($event) {
	        var _this = this;
	        this.uiService.confirm('Trash Your Code', 'Are you sure that you want to clear the editor?', 'Delete', 'Abort').then(function () {
	            _this.riddle.state.code = _this.riddle.detail.stub;
	            _this.evalQuizService.saveRiddle(_this.riddle);
	            _this.uiService.toast('Code trashed.');
	        });
	    };
	    Object.defineProperty(WorkbenchComponent.prototype, "hasSaves", {
	        get: function () {
	            return !!this.riddle.state.savedCode && Object.keys(this.riddle.state.savedCode).length > 0;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    WorkbenchComponent.prototype.load = function () {
	        var _this = this;
	        var items = this.hasSaves ? Object.keys(this.riddle.state.savedCode) : [];
	        items.sort();
	        this.uiService.menu('.code-load-button', items).then(function (item) {
	            if (item) {
	                _this.riddle.state.code = _this.riddle.state.savedCode[item];
	                _this.evalQuizService.saveRiddle(_this.riddle);
	                _this.uiService.toast("Loaded \"" + item + "\".");
	            }
	        });
	    };
	    WorkbenchComponent.prototype.save = function () {
	        this.riddle.state.savedCode = this.riddle.state.savedCode || {};
	        this.riddle.state.savedCode['Manual Save'] = this.riddle.state.code;
	        this.evalQuizService.saveRiddle(this.riddle);
	        this.uiService.toast('Code saved successfully.');
	    };
	    WorkbenchComponent.prototype.solve = function () {
	        if (this.running) {
	            this.riddleService.abort();
	        }
	        else {
	            this.selectedTab = 2;
	            this.riddleService.execute(this.riddle);
	        }
	    };
	    WorkbenchComponent.$inject = ['evalQuizService', 'riddleService', 'consoleService', 'uiService', 'analyticsService'];
	    WorkbenchComponent = __decorate([
	        utils_1.Component(module, 'workbench', {
	            template: __webpack_require__(102),
	            bindings: {
	                riddle: '<'
	            }
	        }), 
	        __metadata('design:paramtypes', [(typeof (_a = typeof evalquiz_service_1.EvalQuizService !== 'undefined' && evalquiz_service_1.EvalQuizService) === 'function' && _a) || Object, (typeof (_b = typeof riddle_service_1.RiddleService !== 'undefined' && riddle_service_1.RiddleService) === 'function' && _b) || Object, (typeof (_c = typeof console_service_1.ConsoleService !== 'undefined' && console_service_1.ConsoleService) === 'function' && _c) || Object, (typeof (_d = typeof ui_service_1.UIService !== 'undefined' && ui_service_1.UIService) === 'function' && _d) || Object, (typeof (_e = typeof analytics_service_1.AnalyticsService !== 'undefined' && analytics_service_1.AnalyticsService) === 'function' && _e) || Object])
	    ], WorkbenchComponent);
	    return WorkbenchComponent;
	    var _a, _b, _c, _d, _e;
	}());


/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

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
	var utils_1 = __webpack_require__(2);
	var Controller = (function () {
	    function Controller() {
	    }
	    Controller = __decorate([
	        utils_1.Component(module, 'apiInfo', {
	            template: __webpack_require__(99),
	            bindings: {
	                api: '<'
	            }
	        }), 
	        __metadata('design:paramtypes', [])
	    ], Controller);
	    return Controller;
	}());


/***/ },
/* 99 */
/***/ function(module, exports) {

	module.exports = "<div ng-repeat=\"member in $ctrl.api\" class=\"md-padding md-body-1\">\r\n    <div class=\"md-headline\">\r\n        Function <code>{{member.signature}}</code>\r\n    </div>\r\n\r\n    <p class=\"md-subhead markdown\" btf-markdown=\"member.description\"></p>\r\n\r\n    <p class=\"markdown\" btf-markdown=\"member.explanation\"></p>\r\n\r\n    <member-info member=\"member\"></member-info>\r\n</div>";

/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

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
	var utils_1 = __webpack_require__(2);
	var Controller = (function () {
	    function Controller() {
	    }
	    Controller = __decorate([
	        utils_1.Component(module, 'memberInfo', {
	            template: __webpack_require__(101),
	            bindings: {
	                member: '<'
	            }
	        }), 
	        __metadata('design:paramtypes', [])
	    ], Controller);
	    return Controller;
	}());


/***/ },
/* 101 */
/***/ function(module, exports) {

	module.exports = "<ul class=\"member-info\" ng-if=\"$ctrl.member.params && $ctrl.member.params.length\">\r\n    <li ng-repeat=\"param in $ctrl.member.params\">\r\n        <div class=\"markdown\" btf-markdown=\"param.signatureDescription\"></div>\r\n        <member-info ng-if=\"param.params || param.properties\" member=\"param\"></member-info>\r\n    </li>\r\n</ul>\r\n\r\n<ul class=\"member-info\" ng-if=\"$ctrl.member.properties && $ctrl.member.properties.length\">\r\n    <li ng-repeat=\"property in $ctrl.member.properties\">\r\n        <div class=\"markdown\" btf-markdown=\"property.signatureDescription\"></div>\r\n        <member-info ng-if=\"property.params || property.properties\" member=\"property\"></member-info>\r\n    </li>\r\n</ul>";

/***/ },
/* 102 */
/***/ function(module, exports) {

	module.exports = "<md-content class=\"text\" flex=\"50\" layout=\"column\" class=\"layout-stretch\">\r\n\t<md-card flex class=\"riddle-left-card\">\r\n\t\t<img ng-src=\"riddles/{{$ctrl.riddle.location}}/icon.svg\" class=\"riddle-icon\" />\r\n\r\n\t\t<md-card-title>\r\n\r\n\t\t\t<md-card-title-text>\r\n\t\t\t\t<div class=\"md-headline\">\r\n\t\t\t\t\t<i class=\"fa\" ng-class=\"{'fa-square-o': !$ctrl.solved, 'fa-check-square-o': $ctrl.solved}\"></i>&nbsp;\r\n\t\t\t\t\t<span class=\"lighter\">Level {{$ctrl.riddle.level}}:</span>&nbsp;<span>{{$ctrl.riddle.title}}</span>&nbsp;\r\n\t\t\t\t\t<i class=\"fa\" ng-class=\"{'fa-star-o lightest': $ctrl.riddle.state.score <= 0, 'fa-star': $ctrl.riddle.state.score > 0}\"></i>\r\n\t\t\t\t\t<i class=\"fa\" ng-class=\"{'fa-star-o lightest': $ctrl.riddle.state.score <= 1, 'fa-star': $ctrl.riddle.state.score > 1}\"></i>\r\n\t\t\t\t\t<i class=\"fa\" ng-class=\"{'fa-star-o lightest': $ctrl.riddle.state.score <= 2, 'fa-star': $ctrl.riddle.state.score > 2}\"></i>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class=\"md-subhead\">\r\n\t\t\t\t\t{{$ctrl.riddle.shortDescription}}\r\n\t\t\t\t</div>\r\n\t\t\t</md-card-title-text>\r\n\t\t</md-card-title>\r\n\r\n\t\t<md-tabs flex md-selected=\"$ctrl.selectedTab\">\r\n\t\t\t<md-tab label=\"Info\" class=\"info-tab\">\r\n\t\t\t\t<div flex layout=\"column\" class=\"lined-top\">\r\n\t\t\t\t\t<div flex class=\"scrolls md-padding md-body-1\">\r\n\t\t\t\t\t\t<div btf-markdown=\"$ctrl.riddle.detail.description\"></div>\r\n\r\n\t\t\t\t\t\t<p ng-if=\"$ctrl.riddle.minScoreToSolve == 2\">\r\n\t\t\t\t\t\t\t<i class=\"fa fa-exclamation-circle\"></i> You need at least two stars (\r\n\t\t\t\t\t\t\t<i class=\"fa fa-star\"></i>&nbsp;<i class=\"fa fa-star\"></i>&nbsp;<i class=\"fa fa-star-o lightest\"></i>) to solve the\r\n\t\t\t\t\t\t\triddle!\r\n\t\t\t\t\t\t</p>\r\n\r\n\t\t\t\t\t\t<p ng-if=\"$ctrl.riddle.minScoreToSolve == 3\">\r\n\t\t\t\t\t\t\t<i class=\"fa fa-exclamation-circle\"></i> You need all three stars (\r\n\t\t\t\t\t\t\t<i class=\"fa fa-star\">&nbsp;</i><i class=\"fa fa-star\"></i>&nbsp;<i class=\"fa fa-star\"></i>) to solve the riddle!\r\n\t\t\t\t\t\t</p>\r\n\t\t\t\t\t</div>\r\n\r\n\t\t\t\t\t<div class=\"md-headline md-padding layout-no-resize lined-top\">\r\n\t\t\t\t\t\t<i class=\"fa fa-bullseye\"></i>&nbsp;Goals\r\n\t\t\t\t\t</div>\r\n\r\n\t\t\t\t\t<div class=\"md-padding layout-no-resize md-body-1\">\r\n\t\t\t\t\t\t<table>\r\n\t\t\t\t\t\t\t<tbody>\r\n\t\t\t\t\t\t\t\t<tr ng-repeat=\"goal in $ctrl.riddle.detail.goals track by $index\" ng-if=\"$index <= $ctrl.riddle.state.score\">\r\n\t\t\t\t\t\t\t\t\t<td>\r\n\t\t\t\t\t\t\t\t\t\t<i class=\"fa\" ng-class=\"{'fa-square-o': $ctrl.riddle.state.score <= $index, 'fa-check-square-o': $ctrl.riddle.state.score > $index}\"></i>\r\n\t\t\t\t\t\t\t\t\t</td>\r\n\t\t\t\t\t\t\t\t\t<td style=\"min-width: 5em; text-align: center;\">\r\n\t\t\t\t\t\t\t\t\t\t<i class=\"fa fa-star\"></i>\r\n\t\t\t\t\t\t\t\t\t\t<i class=\"fa\" ng-class=\"{'fa-star-o lightest': $index <= 0, 'fa-star': $index > 0}\"></i>\r\n\t\t\t\t\t\t\t\t\t\t<i class=\"fa\" ng-class=\"{'fa-star-o lightest': $index <= 1, 'fa-star': $index > 1}\"></i>\r\n\t\t\t\t\t\t\t\t\t</td>\r\n\t\t\t\t\t\t\t\t\t<td>\r\n\t\t\t\t\t\t\t\t\t\t<div class=\"markdown\" btf-markdown=\"goal\"></div>\r\n\t\t\t\t\t\t\t\t\t</td>\r\n\t\t\t\t\t\t\t\t</tr>\r\n\t\t\t\t\t\t\t</tbody>\r\n\t\t\t\t\t\t</table>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t</md-tab>\r\n\r\n\t\t\t<md-tab label=\"API\">\r\n\t\t\t\t<div flex layout=\"column\" class=\"no-scroll lined-top\">\r\n\t\t\t\t\t<div flex class=\"scrolls md-body-1\">\r\n\t\t\t\t\t\t<api-info api=\"$ctrl.riddle.detail.api\" />\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t</md-tab>\r\n\r\n\t\t\t<md-tab label=\"Console\">\r\n\t\t\t\t<div flex layout=\"column\" class=\"no-scroll\">\r\n\t\t\t\t\t<div flex id=\"console\" class=\"console\">\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t</md-tab>\r\n\r\n\t\t\t<md-tab label=\"Hints\" class=\"hints-tab\" ng-if=\"$ctrl.riddle.detail.hints\">\r\n\t\t\t\t<div flex layout=\"column\" class=\"lined-top\">\r\n\t\t\t\t\t<div flex class=\"scrolls md-padding md-body-1\">\r\n\t\t\t\t\t\t<div btf-markdown=\"$ctrl.riddle.detail.hints\"></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t</md-tab>\r\n\t\t</md-tabs>\r\n\t</md-card>\r\n</md-content>\r\n\r\n<md-content flex=\"50\" layout=\"column\">\r\n\t<md-card flex class=\"riddle-right-card no-scrolls\">\r\n\t\t<md-card-title class=\"layout-no-resize\">\r\n\t\t\t<md-card-title-text>\r\n\t\t\t\t<div class=\"md-headline\">\r\n\t\t\t\t\t<i class=\"fa fa-code\"></i>&nbsp;Function\r\n\t\t\t\t\t<code>{{$ctrl.riddle.detail.member.signature}}</code>\r\n\t\t\t\t</div>\r\n\r\n\t\t\t\t<div class=\"md-subhead markdown\" btf-markdown=\"$ctrl.riddle.detail.member.description\"></div>\r\n\t\t\t</md-card-title-text>\r\n\t\t</md-card-title>\r\n\r\n\t\t<md-card-content class=\"members layout-no-resize md-body-1\">\r\n\t\t\t<div btf-markdown=\"$ctrl.riddle.detail.member.explanation\"></div>\r\n\t\t\t<member-info member=\"$ctrl.riddle.detail.member\"></member-info>\r\n\t\t</md-card-content>\r\n\r\n\t\t<md-card-content flex layout=\"column\" class=\"editor lined-top lined-bottom\">\r\n\t\t\t<textarea ng-model=\"$ctrl.riddle.state.code\" ui-codemirror=\"$ctrl.editorOptions\"></textarea>\r\n\t\t</md-card-content>\r\n\r\n\t\t<md-card-actions layout=\"row\" layout-align=\"end center\">\r\n\t\t\t<md-button ng-click=\"$ctrl.save()\" ng-disabled=\"$ctrl.running\">Save</md-button>\r\n\t\t\t<md-button class=\"code-load-button\" ng-click=\"$ctrl.load()\" ng-disabled=\"!$ctrl.hasSaves || $ctrl.running\">Load</md-button>\r\n\t\t\t<md-button ng-click=\"$ctrl.trash()\" ng-disabled=\"$ctrl.running\">Trash</md-button>\r\n\r\n\t\t\t<span flex=\"\" class=\"flex\"></span>\r\n\r\n\t\t\t<md-button class=\"md-primary md-raised\" ng-click=\"$ctrl.solve($event)\" ng-disabled=\"$ctrl.running\">\r\n\t\t\t\t<i class=\"fa fa-play-circle separated\" aria-hidden=\"true\"></i> Solve\r\n\t\t\t</md-button>\r\n\t\t\t<md-button class=\"md-accent md-raised\" ng-click=\"$ctrl.solve($event)\" ng-disabled=\"!$ctrl.running\">\r\n\t\t\t\tAbort\r\n\t\t\t</md-button>\r\n\t\t</md-card-actions>\r\n\t</md-card>\r\n</md-content>";

/***/ },
/* 103 */
/***/ function(module, exports) {

	module.exports = "<toolbar riddles=\"$ctrl.riddles\" selected-riddle=\"$ctrl.selectedRiddle\"></toolbar>\r\n\r\n<storage-info-bar></storage-info-bar>\r\n\r\n<md-content ng-if=\"!$ctrl.selectedRiddle\">\r\n\t<div class=\"loader\">\r\n\t\t<md-progress-linear md-mode=\"indeterminate\"></md-progress-linear>\r\n\t\t<p>Loading ...</p>\r\n\t</div>\r\n</md-content>\r\n\r\n<md-content ng-if=\"$ctrl.selectedRiddle && !$ctrl.isAvailable($ctrl.selectedRiddle)\">\r\n\t<div class=\"loader\">\r\n\t\tThe riddle \"{{$ctrl.selectedRiddle.title}}\" is not yet available. You have to solve some earlier riddle, first!\r\n\t</div>\r\n</md-content>\r\n\r\n<workbench ng-if=\"$ctrl.selectedRiddle && $ctrl.isAvailable($ctrl.selectedRiddle)\" riddle=\"$ctrl.selectedRiddle\" layout=\"row\"\r\n\tflex layout-padding></workbench>";

/***/ }
]);
//# sourceMappingURL=app.js.map