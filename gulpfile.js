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
var buildDir = "./dist/";
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

gulp.task("server", function() {
  // todo: hopefully someday we'll be able to compile this and bundle it
  gulp.src(serverJs).pipe(gulp.dest(buildDir));
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

gulp.task("build", ["clean", "server"]);

gulp.task("watch-server", ["server"], function() {
  gulp.watch(serverJs, ["server"]);
});

gulp.task("default", ["build"]);
