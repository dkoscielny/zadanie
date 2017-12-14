var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    less  = require('gulp-less'),
    cleanCSS = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    htmlReplace = require('gulp-html-replace'),
    htmlMin = require('gulp-htmlmin'),
    sourcemaps  = require('gulp-sourcemaps');

gulp.task('reload', function(){
    browserSync.reload();
});

gulp.task('serve', ['less', 'css', 'js'], function(){
    browserSync({
        server: 'src'
    });
    gulp.watch('src/**/*.html', ['reload']);
    gulp.watch('src/**/*.css', ['css']);
    gulp.watch('src/**/*.js', ['js']);
    gulp.watch('src/less/*.less', ['less', 'css']);
}); 

gulp.task('less', function(){
    return gulp.src('src/less/custom.less')
        .pipe(sourcemaps.init())
        .pipe(less().on('error', function(err){
            console.log(err);
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('src/css/'))
        .pipe(browserSync.stream());
});

gulp.task('css', function(){
    return gulp.src('src/css/*.css')
        .pipe(autoprefixer({
            browsers: ['last 3 versions'] 
          }))
        .pipe(gulp.dest('src/css-pref'))
        .pipe(browserSync.stream());
});

gulp.task('js', function(){
    return gulp.src('src/js/*.js')
        .pipe(browserSync.stream());
});

gulp.task('html-min', function(){
    return gulp.src('src/*.html')
    .pipe(htmlReplace({
        'css': 'css/custom.css'
    }))
    .pipe(htmlMin({
        sortAttributes: true,
        sortClassName: true,
        collapseWhitespace: true
    }))
    .pipe(gulp.dest('dist/'));
});

gulp.task('css-min', function(){
     return gulp.src('src/css-pref/custom.css')
         .pipe(cleanCSS())
         .pipe(gulp.dest('dist/css'));
 });

 gulp.task('js-min', function(){
    return gulp.src('src/js/script.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('default', ['serve']);

gulp.task('dist', ['css-min', 'js-min', 'html-min'] , function(){});