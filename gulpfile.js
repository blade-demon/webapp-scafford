var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var autoprefixer = require('autoprefixer');
var browserify = require('browserify');
var pump = require('pump');
var mainBowerFiles = require('gulp-main-bower-files');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var browserSync = require('browser-sync').create();

gulp.task('copyHTML', function () {
  return gulp.src('source/**/*.html')
    .pipe(gulp.dest('dist'));
});

// JADE => HTML
gulp.task('jade', function () {
  gulp.src('./source/*.jade')
    .pipe($.plumber())
    .pipe($.jade({ pretty: true }))
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.stream());
});

//  SASS => CSS
gulp.task('sass', function () {
  var plugins = [autoprefixer({
    browsers: ['last 2 version', '> 5%']
  })];
  return gulp.src('./source/scss/**/*.scss')
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe($.plumber())
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.postcss(plugins))
    .pipe($.minifyCss())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.stream());
});

// Tansfer js files from ES6 to ES5 with Babel
gulp.task('babel', function () {
  return gulp.src('./source/js/**/*.js')
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      presets: ['es2015'],
      plugins: ['transform-runtime']
    }))
    .pipe($.concat('index.js'))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'));
});

// Browserify makes posible require('modules') in the browser
// Rename index.js to bundle.js
gulp.task('browserify', ['babel'], function () {
  var bundleStream = browserify({ entries: "dist/js/index.js" }).bundle();
  bundleStream
    .pipe(source("index.js"))
    // .pipe($.rename("bundle.js"))
    .pipe(buffer())
    .pipe($.sourcemaps.init({ loadMaps: true }))
    /**
     * Add transformation tasks to the pipeline here.
     * TODO:
     */
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest("dist/js"))
    .on('error', $.util.log);
});

// Compress js files
gulp.task('compressJS', ['browserify'], function () {
  pump([
    gulp.src('dist/bundle.js'),
    $.uglify(),
    gulp.dest('dist/js/').pipe(browserSync.stream())
  ]);
});

gulp.task('bower', function () {
  return gulp.src('./bower.json')
    .pipe(mainBowerFiles())
    .pipe(gulp.dest('./.tmp/vendors'))
});

gulp.task('vendorJS', ['bower'], function () {
  return gulp.src('./.tmp/vendors/**/**.js')
    .pipe($.concat('vendors.js'))
    .pipe($.uglify({
      compress: {
        drop_console: false
      }
    }))
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('serve:dev', function () {
  browserSync.init({ server: { baseDir: "dist" } });
  // Watch the files in the source folder.
  gulp.watch('source/**/*.html', ['copyHTML']);
  gulp.watch('source/**/*.scss', ['sass']);
  gulp.watch('source/**/*.jade', ['jade']);
  gulp.watch('source/**/*.js', ['compressJS']);
  // Reload the browser when the files changes in the dist folder.
  gulp.watch('dist/**/*.css').on('change', browserSync.reload);
  gulp.watch('dist/**/*.js').on('change', browserSync.reload);
  gulp.watch('dist/**/*.html').on('change', browserSync.reload);
});

gulp.task('watch', function () {
  gulp.watch('source/**/*.scss', ['sass']);
  gulp.watch('source/**/*.jade', ['jade']);
  gulp.watch('source/**/*.js', ['compressJS']);
});

gulp.task('default', ['bower', 'jade', 'sass', 'browserify', 'vendorJS']);