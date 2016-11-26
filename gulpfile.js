'user strict';

/*
 * Watch следит только за новыми и измененными файлами. Если файл будет удален, то команда watch это
 * проследит и ничего не сделает. Для отслеживанием за удаленными файлами можно использовать
 * chokidar. Но обычно хватает просто выполнить 'rebuild' ('clean', 'build')
 */

const
    path = require('path'),
    multipipe = require('multipipe'),			// создает .pipe, состоящий из нескольких .pipe
    del = require('del'),						// расширение для удаления файлов
    babelify = require('babelify'),			    // babel
    gulp = require('gulp'),
    bro = require('gulp-bro'),			        // babel + react
    less = require('gulp-less'),				// less компилятор
    concat = require('gulp-concat'),			// модуль объекдинения файлов
    debug = require('gulp-debug'),			    // дебаг для gulp
    dest = require('gulp-dest'),			    // может переименовать выходной файл
    sourcemaps = require('gulp-sourcemaps'),	// генератор Source-Map
    gulpIf = require('gulp-if'),				// условный оператор
    newer = require('gulp-newer'),			    // плагин, который проверяет обновились ли файлы
    remember = require('gulp-remember'),		// плагин помнит, какие файлы нужно включить, например при concat
    notify = require('gulp-notify'),			// плагин для вывода ошибок
    eslint = require('gulp-eslint'),			// проверяльщик для JavaScript
    clean_css = require('gulp-clean-css'),	    // минификатор css
    uglifyjs = require('gulp-uglifyjs'),		// минификатор js
    source = require('vinyl-source-stream');

// флаг разработчика
const
    isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

// чтобы React не ругался в консоли на дев-версию
process.env.NODE_ENV = 'development';

const
    // # Папки исходников
    // styles
    $styles_src_path = path.resolve('./frontend/styles'),
    $style_name = 'main.css',
    // scripts
    $js_src_path = path.resolve('./frontend/js'),
    $js_name = 'main.js',
    $jsx_src_path = path.resolve('./frontend/jsx'),
    $jsx_name = 'app.js',
    // assets
    $assets_src_path = path.resolve('./assets'),
    // # Цеелвые папки
    $dest_path = path.resolve('./public/app');

/**
 * Метод выводит больше информации об ошибке
 */
function onError() {
    return notify.onError(function (error) {
        if (error.filename) {
            console.log('[ERROR] in ' + error.filename + ':' + error.pos + ' at', error.loc);
            console.log(error.codeFrame);
        }
        return error.message;
    });
}

/**
 * Очистка папки назнаения
 */
function clear_dest() {
    return del([$dest_path])
}

function build_styles() {
    // выбираем less-файлы, которые изменились с предыдущего выполнения задачи
    return multipipe(
        gulp.src([$styles_src_path + '/**/[^_]*.{less,css}']),
        debug({title: 'style src'}),
        // иничим sourcemap
        gulpIf(isDevelopment, sourcemaps.init()),
        // если less-файл не изменился, то less() получит готовый css-файл
        less(),
        debug({title: 'less'}),
        // соединяем все вместе в итоговый файл
        concat($style_name),
        debug({title: 'style concat'}),
        //
        gulpIf(!isDevelopment, clean_css()),
        // записываем sourcemap в итоговый css
        gulpIf(isDevelopment, sourcemaps.write()),
        // выкладываем в public/css
        gulp.dest($dest_path)
    ).on('error', onError())
}

function build_js() {
    return multipipe(
        // папка исходников
        gulp.src($js_src_path + '/**/*.js'),
        debug({title: 'js src'}),
        // прогоняю скрипты через eslint
        eslint(),
        eslint.format(),
        eslint.failAfterError(),
        // сжимаю скрипты в один файл, добавляю sourcemap
        gulpIf(!isDevelopment, uglifyjs($js_name, {outSourceMap: false, compress: true})),
        gulpIf(isDevelopment, concat($js_name)),
        // выкладываю итоговый файл
        gulp.dest($dest_path)
    ).on('error', onError())
}

function build_jsx() {
    return multipipe(
        gulp.src($jsx_src_path + '/**.jsx'),
        debug({title: 'jsx src'}),
        // babel + react
        bro({
            transform: [babelify.configure({presets: ['es2015', 'react']})],
            extensions: ['.jsx', '.js'],
            debug: false,
            error: onError(),
        }),
        debug({title: 'jsx bro'}),
        // прогоняю скрипты через eslint
        // eslint(),
        // eslint.format(),
        // eslint.failAfterError(),
        // debug({title: 'jsx eslint'}),
        // сжимаю скрипты в один файл, добавляю sourcemap
        gulpIf(!isDevelopment, uglifyjs($jsx_name, {outSourceMap: false, compress: true})),
        // debug({title: 'jsx uglify'}),
        // выкладываю итоговый файл
        dest('', {ext: '.js'}),
        gulp.dest($dest_path)
    ).on('error', onError());
}

function build_assets() {
    return multipipe(
        gulp.src($assets_src_path + '/**', {since: gulp.lastRun('assets')}),
        //debug({title: 'assets src'}),
        // remember экономит время и ресурсы на обработку тех файлов, которые он запомнил
        remember('assets'),
        //debug({title: 'assets remember'}),
        //
        newer($dest_path),	// фильтр, пропускает только новые файлы,
        // которые изменились в папке назначения
        // debug({title: 'assets newer'}),
        gulp.dest($dest_path)
    ).on('error', onError())
}

function watch() {
    // вотчер для сборки стилей
    gulp.watch($styles_src_path + '/**', gulp.series('styles'))
    // этот вотчер будет следить также за удалением файлов
    // при удалении он будет очищать кеш для remember
        .on('unlink', (filepath) => {
            // path.resolve создает из относительного пути абсолютный
            remember.forget('styles', path.resolve(filepath))
        });

    // вотчер для сборки скриптов JS
    gulp.watch($js_src_path + '/**', gulp.series('js'));

    // вотчер для сборки скриптов JSX
    gulp.watch($jsx_src_path + '/**', gulp.series('jsx'));

    // вотчер для копирования assets
    gulp.watch($assets_src_path + '/**', gulp.series('assets'))
}

// Таски для gulp
gulp.task('clear', clear_dest);
gulp.task('styles', build_styles);
gulp.task('js', build_js);
gulp.task('jsx', build_jsx);
gulp.task('assets', build_assets);
gulp.task('build', gulp.parallel('styles', 'js', 'jsx', 'assets'));
gulp.task('rebuild', gulp.series('clear', 'build'));
gulp.task('watch', watch);
gulp.task('dev', gulp.series('build', 'watch'));
gulp.task('default', gulp.series(isDevelopment ? 'dev' : 'build'));
