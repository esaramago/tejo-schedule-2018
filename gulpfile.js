
// Dependencies =================================================
const { series, src, dest } = require('gulp');
const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const sassGlob = require('gulp-sass-glob');
const cssmin = require('gulp-cssmin');
const nunjucksRender = require('gulp-nunjucks-render');
const data = require('gulp-data');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const htmlmin = require('gulp-htmlmin');

const browserify = require('browserify');
const envify = require('envify/custom');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');


// Settings ====================================================
const srcPath = './src';
const htmlPath = srcPath + '/html';
const stylesPath = srcPath + '/scss';
const scriptsPath = srcPath + '/js';
const imagesPath = srcPath + '/img';

const destPath = 'app';

const isProd = process.env.Node_ENV === 'production';

if (isProd) {
    console.log('Running in production mode.')
}
else if (process.env.NODE_ENV === "development") {
    console.warn('Running in DEVELOPMENT mode.')
}

// Tasks =======================================================

// delete dist files and folders
function cleanDist() {
    return gulp.src(destPath + '/*', { read: false })
        .pipe(clean());
}
gulp.task('cleanDist', cleanDist);


function html() {

    return src(htmlPath + '/*.njk')
        .pipe(plumber())
        .pipe(data(function() {
            return require(srcPath + '/data/data.json')
        }))
        .pipe(nunjucksRender({
            path: srcPath
        }))
        .pipe(rename(path => path.extname = ".html"))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: isProd
        }))
        .pipe(gulp.dest(destPath));
}
gulp.task('html', html);


function styles() {

    return src(stylesPath + '/*.scss')

        .pipe(plumber())

        .pipe(sourcemaps.init())

        .pipe(sassGlob())
        .pipe(sass().on('error', sass.logError))

        .pipe(cssmin())

        .pipe(sourcemaps.write(''))

        .pipe(dest(destPath + '/css'));
}
gulp.task('styles', styles);


function scripts() {
    return browserify(scriptsPath + '/main.js')
        .transform(
            babelify,
            { presets: ['@babel/env'] }, // configured also in package.json
        )
        .transform(
            { global: true },
            envify({ NODE_ENV: process.env.NODE_ENV })
        )
        .bundle()
        .pipe(source('main.js'))
        .pipe(buffer())

        // minify
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify({
            compress: { drop_debugger: isProd }
        }))
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest(destPath));
}
gulp.task('scripts', scripts);


function images() {
    return src(imagesPath + '/*')
        .pipe(plumber())
        .pipe(dest(destPath + '/img'));
}
gulp.task('images', images);


function root() {
    // copy root files
    return src(srcPath + '/*.{js,json}')
        .pipe(plumber())
        .pipe(dest(destPath));
}
gulp.task('root', root);


// Development (gulp watch) ======================================================
function watch() {
    gulp.watch(htmlPath + '/**/*.njk', gulp.series('html'));
    gulp.watch(stylesPath + '/**/*.scss', gulp.series('styles'));
    gulp.watch(scriptsPath + '/**/*.js', gulp.series('scripts'));
    gulp.watch(imagesPath + '/*', gulp.series('images'));
}
gulp.task('watch', watch);


// Production (gulp build) ======================================================
exports.build = series(
    'cleanDist',
    'html',
    'styles',
    'scripts',
    'images',
    'root'
);



exports.default = watch;