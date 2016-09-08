var gulp             = require('gulp'),
    gutil            = require('gulp-util'),
    clean            = require('gulp-clean'),
    concat           = require('gulp-concat'),
    count            = require('gulp-count'),
    multiprocess     = require('gulp-multi-process'),
    rename           = require('gulp-rename'),
    runsequence      = require('run-sequence'),
    sourcemaps       = require('gulp-sourcemaps'),
    todo             = require('gulp-todo'),
    cp               = require('child_process'),
    run              = require('gulp-run'),
    path             = require('path');

/* CSS */

var csslint          = require('gulp-csslint'),
    cleancss         = require('gulp-clean-css'),
    beautify         = require('gulp-cssbeautify'),
    csscomb          = require('gulp-csscomb'),
    uncss            = require('gulp-uncss'),
    autoprefixer     = require('gulp-autoprefixer');

/* SCSS */

var sass             = require('gulp-ruby-sass'),
    scsslint         = require('gulp-scss-lint');

/* JS */

var uglify           = require('gulp-uglifyjs'),
    jshint           = require('gulp-jshint'),
    jslint           = require('gulp-jslint'),
    babel            = require('gulp-babel');;

/* Images */

var imagemin         = require('gulp-imagemin');

/* Tasks */

gulp.task('default', function () {
    gutil.log("Gulp is working fine");
    return gulp.src("./*.js")
        .pipe(jslint())
        .pipe(jshint.reporter('default'));
});

gulp.task('dev', function(cb) {
    gutil.log("Running Development Enviroment");
    return multiprocess(['frontend:server', 'backend:server'], cb);
});

gulp.task('rebundle', function(cb) {
    return multiprocess(['npm-install', 'bower-install', 'bundle-install'], cb);
});

gulp.task('npm-install', function (done) {
  return run('npm install').exec();
});

gulp.task('bower-install', function (done) {
  return run('bower install').exec();
});

gulp.task('bundle-install', function (done) {
  return run('cd messages-service/ && bundle install').exec();
});

gulp.task('frontend:server', function (done) {
  return run('npm run server').exec();
});

gulp.task('backend:server', function (done) {
  return run('npm run rails').exec();
});

gulp.task('todo', function () {
    gutil.log("Running TODO task");
    gulp.src("./assets/js/**/*.js")
        .pipe(todo())
        .pipe(gulp.dest('./assets/md'));
});

gulp.task('build', function (callback) {
    gutil.log("Running BUILD task");
    return runsequence('lint:all', ['default', 'todo', 'build:all'], callback);
});

gulp.task('build:prod', function (callback) {
    gutil.log("Running BUILD task for production");
    return runsequence('default', ['build:all'], callback);
});

// All

gulp.task('lint:all', function (cb) {
    gutil.log("Linting all");
    return multiprocess(['lint:scss', 'lint:js', 'lint:css', 'todo'], cb);
});

gulp.task('build:all', function (callback) {
    gutil.log("Building all assets");
    return runsequence('scss', ['css', 'js', 'img'], callback);
});

gulp.task('watch:multi', function (cb) {
    gutil.log("Watching all assets multi threaded");
    return multiprocess(['watch:scss', 'watch:css', 'watch:js', 'watch:img'], cb);
});

gulp.task('watch:all', function () {
    gutil.log("Watching ALL modifications");
    gulp.watch([
               './assets/**/*.js',
               './assets/**/*.scss',
               './assets/**/*.jpeg',
               './assets/**/*.jpg',
               './assets/**/*.png',
               './assets/**/*.svg',
               './app/**/*.js',
               './*.js',
               './*.json',
               ], ['default', 'todo', 'build:all']);
});

// JavaScript

gulp.task('js', function (callback) {
    gutil.log("Running JS task");
    return runsequence('lint:js', ['concat:js'], callback);
});

gulp.task('watch:js', function () {
    gutil.log("Watching JS modifications");
    gulp.watch('./assets/js/**/*.js', ['concat:js']);
});

gulp.task('lint:js', function () {
    gutil.log("Linting JavaScript");
    return gulp.src("./assets/js/**/*.js")
        .pipe(count('## js-files selected'))
        .pipe(jslint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('concat:js', function (callback) {
    gutil.log("Concatenating JS files");
    return runsequence(['concat:normal:js', 'concat:min:js'], callback);
});

gulp.task('concat:normal:js', function () {
    gutil.log("Concatenating to non-minified js");
    return gulp.src("./assets/js/**/*.js")
        .pipe(count('## js-files selected'))
        .pipe(babel({
          presets: ['es2015']
        }))
        .pipe(concat('custom.js'))
        .pipe(gulp.dest('./lib/custom/'));
});

gulp.task('concat:min:js', function () {
    gutil.log("Concatenating to minified js");
    return gulp.src("./assets/js/**/*.js")
        .pipe(count('## js-files selected'))
        .pipe(babel({
          presets: ['es2015']
        }))
        .pipe(concat('custom.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./lib/custom/'));
});

// CSS

gulp.task('css', function (callback) {
    gutil.log("Running CSS task");
    return runsequence('lint:css', ['beautify:css', 'minify:css'], callback);
});

gulp.task('watch:css', function () {
    gutil.log("Watching CSS modifications");
    gulp.watch('lib/custom/custom.css', ['css']);
});

gulp.task('lint:css', function () {
    gutil.log("Linting CSS");
    gulp.src("./lib/custom/custom.css")
        .pipe(csslint());
});

gulp.task('beautify:css', function () {
    gutil.log("Beautifying CSS");
    return gulp.src('./lib/custom/custom.css')
        .pipe(beautify({
            indent: '  ',
            openbrace: 'separate-line',
            autosemicolon: true
        }))
        .pipe(autoprefixer())
        .pipe(csscomb())
        .pipe(gulp.dest('assets/css/'));
});

gulp.task('minify:css', function () {
    gutil.log("Minifing CSS");
    return gulp.src("./lib/custom/custom.css")
        .pipe(cleancss({
            compatibility: 'ie8',
            debug: true
        }, function (details) {
            gutil.log(details.name + ': ' + details.stats.originalSize);
            gutil.log(details.name + ': ' + details.stats.minifiedSize);
        }))
        .pipe(sourcemaps.write())
        .pipe(rename('custom.min.css'))
        .pipe(gulp.dest("./lib/custom/"));
});

// Sass

gulp.task('scss', function (callback) {
    gutil.log("Running SCSS task");
    return runsequence('lint:scss', ['compile:custom:scss'], callback);
});

gulp.task('watch:scss', function () {
    gutil.log("Watching SCSS modifications");
    gulp.watch('assets/scss/**/*.scss', ['scss']);
});

gulp.task('lint:scss', function () {
    gutil.log("Linting SCSS");
    return gulp.src('assets/scss/**/*.scss')
        .pipe(count('## scss-files selected'))
        .pipe(scsslint());
});

gulp.task('compile:scss', function () {
    gutil.log("Compiling normal SCSS files");
    return sass('./assets/scss/**/*.scss')
        .on('error', sass.logError)
        .pipe(count('## scss-files selected'))
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('assets/css/'));
});

gulp.task('compile:custom:scss', function () {
    gutil.log("Compiling custom SCSS file");
    return sass('./assets/scss/style.scss')
        .on('error', sass.logError)
        .pipe(count('## scss-files selected'))
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(rename('custom.css'))
        .pipe(gulp.dest('lib/custom/'));
});

// IMG

gulp.task('img', function (callback) {
    gutil.log("Running IMG task");
    return runsequence('minify:img');
});

gulp.task('watch:img', function () {
    gutil.log("Watching IMG modifications");
    gulp.watch('assets/img/**/', ['img']);
});

gulp.task('minify:img', function () {
    gutil.log("Minifying IMG");
    return gulp.src('./assets/img/**/')
        .pipe(count('## img-files selected'))
        .pipe(imagemin({
            optimizationLevel: 9
        }))
        .pipe(gulp.dest('lib/custom/img/'));
});