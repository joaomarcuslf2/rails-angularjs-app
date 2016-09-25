'use strict';

import gulp from 'gulp';
import gutil from 'gulp-util';
import clean from 'gulp-clean';
import concat from 'gulp-concat';
import count from 'gulp-count';
import multiprocess from 'gulp-multi-process';
import rename from 'gulp-rename';
import runsequence from 'run-sequence';
import sourcemaps from 'gulp-sourcemaps';
import todo from 'gulp-todo';
import cp from 'child_process';
import run from 'gulp-run';
import path from 'path';
import ngAnnotate from 'gulp-ng-annotate';

/* CSS */

import csslint from 'gulp-csslint';
import cleancss from 'gulp-clean-css';
import beautify from 'gulp-cssbeautify';
import csscomb from 'gulp-csscomb';
import uncss from 'gulp-uncss';
import autoprefixer from 'gulp-autoprefixer';

/* SCSS */

import sass from 'gulp-ruby-sass';
import scsslint from 'gulp-scss-lint';

/* JS */

import uglify from 'gulp-uglifyjs';
import jshint from 'gulp-jshint';
import jslint from 'gulp-jslint';
import babel from 'gulp-babel';

/* Images */

import imagemin from 'gulp-imagemin';

/* Tasks */

gulp.task('default', () => {
    gutil.log("Gulp is working fine");
    return gulp.src("./*.js")
        .pipe(jslint())
        .pipe(jshint.reporter('default'));
});

gulp.task('dev', (cb) => {
    gutil.log("Running Development Enviroment");
    return multiprocess(['frontend:server', 'backend:server'], cb);
});

gulp.task('rebundle', (cb) => {
    return multiprocess(['npm-install', 'bower-install', 'bundle-install'], cb);
});

gulp.task('npm-install', (done) => {
    return run('npm install').exec();
});

gulp.task('bower-install', (done) => {
    return run('bower install').exec();
});

gulp.task('bundle-install', (done) => {
    return run('cd messages-service/ && bundle install').exec();
});

gulp.task('frontend:server', (done) => {
    gutil.log("Running Frontend:server at:");
    gutil.log("http://localhost:8000/");
    return run('npm run server').exec();
});

gulp.task('backend:server', (done) => {
    gutil.log("Running Backend:server at:");
    gutil.log("http://localhost:3000/");
    return run('npm run rails').exec();
});

gulp.task('todo', () => {
    gutil.log("Running TODO task");
    gulp.src("./assets/js/**/*.js")
        .pipe(todo())
        .pipe(gulp.dest('./assets/md'));
});

gulp.task('build', (callback) => {
    gutil.log("Running BUILD task");
    return runsequence('lint:all', ['default', 'todo', 'build:all'], callback);
});

gulp.task('build:prod', (callback) => {
    gutil.log("Running BUILD task for production");
    return runsequence('default', ['build:all'], callback);
});

// All

gulp.task('lint:all', (cb) => {
    gutil.log("Linting all");
    return multiprocess(['lint:scss', 'lint:js', 'lint:css', 'todo'], cb);
});

gulp.task('build:all', (callback) => {
    gutil.log("Building all assets");
    return runsequence('scss', ['css', 'js', 'img'], callback);
});

gulp.task('watch:multi', (cb) => {
    gutil.log("Watching all assets multi threaded");
    return multiprocess(['watch:scss', 'watch:css', 'watch:js', 'watch:img'], cb);
});

gulp.task('watch:all', () => {
    gutil.log("Watching ALL modifications");
    gulp.watch([
        './assets/**/*.babel.js',
        './assets/**/*.scss',
        './assets/**/*.jpeg',
        './assets/**/*.jpg',
        './assets/**/*.png',
        './assets/**/*.svg',
        './app/**/*.babel.js',
        './*.babel.js',
        './*.json',
    ], ['default', 'todo', 'build:all']);
});

// JavaScript

gulp.task('js', (callback) => {
    gutil.log("Running JS task");
    return runsequence('lint:js', ['concat:js'], callback);
});

gulp.task('watch:js', () => {
    gutil.log("Watching JS modifications");
    gulp.watch([
                './assets/js/**/*.babel.js',
                './app/**/*.babel.js',
               ], ['concat:js']);
});

gulp.task('lint:js', () => {
    gutil.log("Linting JavaScript");
    return gulp.src("./assets/js/**/*.babel.js")
        .pipe(count('## js-files selected'))
        .pipe(jslint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('concat:js', (callback) => {
    gutil.log("Concatenating JS files");
    return runsequence(['concat:normal:js', 'concat:min:js', 'concat:app'], callback);
});

gulp.task('concat:normal:js', () => {
    gutil.log("Concatenating to non-minified js");
    return gulp.src("./assets/js/**/*.babel.js")
        .pipe(count('## js-files selected'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('custom.js'))
        .pipe(gulp.dest('./lib/custom/'));
});

gulp.task('concat:min:js', () => {
    gutil.log("Concatenating to minified js");
    return gulp.src("./assets/js/**/*.babel.js")
        .pipe(count('## js-files selected'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('custom.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./lib/custom/'));
});

gulp.task('concat:app', () => {
    gutil.log("Concatenating to minified js");
    return gulp.src("./app/**/*.babel.js")
        .pipe(count('## js-files selected'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(ngAnnotate())
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./lib/custom/'));
});

// CSS

gulp.task('css', (callback) => {
    gutil.log("Running CSS task");
    return runsequence('lint:css', ['beautify:css', 'minify:css'], callback);
});

gulp.task('watch:css', () => {
    gutil.log("Watching CSS modifications");
    gulp.watch('lib/custom/custom.css', ['css']);
});

gulp.task('lint:css', () => {
    gutil.log("Linting CSS");
    gulp.src("./lib/custom/custom.css")
        .pipe(csslint());
});

gulp.task('beautify:css', () => {
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

gulp.task('minify:css', () => {
    gutil.log("Minifing CSS");
    return gulp.src("./lib/custom/custom.css")
        .pipe(cleancss({
            compatibility: 'ie8',
            debug: true
        }, (details) => {
            gutil.log(details.name + ': ' + details.stats.originalSize);
            gutil.log(details.name + ': ' + details.stats.minifiedSize);
        }))
        .pipe(sourcemaps.write())
        .pipe(rename('custom.min.css'))
        .pipe(gulp.dest("./lib/custom/"));
});

// Sass

gulp.task('scss', (callback) => {
    gutil.log("Running SCSS task");
    return runsequence('lint:scss', ['compile:custom:scss'], callback);
});

gulp.task('watch:scss', () => {
    gutil.log("Watching SCSS modifications");
    gulp.watch('assets/scss/**/*.scss', ['scss']);
});

gulp.task('lint:scss', () => {
    gutil.log("Linting SCSS");
    return gulp.src('assets/scss/**/*.scss')
        .pipe(count('## scss-files selected'))
        .pipe(scsslint());
});

gulp.task('compile:scss', () => {
    gutil.log("Compiling normal SCSS files");
    return sass('./assets/scss/**/*.scss')
        .on('error', sass.logError)
        .pipe(count('## scss-files selected'))
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
            cascade: true
        }))
        .pipe(gulp.dest('assets/css/'));
});

gulp.task('compile:custom:scss', () => {
    gutil.log("Compiling custom SCSS file");
    return sass('./assets/scss/style.scss')
        .on('error', sass.logError)
        .pipe(count('## scss-files selected'))
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
            cascade: true
        }))
        .pipe(rename('custom.css'))
        .pipe(gulp.dest('lib/custom/'));
});

// IMG

gulp.task('img', (callback) => {
    gutil.log("Running IMG task");
    return runsequence('minify:img');
});

gulp.task('watch:img', () => {
    gutil.log("Watching IMG modifications");
    gulp.watch('assets/img/**/', ['img']);
});

gulp.task('minify:img', () => {
    gutil.log("Minifying IMG");
    return gulp.src('./assets/img/**/')
        .pipe(count('## img-files selected'))
        .pipe(imagemin({
            optimizationLevel: 9
        }))
        .pipe(gulp.dest('lib/custom/img/'));
});