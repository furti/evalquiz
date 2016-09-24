module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-typedoc");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-open");
    grunt.loadNpmTasks("grunt-webpack");

    var tsconfig = require("./src/riddles/tsconfig.json");
    var webpack = require("webpack");
    var webpackConfig = require("./webpack.config.js");

    grunt.initConfig({
        copy: {
            default: {
                files: [
                    { expand: true, cwd: "./src", src: ["index.html"], dest: ("./dist"), flatten: true },
                    { expand: true, cwd: "./src", src: ["style/**/*.css"], dest: ("./dist"), flatten: false },
                    { expand: true, cwd: "./src", src: ["riddles/**/*"], dest: ("./dist"), flatten: false }
                ]
            },

            libs: {
                files: [
                    { expand: true, src: ["./node_modules/jquery/dist/jquery.min.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/angular-material/angular-material.min.css"], dest: ("./dist/style/"), flatten: true },
                    { expand: true, src: ["./node_modules/showdown/compressed/showdown.min.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/codemirror/lib/codemirror.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/codemirror/lib/codemirror.css"], dest: ("./dist/style/"), flatten: true },
                    { expand: true, src: ["./node_modules/codemirror/mode/javascript/javascript.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/jshint/dist/jshint.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/codemirror/addon/lint/lint.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/codemirror/addon/lint/lint.css"], dest: ("./dist/style/"), flatten: true },
                    { expand: true, src: ["./node_modules/codemirror/addon/lint/javascript-lint.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/codemirror/theme/elegant.css"], dest: ("./dist/style/"), flatten: true },
                    { expand: true, src: ["./node_modules/esprima/esprima.js"], dest: ("./dist/script/"), flatten: true },
                    { expand: true, src: ["./node_modules/roboto-fontface/css/roboto/roboto-fontface.css"], dest: ("./dist/style/roboto"), flatten: true },
                    { expand: true, src: ["./node_modules/roboto-fontface/fonts/Roboto/*"], dest: ("./dist/fonts/Roboto"), flatten: true },
                    { expand: true, src: ["./node_modules/font-awesome/css/font-awesome.min.css"], dest: ("./dist/style"), flatten: true },
                    { expand: true, src: ["./node_modules/font-awesome/fonts/fontawesome-*"], dest: ("./dist/fonts"), flatten: true },
                ]
            }
        },

        ts: {
            default: {
                src: ["./src/riddles/**/*.ts"],
                options: tsconfig.compilerOptions
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

        webpack: {
            options: webpackConfig,

            build: {
                plugins: webpackConfig.plugins.concat(
                    new webpack.DefinePlugin({
                        "process.env": {
                            // This has effect on the react lib size
                            "NODE_ENV": JSON.stringify("production")
                        }
                    }),
                    new webpack.optimize.DedupePlugin(),
                    new webpack.optimize.UglifyJsPlugin()
                )
            },

            "build-dev": {
                devtool: "source-map",
                debug: true
            }
        },

        "webpack-dev-server": {
            options: {
                webpack: webpackConfig,
                contentBase: "dist/",
                publicPath: "/" + webpackConfig.output.publicPath
            },

            start: {
                keepAlive: false,
                webpack: {
                    devtool: "eval",
                    debug: true
                }
            },

            run: {
                keepAlive: true,
                webpack: {
                    devtool: "eval",
                    debug: true
                }
            }
        },

        watch: {
            riddles: {
                files: ["src/riddles/**/*"],
                tasks: ["ts", "copy:default"],
                options: {
                    spawn: false,
                }
            },

            static: {
                files: ["src/*", "src/style/**/*"],
                tasks: ["ts", "copy:default"],
                options: {
                    spawn: false,
                }
            },
        }
    });

    grunt.registerTask("deploy", ["ts", "copy", "webpack:build"]);
    grunt.registerTask("default", ["ts", "copy", "webpack-dev-server:start", "watch"]);
};