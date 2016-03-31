module.exports = function (grunt) {

    //Initializing the configuration object
    grunt.initConfig({

        // get the configuration info from package.json ----------------------------
        // this way we can use things like name and version (pkg.name)
        pkg: grunt.file.readJSON('package.json'),

        // Task configuration
        concat: {
            options: {
                separator: grunt.util.linefeed + ';' + grunt.util.linefeed
            },
            libs: {
                src: [
                    './bower_components/shifty/dist/shifty.min.js',
                    './bower_components/draw2d/dist/patched_raphael.js',
                    './bower_components/jquery/jquery.min.js',
                    './bower_components/jquery-ui/jquery-ui.min.js',
                    './bower_components/jsrender/jsrender.min.js',
                    './bower_components/shufflejs/dist/jquery.shuffle.modernizr.min.js',
                    './bower_components/draw2d/dist/jquery.autoresize.js',
                    './bower_components/draw2d/dist/jquery-touch_punch.js',
                    './bower_components/draw2d/dist/jquery.contextmenu.js',
                    './bower_components/draw2d/dist/rgbcolor.js',
                    './bower_components/draw2d/dist/patched_canvg.js',
                    './bower_components/draw2d/dist/patched_Class.js',
                    './bower_components/draw2d/dist/json2.js',
                    './bower_components/draw2d/dist/pathfinding-browser.min.js',
                    './bower_components/draw2d/dist/draw2d.js'
                ],
                dest: './dist/assets/javascript/dependencies.js'
            },
            application: {
                src: [
                    './src/assets/javascript/**/*.js'
                ],
                dest: './dist/assets/javascript/app.js'
            },
            css:{
                src:[
                    './bower_components/bootstrap/dist/css/bootstrap.min.css'
                ],
                dest: './dist/assets/stylesheets/dependencies.css'
            }

        },

        copy: {
            application: {
                expand: true,
                cwd: 'src/',
                src: '**/*.html',
                dest: 'dist/'
            },
            bootstrap:{
                expand: true,
                cwd: 'bower_components/bootstrap/dist',
                src: ['**/*'],
                dest: 'dist/lib/bootstrap'
            },

        },

        less: {
            development: {
                options: {
                    compress: false
                },
                files: {
                    "./dist/assets/stylesheets/main.css": [
                        "./src/assets/stylesheets/layout.less",
                        "./src/assets/stylesheets/style.less",
                        "./src/assets/stylesheets/palette.less"
                    ]
                }
            }
        },

        // configure jshint to validate js files -----------------------------------
        jshint: {
            options: {
                reporter: require('jshint-stylish') // use jshint-stylish to make our errors look and read good
            },

            // when this task is run, lint the Gruntfile and all js files in src
            build: ['Grunfile.js', 'src/**/*.js']
        },

        watch: {
            js: {
                files: [
                    './src/assets/javascript/**/*.js'
                ],
                tasks: ['concat:application'],
                options: {
                    livereload: true
                }
            },
            html: {
                files: [
                    './src/*.html'
                ],
                tasks: ['copy:application']
            },

            less: {
                files: [
                    "./src/assets/stylesheets/**/*.less"
                ],
                tasks: ['less'],
                options: {
                    livereload: true
                }
            }
        },
        'gh-pages': {
            options: {
                base: 'dist'
            },
            src: ['**']
        }
    });

    // Plugin loading
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-gh-pages');

    // Task definition
    grunt.registerTask('default', ['jshint', 'concat', 'less', 'copy']);
    grunt.registerTask('publish', ['jshint', 'concat', 'less', 'copy', 'gh-pages']);
};

