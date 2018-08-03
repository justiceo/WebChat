var gulp = require("gulp");
var notify = require("gulp-notify");
var source = require("vinyl-source-stream");
var browserify = require("browserify");
var babelify = require("babelify");
var ngAnnotate = require("browserify-ngannotate");
var browserSync = require("browser-sync").create();
var sass = require("gulp-sass");
var rename = require("gulp-rename");
var minifyCSS = require("gulp-minify-css");
var templateCache = require("gulp-angular-templatecache");
var del = require("del");
var gutil = require("gulp-util");
var karmaServer = require("karma").Server;
var zip = require("gulp-zip");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");

// Where our files are located
var sassFiles = "src/style/*.scss";
var jsFiles = "src/**/*.js";
var viewFiles = "src/**/*.html";
var assets = "src/assets/**/*";
var buildDir = "./build/";
var serverJs = "src/server/**/*";

var interceptErrors = function(error) {
  var args = Array.prototype.slice.call(arguments);

  // Send error to notification center with gulp-notify
  notify
    .onError({
      title: "Compile Error",
      message: "<%= error.message %>"
    })
    .apply(this, args);
  gutil.log(error.toString());
  // Keep gulp from hanging on this task
  this.emit("end");
};

gulp.task("browserify", function() {
  return (browserify("./src/app/index.js")
      .transform(babelify, { presets: ["es2015"] })
      .transform(ngAnnotate)
      .bundle()
      .on("error", interceptErrors)
      //Pass desired output filename to vinyl-source-stream
      .pipe(source("main.js"))
      // Start piping stream to tasks!
      .pipe(gulp.dest(buildDir)) );
});

gulp.task("server", function() {
  // todo: hopefully someday we'll be able to compile this and bundle it
  gulp.src(serverJs).pipe(gulp.dest(buildDir));
});

gulp.task("sass", function() {
  return gulp
    .src(sassFiles)
    .pipe(sass())
    .on("error", interceptErrors)
    .pipe(postcss([autoprefixer()]))
    .pipe(minifyCSS())
    .pipe(gulp.dest(buildDir));
});

gulp.task("html", function() {
  return gulp
    .src("src/index.html")
    .on("error", interceptErrors)
    .pipe(gulp.dest(buildDir));
});

gulp.task("views", function() {
  return gulp
    .src(viewFiles)
    .pipe(
      templateCache({
        standalone: true
      })
    )
    .on("error", interceptErrors)
    .pipe(rename("app.templates.js"))
    .pipe(gulp.dest("./src/app/"));
  // todo: core doesn't need to know about all the templates from other modules - refactor!
});

// Copy over everything in assets directory
gulp.task("assets", function() {
  gulp.src(".env").pipe(gulp.dest(buildDir));
  gulp.src(assets).pipe(gulp.dest(buildDir));
});

// clean build folder
gulp.task("clean", function() {
  del.sync([buildDir], { force: true });
});

// Run test once and exit, commentout singleRun for watching and retesting
gulp.task("test", ["build"], function(done) {
  new karmaServer(
    {
      configFile: __dirname + "/karma.conf.js",
      singleRun: true
    },
    done
  ).start();
});

gulp.task("build", [
  "clean",
  "sass",
  "assets",
  "html",
  "views",
  "browserify",
  "server"
]);

gulp.task("watch-server", ["server"], function() {
  gulp.watch(serverJs, ["server"]);
});

gulp.task("default", ["build"], function() {
  gulp.start(["browserify"]);

  browserSync.init([buildDir + "**/**.**"], {
    server: buildDir,
    port: 3000,
    ui: {
      port: 3001
    }
  });

  gulp.watch(sassFiles, ["sass"]);
  gulp.watch("src/index.html", ["html"]);
  gulp.watch(viewFiles, ["views"]);
  gulp.watch(jsFiles, ["browserify"]);
  gulp.watch(assets, ["assets"]);
  gulp.watch(serverJs, ["server"]);
});
