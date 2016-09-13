module.exports = function (grunt) {

    //Initializing the configuration object
    grunt.initConfig({

        // get the configuration info from package.json ----------------------------
        // this way we can use things like name and version (pkg.name)
        pkg: grunt.file.readJSON('package.json'),

        clean: ['dist'],


        // Task configuration
        concat: {
            options: {
                separator: grunt.util.linefeed + ';' + grunt.util.linefeed,
                failOnMissing: true
            },
            libs: {
                nonull: true,
                src: [
                    './bower_components/d3/d3.min.js',
                    './bower_components/setimmediate/setImmediate.js',
                    './bower_components/shifty/dist/shifty.min.js',
                    './bower_components/draw2d/dist/patched_raphael.js',
                    './bower_components/jquery/jquery.min.js',
                    './bower_components/jquery-ui/jquery-ui.min.js',
                    './bower_components/jquery-lazyload-any/build/jquery.lazyload-any.min.js',
                    './bower_components/jsrender/jsrender.min.js',
                    './bower_components/shufflejs/dist/jquery.shuffle.modernizr.min.js',
                    './bower_components/bootstrap-slider/bootstrap-slider.js',
                    './bower_components/draw2d/dist/jquery.autoresize.js',
                    './bower_components/draw2d/dist/jquery-touch_punch.js',
                    './bower_components/draw2d/dist/jquery.contextmenu.js',
                    './bower_components/hogan.js/web/1.0.0/hogan.min.js', // deprecated. migrate code to handlebars
                    './bower_components/handlebars/handlebars.min.js',
                    './bower_components/draw2d/dist/rgbcolor.js',
                    './bower_components/draw2d/dist/patched_canvg.js',
                    './bower_components/draw2d/dist/patched_Class.js',
                    './bower_components/draw2d/dist/json2.js',
                    './bower_components/mousetrap/mousetrap.min.js',
                    './bower_components/draw2d/dist/pathfinding-browser.min.js',
                    './bower_components/bootstrap-growl/jquery.bootstrap-growl.js',
                    './bower_components/remarkable/dist/remarkable.min.js',
                    './bower_components/locstor/locstor.min.js',
                    './bower_components/draw2d/dist/draw2d.js'
                ],
                dest: './dist/assets/javascript/dependencies.js'
            },
            css: {
                src: [
                    './bower_components/bootstrap-slider/slider.css'
                ],
                dest: './dist/assets/css/depend.css'
            },
            application: {
                src: [
                    './src/assets/javascript/**/*.js'
                ],
                dest: './dist/assets/javascript/app.js'
            },
            widget: {
                src: [
                    './bower_components/shifty/dist/shifty.min.js',
                    './bower_components/draw2d/dist/patched_raphael.js',
                    './bower_components/jquery/jquery.min.js',
                    './bower_components/draw2d/dist/jquery.contextmenu.js',
                    './bower_components/draw2d/dist/rgbcolor.js',
                    './bower_components/draw2d/dist/patched_canvg.js',
                    './bower_components/draw2d/dist/patched_Class.js',
                    './bower_components/draw2d/dist/json2.js',
                    './bower_components/draw2d/dist/pathfinding-browser.min.js',
                    './bower_components/draw2d/dist/draw2d.js',
                    './src/assets/javascript/**/*.js'
                ],
                dest: './dist/assets/javascript/widget.js'
            }
        },

        copy: {
            socketIO: {
                expand: true,
                cwd: 'src/socket.io',
                src: ['*.js'],
                dest: 'dist/socket.io'
            },
            conf: {
                expand: true,
                cwd: 'src/assets/settings',
                src: ['*.js'],
                dest: 'dist/assets/settings'
            },
            circuit: {
                expand: true,
                cwd: 'src/assets/circuit',
                src: ['*.circuit'],
                dest: 'dist/assets/circuit'
            },
            img: {
                expand: true,
                cwd: 'src/assets/images',
                src: ['*.svg', '*.png', '*.ico'],
                dest: 'dist/assets/images'
            },
            ionicons:{
                expand: true,
                cwd: 'bower_components/Ionicons/',
                src: ['./css/*', "./fonts/*"],
                dest: './dist/lib/ionicons'
            },
            octicons:{
                expand: true,
                cwd: 'bower_components/octicons/build/',
                src: ["./font/*"],
                dest: './dist/lib/octicons'
            },
            application: {
                expand: true,
                cwd: 'src/',
                src: ['*.html'],
                dest: 'dist/'
            },
            bootstrap:{
                expand: true,
                cwd: 'bower_components/bootstrap/dist',
                src: ['**/*'],
                dest: 'dist/lib/bootstrap'
            },
            prettify:{
                expand: true,
                cwd: 'bower_components/google-code-prettify/',
                src: ['**/*'],
                dest: 'dist/lib/prettify'
            },
            help:{
                expand: true,
                cwd: 'src/assets/help/',
                src: ['*/_book/**/*'],
                dest: 'dist/assets/help/'
            },
            // copies the build result from the "dist" directory to the server subdirectory
            // for "npm publish"
            server:{
                expand: true,
                cwd: 'dist/',
                src: ['**/*'],
                dest: 'server/http/html'
            },
            shapes:{
                expand: true,
                cwd: 'bower_components/draw2d-shapes/dist/assets/shapes',
                src: ['*'],
                dest: 'server/http/shapes'
            }

        },

        less: {
            development: {
                options: {
                    compress: false
                },
                files: {
                    "./dist/assets/css/main.css": [
                        "./src/assets/less/widget.less",
                        "./src/assets/less/probe_window.less",
                        "./src/assets/less/shape.less",
                        "./src/assets/less/contextmenu.less",
                        "./src/assets/less/toolbar_editor.less",
                        "./src/assets/less/tabmenu.less",
                        "./src/assets/less/tabpane_home.less",
                        "./src/assets/less/tabpane_about.less",
                        "./src/assets/less/tabpane_files.less",
                        "./src/assets/less/tabpane_editor.less",
                        "./src/assets/less/tabpane_setting.less",
                        "./src/assets/less/layout.less",
                        "./src/assets/less/file_dialog.less",
                        "./src/assets/less/markdown_dialog.less",
                        "./src/assets/less/popconfirm_dialog.less",
                        "./src/assets/less/code_dialog.less",
                        "./src/assets/less/file_open_dialog.less",
                        "./src/assets/less/file_new_dialog.less",
                        "./src/assets/less/file_save_dialog.less",
                        "./src/assets/less/file_saveas_dialog.less"
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
            build: ['Grunfile.js', 'src/assets/javascript/**/*.js']
        },

        'string-replace': {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'dist/assets/help',
                    src: '**/*.html',
                    dest: 'dist/assets/help/'
                }],
                options: {
                    replacements: [{
                        pattern: /<a href="https:\/\/www.gitbook.com" [ :.\n\w="></\t\-äöü]*class="gitbook-link"[ :.\n\w="></\t\-äöü]*<\/a>/ig,
                        replacement: ''
                    }]
                }
            }
        },

        watch: {
            js: {
                files: [
                    './src/assets/javascript/**/*.js'
                ],
                tasks: ['default']
            },
            html: {
                files: [
                    './src/*.html'
                ],
                tasks: ['default']
            },

            less: {
                files: [
                    "./src/assets/less/**/*.less"
                ],
                tasks: ['default']
            }
        },
        'gh-pages': {
            options: {
                base: 'dist',
                user: {
                    name: 'Andreas Herz',
                    email: 'a.herz@freegroup.de'
                }
            },
            src: ['**']
        },
        run: {
            options: {
                // Task-specific options go here.
            },
            digital_basics: {
                cmd: 'gitbook',
                args: [
                    'build',
                    './src/assets/help/digital_basics'
                ]
            },
            platform: {
                cmd: 'gitbook',
                args: [
                    'build',
                    './src/assets/help/platform'
                ]
            }
        }

    });

    // Plugin loading
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-gh-pages');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-run');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Task definition
    grunt.registerTask('default', [
        'clean',
        'jshint',
        'concat',
        'less',
        'run:digital_basics','run:platform',
        'copy:socketIO', 'copy:conf','copy:circuit', 'copy:img','copy:ionicons','copy:octicons','copy:application','copy:bootstrap','copy:prettify','copy:help',
        'string-replace',
        'copy:server', "copy:shapes"
    ]);
    grunt.registerTask('publish', ['default','gh-pages']);
    grunt.registerTask('gitbook', ['run:digital_basics','run:platform']);
};

