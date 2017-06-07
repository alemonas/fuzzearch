var gulp = require('gulp');
var sass = require('gulp-sass');
var notify = require("gulp-notify");


gulp.task('sass', function(){
  return gulp.src('src/sass/**/*.scss')
    .pipe(sass()) // Using gulp-sass
    .pipe(gulp.dest('public/assets/css/'))
    .pipe(notify("Done!"));
});

gulp.task('watch', function(){
  gulp.watch('src/sass/**/*.scss', ['sass'])
});