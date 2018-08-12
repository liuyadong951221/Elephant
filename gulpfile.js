'use strict';
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('serve', function() {
    browserSync.init({
        server: './web',
    });
    gulp.watch('web/scss/*.scss', ['sass']);
    gulp.watch('web/css/*.css').on('change', reload);
    gulp.watch('web/js/*.js').on('change', reload);
    gulp.watch('web/*.html').on('change', reload);

});

gulp.task('sass', function() {
    return gulp.src('web/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            remove: true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(gulp.dest('./web/css'));
})




gulp.task('default', ['serve', 'sass']);
