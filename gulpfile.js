const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
var del = require('del');

var gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    plugins = require('gulp-load-plugins')({
        pattern: ['gulp-*', 'gulp.*', 'merge-stream', 'run-sequence', 'jshint-stylish', 'htmlhint-stylish', 'yargs']
    }),
    path = require('path'),
    fs = require('fs'),
    paths = require('./config.json');
var reload = browserSync.reload;

function getFolders(dir) {
    return fs.readdirSync(dir)
        .filter(function (file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
}

/**
 *  Compiling Styles
 */
gulp.task('styles', function() {
    var cssStream,
        scssStream,
        cssPaths = [].concat(paths.vendor.css, paths.css);


    scssStream = gulp.src(paths.scss)
        .pipe(sass().on('error', sass.logError));

    return scssStream
        .pipe(plugins.concatCss('application.css'))
        .pipe(plugins.if(plugins.yargs.argv.production, cleanCSS({
            keepBreaks: false
        })))
        .pipe(plugins.if(plugins.yargs.argv.production, plugins.rename({
            suffix: ''
        })))
        .pipe(gulp.dest(paths.build + '/kycCore/css'))
        .pipe(browserSync.stream());
});

/**
 *  Compiling Scripts
 */
gulp.task('scripts', function(done) {
    gulp.src(paths.vendor.js)
        .pipe(plugins.concat('lib.js'))
        .pipe(plugins.if(plugins.yargs.argv.production, plugins.uglify()))
        .pipe(plugins.if(plugins.yargs.argv.production, plugins.rename({
            suffix: ''
        })))
        .pipe(gulp.dest(paths.build + '/kycCore/js'));

    var folders = getFolders('./');
    var config;
    folders.map(function(folder) {
        if (folder !== 'node_modules' && folder !== 'dossier' && folder !== '.git' && folder !== 'test-02-angular') {
            var file = './' + folder + '/config.json';
            if (fs.existsSync(file)) {
                config = require(file);
                for(var page in config) {
                    if (config.hasOwnProperty(page)) {
                        gulp.src([].concat(paths.js, config[page].js), { allowEmpty: true })
                            .pipe(plugins.sourcemaps.init())
                            .pipe(plugins.concat(folder + '-' + page + '.js'))
                            .pipe(plugins.sourcemaps.write())
                            .pipe(plugins.if(plugins.yargs.argv.production, plugins.uglify()))
                            .pipe(plugins.if(plugins.yargs.argv.production, plugins.rename({
                                suffix: ''
                            })))
                            .pipe(gulp.dest(paths.build + '/' + folder + '/js'));
                    }
                }
            }
        }
    });

    gulp.src(paths.js, { allowEmpty: true })
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat('kyc-core.js'))
        .pipe(plugins.sourcemaps.write())
        .pipe(plugins.if(plugins.yargs.argv.production, plugins.uglify()))
        .pipe(plugins.if(plugins.yargs.argv.production, plugins.rename({
            suffix: ''
        })))
        .pipe(gulp.dest(paths.build + '/kycCore/js'));
    done()
});

/**
 *  Copy Fonts
 */
gulp.task('fonts', function() {
    return gulp.src(paths.fonts,  { encoding: false })
        .pipe(gulp.dest(paths.build + '/kycCore'));
});

/**
 *  Copy Images
 */
gulp.task('images', function() {
    return gulp.src(paths.images, { encoding: false })
        .pipe(gulp.dest(paths.build + '/kycCore'));
});

/**
 *  Copy Html Files
 */
gulp.task('html', function() {
    return gulp.src(paths.html)
        .pipe(gulp.dest(paths.build + '/kycCore'));
});

/**
 *  Clean Up
 */
gulp.task('clean', function() {
    return del([paths.build + '/**/*']);
});

/**
 *  Lint the css and report
 */
gulp.task('csslint', function() {
    gulp.src(paths.css)
        .pipe(plugins.csslint(paths.csslint))
        .pipe(plugins.csslint.formatter(plugins.csslintStylish));
});

/**
 *  Hint the javascript and report
 */
gulp.task('jshint', function() {
    gulp.src(paths.js, { allowEmpty: true })
        .pipe(plugins.jshint(paths.jshint))
        .pipe(plugins.jshint.reporter(plugins.jshintStylish, {
            verbose: true
        }));
});

/**
 *  Hint the html and report
 */
gulp.task('htmlhint', function() {
    gulp.src(paths.html)
        .pipe(plugins.htmlhint(paths.htmlhint))
        .pipe(plugins.htmlhint.reporter(plugins.htmlhintStylish));
});

/**
 *  Optimize the css
 */
gulp.task('min-css', function() {
    plugins.runSequence('styles', function() {
        gulp.src(paths.build + '/css/application.css')
            .pipe(cleanCSS({
                keepBreaks: false
            }))
            .pipe(plugins.rename({
                suffix: ''
            }))
            .pipe(gulp.dest(paths.build + '/css'));
    });
});

/**
 *  Optimize the javascript
 */
gulp.task('min-js', function() {
    plugins.runSequence('scripts', function() {
        gulp.src(paths.build + '/js/application.js')
            .pipe(plugins.uglify())
            .pipe(plugins.rename({
                suffix: ''
            }))
            .pipe(gulp.dest(paths.build + '/js'));
    });
});

/**
 *  Build the javascript, hint the code when it changes
 */
gulp.task('watch', function (done) {
    var cssPaths = [].concat(paths.scss, './kycCore/src/assets/styles/scss/**/*.scss');
    cssPaths = cssPaths.concat(paths.vendor.css, paths.css);

    if (plugins.yargs.argv.hint) {
        gulp.watch(cssPaths, gulp.series('styles', 'csslint'));
        gulp.watch(paths.js, gulp.series('scripts', 'jshint')).on('change', reload);
        gulp.watch(paths.images, gulp.series('images')).on('change', reload);
        gulp.watch(paths.html, gulp.series('html', 'htmlhint')).on('change', reload);
        gulp.watch(paths.vendor.js, gulp.series('scripts', 'jshint')).on('change', reload);
        gulp.watch(paths.watchedJs, gulp.series('scripts', 'jshint')).on('change', reload);
    } else {
        gulp.watch(cssPaths, gulp.series('styles'));
        gulp.watch(paths.js, gulp.series('scripts')).on('change', reload);
        gulp.watch(paths.images, gulp.series('images')).on('change', reload);
        gulp.watch(paths.html, gulp.series('html')).on('change', reload);
        gulp.watch(paths.vendor.js, gulp.series('scripts')).on('change', reload);
        gulp.watch(paths.watchedJs, gulp.series('scripts')).on('change', reload);
    }
    done();
});

/**
 *  Build the javascript
 */
gulp.task('build', gulp.series('clean', 'styles', 'fonts', 'html', 'images', 'scripts', function(done) {
    done()
}));

/**
 *  Development mode
 */
gulp.task('startBrowserSync', function (done) {
    browserSync.init({
        proxy: paths.url,
        notify: true,
        open: false,
        port: paths.port,
        ui: {
            port: paths.port
        }
    });
    done()
})

gulp.task('serve', gulp.series('watch', 'startBrowserSync'), function (done) {
    done();
});

