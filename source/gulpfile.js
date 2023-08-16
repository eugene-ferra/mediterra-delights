const { src, dest, watch, parallel } = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const babel = require('gulp-babel');
const webpack = require('webpack-stream');
const webp = require('gulp-webp');

function browsersync() {
  browserSync.init({
    server: {
      baseDir: '../public',
    },
  });
}

function images() {
  return src('app/images/**/*')
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 80, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ]),
    )
    .pipe(dest('../public/images'))
    .pipe(src('app/images/**/*'))
    .pipe(webp())
    .pipe(dest('../public/images'));
}

function scripts() {
  const mode = process.argv[4]
    ? process.argv[4].replace(/--mode=/)
    : 'development';
  return src(['app/js/main.js'])
    .pipe(
      webpack({
        mode,
      }),
    )
    .pipe(concat('main.min.js'))
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      }),
    )
    .pipe(uglify())
    .pipe(dest('../public/js'))
    .pipe(browserSync.stream());
}

function styles() {
  return src('app/scss/style.scss')
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(concat('style.min.css'))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 30 version'],
        grid: true,
      }),
    )
    .pipe(dest('../public/css'))
    .pipe(browserSync.stream());
}

function html() {
  return src('app/*.html').pipe(dest('../public'));
}

function watching() {
  watch(['app/*.html'], html);
  watch(['app/images/**/*'], images);
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;

exports.start = parallel(html, styles, scripts, browsersync, watching);
