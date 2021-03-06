module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('default', ['jshint', 'jsbeautifier', 'mochaTest']);

    // Print a timestamp (useful for when watching)
    grunt.registerTask('timestamp', function () {
        grunt.log.subhead(Date());
    });

    grunt.initConfig({
        jshint: {
            files: ['./lib/*.js', './test/unit/*.js', './test/docscripts/*.js', 'gruntfile.js', 'package.json', 'index.js'],
            options: {
                browser: true,
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: false,
                boss: true,
                eqnull: true,
                node: true,
                expr: true,
                globals: {
                    'xit': true,
                    'xdescribe': true,
                    'it': true,
                    'describe': true,
                    'before': true,
                    'after': true,
                    'done': true
                }
            }
        },
        jsbeautifier: {
            files: ['Gruntfile.js', 'index.js', 'lib/*.js', 'test/**/*.js'],
            options: {
                config: '.jsbeautifyrc'
            }
        },
        watch: {
            all: {
                files: ['./lib/*.js', './test/*/*.js', 'index.js', 'gruntfile.js'],
                tasks: ['default']
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    timeout: '10000',
                    bail: true
                },
                src: ['test/unit/**/test-*.js', 'test/docscripts/*.js']
            }
        },
        shell: {
            run_istanbul: {
                command: "istanbul cover ./node_modules/mocha/bin/_mocha -- -R spec --recursive"
            }
        }
    });

    grunt.registerTask('mocha', ['mochaTest']);
    grunt.registerTask('coverage', ['shell:run_istanbul']);
    grunt.registerTask('default', ['jsbeautifier', 'jshint', 'mocha']);
};
