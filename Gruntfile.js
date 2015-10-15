module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        complexity: {
            generic: {
                src: ['lib/**/*.js'],
                options: {
                    breakOnErrors: true,
                    errorsOnly: false,
                    cyclometric: 6, // default is 3
                    halstead: 16, // default is 8
                    maintainability: 100 // default is 100
                }
            }
        },
        jshint: {
            all: [
        'Gruntfile.js',
        'lib/**/*.js'
      ],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        mochacli: {
            all: ['test/**/*.js'],
            options: {
                reporter: 'spec',
                ui: 'tdd'
            }
        },
        watch: {
            js: {
                files: ['**/*.js', '!node_modules/**/*.js'],
                tasks: ['default'],
                options: {
                    nospawn: true
                }
            }
        },
        jsbeautifier: {
            modify: {
                src: ['Gruntfile.js', 'lib/**/*.js'],
                options: {
                    config: '.jsbeautifyrc'
                }
            },
            verify: {
                src: ['Gruntfile.js', 'lib/**/*.js'],
                options: {
                    mode: 'VERIFY_ONLY',
                    config: '.jsbeautifyrc'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-complexity');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-cli');
    grunt.loadNpmTasks("grunt-jsbeautifier");

    grunt.registerTask('clean', ['jsbeautifier:modify', 'jshint']);
    grunt.registerTask('verify', ['jsbeautifier:verify', 'jshint']);
    grunt.registerTask('test', ['verify', 'complexity', 'mochacli', 'watch']);
    grunt.registerTask('ci', ['verify', 'complexity', 'mochacli']);
    grunt.registerTask('default', ['test']);
    grunt.registerTask('deploy', ['modify', 'complexity', 'mochacli']);
};
