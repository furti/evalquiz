module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-typedoc");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-open");

    grunt.initConfig({
        connect: {
            server: {
                options: {
                    port: 80,
                    base: "./"
                }
            }
        },

        copy: {
            default: {
                files: [
                    { expand: true, src: ["./node_modules/hammerjs/hammer.min.js"], dest: ("./dist/"), flatten: true },
                    { expand: true, src: ["./node_modules/angular/angular.js"], dest: ("./dist/"), flatten: true },
                    { expand: true, src: ["./node_modules/angular-route/angular-route.min.js"], dest: ("./dist/"), flatten: true },
                    { expand: true, src: ["./node_modules/angular-animate/angular-animate.min.js"], dest: ("./dist/"), flatten: true },
                    { expand: true, src: ["./node_modules/angular-aria/angular-aria.min.js"], dest: ("./dist/"), flatten: true },
                    { expand: true, src: ["./node_modules/angular-sanitize/angular-sanitize.min.js"], dest: ("./dist/"), flatten: true },
                    { expand: true, src: ["./node_modules/angular-material/angular-material.min.js", "./node_modules/angular-material/angular-material.min.css"], dest: ("./dist/"), flatten: true },
                    { expand: true, src: ["./node_modules/angular-markdown-directive/markdown.js"], dest: ("./dist/"), flatten: true },
                    { expand: true, src: ["./node_modules/showdown/compressed/showdown.min.js"], dest: ("./dist/"), flatten: true },
                    { expand: true, src: ["./node_modules/codemirror/lib/codemirror.js", "./node_modules/codemirror/lib/codemirror.css"], dest: ("./dist/"), flatten: true },
                    { expand: true, src: ["./node_modules/codemirror/mode/javascript/javascript.js"], dest: ("./dist/"), flatten: true },
                    { expand: true, src: ["./node_modules/jshint/dist/jshint.js"], dest: ("./dist/"), flatten: true },
                    { expand: true, src: ["./node_modules/codemirror/addon/lint/lint.js", "./node_modules/codemirror/addon/lint/lint.css"], dest: ("./dist/"), flatten: true },
                    { expand: true, src: ["./node_modules/codemirror/addon/lint/javascript-lint.js"], dest: ("./dist/"), flatten: true },
                    { expand: true, src: ["./node_modules/codemirror/theme/elegant.css"], dest: ("./dist/"), flatten: true },
                    { expand: true, src: ["./node_modules/angular-ui-codemirror/src/ui-codemirror.js"], dest: ("./dist/"), flatten: true },
                    { expand: true, src: ["./node_modules/angular-cookies/angular-cookies.min.js"], dest: ("./dist/"), flatten: true },
                    { expand: true, src: ["./node_modules/angular-local-storage/dist/angular-local-storage.min.js"], dest: ("./dist/"), flatten: true },
                    { expand: true, src: ["./node_modules/esprima/esprima.js"], dest: ("./dist/"), flatten: true },
                    { expand: true, src: ["./node_modules/font-awesome/css/font-awesome.min.css"], dest: ("./dist/"), flatten: true },
                ]
            }
        },

        browserify: {
            default: {
                files: {
                    "dist/evalquiz.js": ["./ts/evalquiz.ts", "./ts/riddleCard.ts", "./ts/riddleManager.ts"]
                },
                options: {
                    plugin: ["tsify"]
                }
            }
        },

        ts: {
            options: {
                target: "es6",
                module: "commonjs",
                sourceMap: true,
                sourceRoot: "./js",
                noImplicitAny: true,
                fast: "watch"
            },
            default: {
                src: "./ts/**/*.ts",
                outdir: "./dist"
            }
        },

        // typescript: {
        //     base: {
        //         src: ["./ts/**/*.ts"],
        //         dest: "./js",
        //         options: {
        //             module: "commonjs",
        //             target: "es5",
        //             sourceMap: true,
        //             declaration: true
        //         }
        //     }

        //     // basic: {
        //     //     options: {
        //     //         rootDir: "./",
        //     //         defaultTsConfig: {
        //     //             "compilerOptions": {
        //     //                 "target": "es5",
        //     //                 "module": "commonjs",
        //     //                 "moduleResolution": "node",
        //     //                 "isolatedModules": false,
        //     //                 "jsx": "react",
        //     //                 "experimentalDecorators": true,
        //     //                 "emitDecoratorMetadata": true,
        //     //                 "declaration": false,
        //     //                 "noImplicitAny": false,
        //     //                 "removeComments": true,
        //     //                 "noLib": false,
        //     //                 "preserveConstEnums": true,
        //     //                 "suppressImplicitAnyIndexErrors": true,
        //     //                 "out": "./js/evalquiz.js"
        //     //             },
        //     //             "filesGlob": [
        //     //                 "ts/**/*.ts",
        //     //                 "ts/**/*.tsx"
        //     //             ],
        //     //         }
        //     //     }
        //     // }
        // },

        typedoc: {
            build: {
                options: {
                    name: "evalquiz",
                    target: "es5",
                    module: "commonjs",
                    jsx: "react",
                    out: "docs/",
                },
                src: "ts/**/*"
            }
        },

        watch: {
            files: ["ts/**/*.ts", "ts/**/*.tsx"],
            tasks: ["build"]
        },

        open: {
            dev: {
                path: "http://localhost/index.html"
            }
        }
    });

    grunt.registerTask("build", ["browserify"]);
    grunt.registerTask("dist", ["copy"]);
    grunt.registerTask("default", ["build", "dist", "connect", "open", "watch"]);
    grunt.registerTask("dev", ["build", "connect", "watch"]);
};