var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin');

// next主题 JS压缩
gulp.task('uglify', function() {
    return gulp.src('./public/js/src/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('././public/js/src/'));
});

// next主题 CSS压缩
gulp.task('cssmin', function() {
    return gulp.src('./public/css/main.css')
        .pipe(cssmin())
        .pipe(gulp.dest('./public/css/'));
});

// next主题 图片压缩
gulp.task('images', function() {
    gulp.src('./public/images/*.*')
        .pipe(imagemin({
            progressive: false
        }))
        .pipe(gulp.dest('././public/images/'));
});
var defaultTasks = ['uglify', 'cssmin'];
gulp.task('default', defaultTasks);
