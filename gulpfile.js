var gulp = require("gulp");
var $ = require("gulp-load-plugins")();
var autoprefixer = require("autoprefixer");
var browserify = require("browserify");
var pump = require("pump");
var mainBowerFiles = require("gulp-main-bower-files");
var buffer = require("vinyl-buffer");
var source = require("vinyl-source-stream");
var browserSync = require("browser-sync").create();
var minimist = require("minimist");

var envOptions = {
  string: "env",
  default: {
    env: "develop"
  }
};
var options = minimist(process.argv.slice(2), envOptions);

// Copy html files into build folder
gulp.task("copyHTML", function () {
  return gulp.src("src/**/*.html")
    .pipe(gulp.dest("build"));
});

// Clean .tmp and build folder
gulp.task("clean", function() {
  return gulp.src([".tmp", "build"], {read: false})
    .pipe($.clean());
});

// Bower files => .tmp folder
gulp.task("bower", function () {
  return gulp.src("bower.json")
    .pipe(mainBowerFiles({
      overrides: {
        bootstrap: {
          main: [
            "dist/js/*.js",
            "dist/css/*.*",
            "dist/fonts/*.*"
          ]
        },
        jquery: {
          main: [
            "dist/jquery.js",
            "dist/jquery.min.js"
          ]
        }
      }
    }))
    .pipe(gulp.dest(".tmp/vendors"));
});

// JADE => HTML
gulp.task("jade", function () {
  gulp.src("src/*.jade")
    .pipe($.plumber())
    .pipe($.jade({
      pretty: true
    }))
    .pipe(gulp.dest("build"))
    .pipe(browserSync.stream());
});

//  SASS => CSS
gulp.task("sass", function () {
  var plugins = [autoprefixer({
    browsers: ["last 2 version", "> 5%"]
  })];
  return gulp.src("src/scss/**/*.scss")
    .pipe($.rename("bundle.css"))
    .pipe($.sourcemaps.init({
      loadMaps: true
    }))
    .pipe($.plumber())
    .pipe($.sass().on("error", $.sass.logError))
    .pipe($.postcss(plugins))
    .pipe($.if(options.env === "production", $.minifyCss()))
    .pipe($.sourcemaps.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(browserSync.stream());
});

// Compress images
gulp.task("imagemin", function() {
  return gulp.src("src/img/*")
    .pipe($.if(options.env === "production", $.imagemin()))
    .pipe(gulp.dest("dist/img"));
});

// Tansfer js files from ES6 to ES5 with Babel
gulp.task("babel", function () {
  return gulp.src("src/js/**/*.js")
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      presets: ["env"],
      plugins: ["transform-runtime"]
    }))
    .pipe($.concat("bundle.js"))
    .pipe($.sourcemaps.write("."))
    .pipe(gulp.dest("build/js"));
});

// Browserify makes posible require("modules") in the browser
gulp.task("browserify", ["babel"], function () {
  var b = browserify({
    entries: "build/js/bundle.js",
    debug: true
  });
  return b.bundle()
    .pipe(source("bundle.js"))
    .pipe(buffer())
    .pipe($.sourcemaps.init({
      loadMaps: true
    }))
    .pipe($.sourcemaps.write("."))
    .pipe(gulp.dest("build/js"));
});

gulp.task("eslint", function () {
  gulp.src("src/js/**/*.js")
    .pipe($.cached("eslint"))
    .pipe($.eslint())
    .pipe($.eslint.format());
});

// Compress Javascripts files
gulp.task("compressJS", ["browserify"], function (cb) {
  pump([
    gulp.src("build/js/bundle.js"),
    $.uglify({
      compress: {
        drop_console: false
      }
    }),
    gulp.dest("build/js")
  ], cb);
});

// Compress vendor Javascripts files
gulp.task("vendorJS", function () {
  var srcFiles = [
    ".tmp/vendors/jquery/dist/jquery.js",
    ".tmp/vendors/bootstrap/dist/js/bootstrap.js"
  ];
  if (options.env === "production") {
    srcFiles = [
      ".tmp/vendors/jquery/dist/jquery.min.js",
      ".tmp/vendors/bootstrap/dist/js/bootstrap.min.js"
    ];
  }
  return gulp.src(srcFiles)
    .pipe($.concat("vendors.js"))
    .pipe($.if(options.env === "production", $.uglify({
      compress: {
        drop_console: false
      }
    })))
    .pipe(gulp.dest("build/js"));
});

// Compress vendor CSS file
gulp.task("vendorCSS", function () {
  return gulp.src(".tmp/vendors/**/*.css")
    .pipe($.concat("vendors.css"))
    .pipe($.if(options.env === "production", $.minifyCss()))
    .pipe(gulp.dest("build/css"));
});

// Start server for development
gulp.task("serve:dev", ["vendorJS", "vendorCSS", "browserify"], function () {
  console.log("当前环境：" + options.env);
  browserSync.init({
    server: {
      baseDir: "build"
    }
  });
  // Watch the files in the src folder.
  gulp.watch("src/**/*.html", ["copyHTML"]);
  gulp.watch("src/**/*.scss", ["sass"]);
  gulp.watch("src/**/*.jade", ["jade"]);
  gulp.watch("src/**/*.js", ["eslint", "browserify"]);
  // Reload the browser when the files changes in the build folder.
  gulp.watch("build/**/*.css").on("change", browserSync.reload);
  gulp.watch("build/**/*.js").on("change", browserSync.reload);
  gulp.watch("build/**/*.html").on("change", browserSync.reload);
});

// Start Serve for production
gulp.task("serve:dist", ["vendorJS", "vendorCSS", "compressJS"], function () {
  console.log("当前环境：" + options.env);
  browserSync.init({
    server: {
      baseDir: "build"
    }
  });
  // Watch the files in the src folder.
  gulp.watch("src/**/*.html", ["copyHTML"]);
  gulp.watch("src/**/*.scss", ["sass"]);
  gulp.watch("src/**/*.jade", ["jade"]);
  gulp.watch("src/**/*.js", ["eslint", "compressJS"]);
  // Reload the browser when the files changes in the build folder.
  gulp.watch("build/**/*.css").on("change", browserSync.reload);
  gulp.watch("build/**/*.js").on("change", browserSync.reload);
  gulp.watch("build/**/*.html").on("change", browserSync.reload);
});

// Initial files
gulp.task("default", $.sequence("clean", "copyHTML", "jade", "sass", "bower", "eslint", "imagemin"));