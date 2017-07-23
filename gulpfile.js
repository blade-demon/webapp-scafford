var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var autoprefixer = require('autoprefixer');
var browserify = require('browserify');
var pump = require('pump');
var mainBowerFiles = require('gulp-main-bower-files');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var browserSync = require('browser-sync').create();

// Copy html files into dist folder
gulp.task('copyHTML', function () {
  return gulp.src('source/**/*.html')
    .pipe(gulp.dest('dist'));
});

// Bower files => .tmp folder
gulp.task('bower', function () {
  return gulp.src('bower.json')
    .pipe(mainBowerFiles({
      overrides: {
        bootstrap: {
          main: [
            'dist/js/bootstrap.js',
            'dist/css/*.*',
            'dist/fonts/*.*'
          ]
        },
        jquery: {
          main: [
            'dist/jquery.min.js'
          ]
        }
      }
    }))
    .pipe(gulp.dest('.tmp/vendors'))
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
    .pipe($.rename('bundle.css'))
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe($.plumber())
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.postcss(plugins))
    .pipe($.minifyCss())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream());
});

// Tansfer js files from ES6 to ES5 with Babel
gulp.task('babel', function () {
  return gulp.src('source/js/**/*.js')
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      presets: ['env'],
      plugins: ['transform-runtime']
    }))
    .pipe($.concat('bundle.js'))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'));
});

// Browserify makes posible require('modules') in the browser
gulp.task('browserify', ['babel'], function () {
  var b = browserify({ entries: "dist/js/bundle.js", debug: true });
  return b.bundle()
    .pipe(source("bundle.js"))
    .pipe(buffer())
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe($.sourcemaps.write("."))
    .pipe(gulp.dest("dist/js"));
});

// Compress Javascripts files
gulp.task('compressJS', ['browserify'], function (cb) {
  pump([
    gulp.src('dist/js/bundle.js'),
    $.uglify({ compress: { drop_console: false } }),
    gulp.dest('dist/js')
  ], cb);
});

// Compress vendor Javascripts files
gulp.task('vendorJS', function () {
  return gulp.src([
      ".tmp/vendors/jquery/dist/jquery.min.js",
      ".tmp/vendors/bootstrap/dist/js/bootstrap.js"
    ])
    .pipe($.concat('vendors.js'))
    .pipe($.uglify({ compress: { drop_console: false } }))
    .pipe(gulp.dest('dist/js'));
});

// Compress vendor CSS file
gulp.task('vendorCSS', function () {
  return gulp.src('.tmp/vendors/**/*.css')
    .pipe($.concat('vendors.css'))
    .pipe(gulp.dest('dist/css'));
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

// Initial files
gulp.task('default', ['copyHTML', 'jade', 'sass', 'bower', 'compressJS', 'vendorJS', 'vendorCSS']);