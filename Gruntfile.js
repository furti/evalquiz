module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-typedoc");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-open");

    var port = 8080;

    grunt.initConfig({
        connect: {
            server: {
                options: {
                    port: port,
                    base: "./dist"
                }
            }
        },

        copy: {
            default: {
                files: [
                    { expand: true, cwd: "./src", src: ["index.html"], dest: ("./dist"), flatten: true },
                    { expand: true, cwd: "./src", src: ["style/**/*.css"], dest: ("./dist"), flatten: false },
                    { expand: true, cwd: "./src", src: ["riddles/**/*"], dest: ("./dist"), flatten: false },
                    { expand: true, cwd: "./src", src: ["script/**/*.html"], dest: ("./dist"), flatten: false },
                ]
            },

            libs: {
                files: [
                    { expand: true, src: ["./node_modules/hammerjs/hammer.min.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/angular/angular.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/angular-route/angular-route.min.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/angular-animate/angular-animate.min.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/angular-aria/angular-aria.min.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/angular-sanitize/angular-sanitize.min.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/angular-material/angular-material.min.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/angular-material/angular-material.min.css"], dest: ("./dist/style/"), flatten: true },
                    { expand: true, src: ["./node_modules/angular-markdown-directive/markdown.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/showdown/compressed/showdown.min.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/codemirror/lib/codemirror.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/codemirror/lib/codemirror.css"], dest: ("./dist/style/"), flatten: true },
                    { expand: true, src: ["./node_modules/codemirror/mode/javascript/javascript.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/jshint/dist/jshint.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/codemirror/addon/lint/lint.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/codemirror/addon/lint/lint.css"], dest: ("./dist/style/"), flatten: true },
                    { expand: true, src: ["./node_modules/codemirror/addon/lint/javascript-lint.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/codemirror/theme/elegant.css"], dest: ("./dist/style/"), flatten: true },
                    { expand: true, src: ["./node_modules/angular-ui-codemirror/src/ui-codemirror.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/angular-cookies/angular-cookies.min.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/angular-local-storage/dist/angular-local-storage.min.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/esprima/esprima.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/roboto-fontface/css/roboto/roboto-fontface.css"], dest: ("./dist/style/roboto"), flatten: true },
                    { expand: true, src: ["./node_modules/roboto-fontface/fonts/Roboto/*"], dest: ("./dist/fonts/Roboto"), flatten: true },
                    { expand: true, src: ["./node_modules/font-awesome/css/font-awesome.min.css"], dest: ("./dist/style"), flatten: true },
                    { expand: true, src: ["./node_modules/font-awesome/fonts/fontawesome-*"], dest: ("./dist/fonts"), flatten: true },
                ]
            }
        },

        browserify: {
            default: {
                files: {
                    "dist/script/evalquiz.js": ["./src/script/evalquiz.ts"]
                },
                options: {
                    plugin: ["tsify"]
                }
            }
        },

        typedoc: {
            build: {
                options: {
                    name: "evalquiz",
                    target: "es5",
                    module: "commonjs",
                    jsx: "react",
                    out: "docs/",
                },
                src: "./src/script/**/*.ts"
            }
        },

        watch: {
            scripts: {
                files: ["./src/script/**/*.ts", "./src/script/**/*.tsx"],
                tasks: ["build"]
            },

            others: {
                files: ["./src/**/*.html", "./src/**/*.css", "./src/riddles/**/*"],
                tasks: ["copy:default"]
            }
        },

        open: {
            dev: {
                path: "http://localhost:" + port + "/index.html"
            }
        }
    });

    grunt.registerTask("build", ["browserify"]);
    grunt.registerTask("dist", ["copy"]);
    grunt.registerTask("default", ["build", "dist", "connect", "open", "watch"]);
    grunt.registerTask("dev", ["build", "connect", "watch"]);
};