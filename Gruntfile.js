module.exports = function (grunt) {
    // load the task
    grunt.loadNpmTasks("grunt-typescript");

    grunt.initConfig({
        typescript: {
            watch: {
                src: ["ts/*.ts"],
                dest: 'js',
                options: {
                    target: 'es5',
                    module: 'commonjs',
                    sourceMap: false,
                    declaration: false,
                    removeComments: false,
                    failOnTypeErrors: true,
                    noImplicitAny: true,
                    basePath: 'ts',
                    watch: 'ts'
                }
            },
            build: {
                src: ["ts/*.ts"],
                dest: 'js',
                options: {
                    target: 'es5',
                    module: 'commonjs',
                    sourceMap: false,
                    declaration: false,
                    removeComments: false,
                    failOnTypeErrors: true,
                    noImplicitAny: true,
                    basePath: 'ts'
                }
            }
        }
    });

    grunt.registerTask("watch", ["typescript:watch"]);
    grunt.registerTask("build", ["typescript:build"]);
};