module.exports = function (grunt) {
    // load the task
    grunt.loadNpmTasks("grunt-typescript");

    grunt.initConfig({
        typescript: {
            // A specific target
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
                    basePath: 'ts',
                    watch: 'ts'
                }
            }
        }
    });

    grunt.registerTask("default", ["typescript:build"]);
};