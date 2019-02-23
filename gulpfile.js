const gulp = require('gulp');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');
const notify = require('gulp-notify');
const browserSync = require('browser-sync').create();


//константа в виде массива из файлов css которые будут преобразованы в 1 css файл
const cssFiles = [
    './node_modules/normalize.css/normalize.css',
    './src/css/**/*.css'
];

//константа в виде массива из файлов js которые будут преобразованы в 1 js файл
const jsFiles = [
    './src/js/lib.js',
    './src/js/some.js'
];

//функция которая возврашает массив css файлов,
//преобразует в 1 файл,
//проставляет преффиксы,
//чистит css(минифицирует),
//перекидывает в директорию build/css,
//обновляет страницу в браузере после изменений
function styles() {
    return gulp.src(cssFiles)
        .pipe(concat('all.css'))
        .pipe(autoprefixer({
            browsers: ['> 0.1%'],
            cascade: false
        }))
        .pipe(gulp.dest('./build/css'))
        .pipe(browserSync.stream());
}

//функция которая возврашает массив js файлов,
//конкатинирует эти файлы в 1 файл
//углифай
//перемещает файл в /build/js
//обновляет страницу в браузере после изменений
function scripts() {
    return gulp.src(jsFiles)
        .pipe(concat('all.js'))

        .pipe(gulp.dest('./build/js'))
        .pipe(browserSync.stream());
}

//функция которая запускает сервер с базовой директории
//туннель для отображения на разных устройствах по ссылке
//gulp.watch наблюдать за файлом в директории
// и при изменении запускать функцию styles
function watch(){
    browserSync.init({
        server: {
            baseDir: './'
        },
        tunnel: true
    });
    gulp.watch('./src/css/**/*.css', styles);
    gulp.watch('./src/js/**/*.js', scripts);
    gulp.watch('./src/sass/**/*.scss', fromSASSToCSS);
    gulp.watch('./*.html', browserSync.reload);
}

//функция которая удаляет все
//файлы в директории build
function clean(){
    return del(['build/*']);
}

//функция преобразования сасс в цсс
function fromSASSToCSS(){
    return gulp.src('./src/sass/**/main.scss')
            .pipe(autoprefixer({
            browsers: ['> 0.1%'],
            cascade: false
            }))
            .pipe(sass.sync({
                // outputStyle: 'compressed'
            }))
        .on('error', notify.onError({
            message: "Error: <%= error.message %>",
            title: 'Sass error'
        }))
            .pipe(rename({
                suffix: '.min',
                prefix: ''
            }))
            .pipe(sourcemaps.init())
            // .pipe(cssnano())
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('./build/css'))
            .pipe(browserSync.stream());
}


gulp.task('styles', styles);
gulp.task('scripts', scripts);
gulp.task('watch', watch);
gulp.task('sass', gulp.series(fromSASSToCSS, watch));  //Таск для сасса

gulp.task('build', gulp.series(clean,
                        gulp.parallel(styles, scripts)));

gulp.task('dev', gulp.series('build', 'watch'));

gulp.task('clean', clean);   //таск очистки билда