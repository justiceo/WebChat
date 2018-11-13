var gulp = require("gulp");
var ts = require("gulp-typescript");

var tsProject = ts.createProject("tsconfig.json", { declaration: true });
var source = ["src/common/*.ts", "src/server/*.ts"];

gulp.task("build", function() {
  return gulp
    .src(source)
    .pipe(tsProject())
    .pipe(gulp.dest("dist"));
});

gulp.task("default",  gulp.series("build", function() {
  gulp.watch(source, gulp.series("build"));
}));
