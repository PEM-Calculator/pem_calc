'user strict';

/*
 * 04. Инкрементальная сборка
 * Watch следит только за новыми и измененными файлами. Если файл будет удален, то команда watch это
 * проследит и ничего не сделает. Для отслеживанием за удаленными файлами можно использовать
 * chokidar. Но обычно хватает просто выполнить 'rebuild' ('clean', 'build')
 */

const gulp = require('gulp');
const bro = require('gulp-bro');				// babel + react
const babelify = require('babelify');			// babel
const less = require('gulp-less');				// less компилятор
const concat = require('gulp-concat');			// модуль объекдинения файлов
const debug = require('gulp-debug');			// дебаг для gulp
const sourcemaps = require('gulp-sourcemaps');	// генератор Source-Map
const gulpIf = require('gulp-if');				// условный оператор
const newer = require('gulp-newer');			// плагин, который проверяет обновились ли файлы
const remember = require('gulp-remember');		// плагин помнит, какие файлы нужно включить, например при concat
const notify = require('gulp-notify');			// плагин для вывода ошибок
const eslint = require('gulp-eslint');			// проверяльщик для JavaScript
const clean_css = require('gulp-clean-css');	// минификатор css
const uglifyjs = require('gulp-uglifyjs');		// минификатор js
const source = require('vinyl-source-stream');
const multipipe = require('multipipe');			// создает .pipe, состоящий из нескольких .pipe
const del = require('del');						// расширение для удаления файлов
const path = require('path');

// метод вывода ошибки
var
	onError = function(err) {
		notify.onError({
			title: 'Error',
			message: '<%= error %>',
		})(err);
		this.emit('end')
	};

// флаг разработчика
const
	isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

// чтобы React не ругался в консоли на дев-версию
process.env.NODE_ENV = 'production';

// переменные
var
	$src_path = path.resolve('.'),			// откуда берем исходники
	$dest_path = path.resolve('../public'),	// куда ложим результат
	// styles
	$styles_src_path = $src_path + '/styles',
	$styles_dest_path = $dest_path + '/css',
	$main_style = 'main.css',
	// scripts
	$js_src_path = $src_path + '/js',
	$jsx_src_path = $src_path + '/jsx',
	$scripts_dest_path = $dest_path + '/scripts',
	$main_script = 'main.js',
	// assets
	$assets_src_path = $src_path + '/assets',
	$assets_dest_path = $dest_path;

// Задача очистки public
gulp.task('clean', function() {
	return del([$dest_path], {force: true})
});

// Задача для генерации стилей
gulp.task('styles', function() {
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
		concat($main_style),
		debug({title: 'style concat'}),
		//
		clean_css(),
		debug({title: 'clean-css'}),
		// записываем sourcemap в итоговый css
		gulpIf(isDevelopment, sourcemaps.write()),
		// выкладываем в public/css
		gulp.dest($styles_dest_path)
	)
	.on('error', notify.onError())
});

// Задача для скриптов
gulp.task('js', () => {
	return multipipe(
		// папка исходников
		gulp.src($js_src_path + '/**/*.js'),
		debug({title: 'js src'}),
		// прогоняю скрипты через eslint
		eslint(),
		eslint.format(),
		eslint.failAfterError(),
		// сжимаю скрипты в один файл, добавляю sourcemap
		uglifyjs($main_script, {outSourceMap: isDevelopment}),
		// выкладываю итоговый файл
		gulp.dest($scripts_dest_path)
	)
	.on('error', notify.onError())
});

// Задача для JSX
gulp.task('jsx', () => {
	return multipipe(
		gulp.src($jsx_src_path + '/*.js'),
		debug({title: 'jsx src'}),
		// babel + react
		bro({
			transform: [babelify.configure({ presets: ['es2015', 'react'] })],
			extensions: ['.jsx', '.js'],
			debug: isDevelopment,
			error: notify.onError(),
		}),
		debug({title: 'jsx bro'}),
		// прогоняю скрипты через eslint
		eslint(),
		eslint.format(),
		eslint.failAfterError(),
		debug({title: 'jsx eslint'}),
		// сжимаю скрипты в один файл, добавляю sourcemap
		uglifyjs('app.js', {outSourceMap: isDevelopment, compress: false}),
		debug({title: 'jsx uglify'}),
		// выкладываю итоговый файл
		gulp.dest($scripts_dest_path)
	)
	.on('error', notify.onError())
});

// Задача копирует все из assets
gulp.task('assets', () => {
	return multipipe(
		gulp.src($assets_src_path + '/**', {since: gulp.lastRun('assets')}),
		debug({title: 'assets src'}),
		// remember экономит время и ресурсы на обработку тех файлов, которые он запомнил
		remember('assets'),
		debug({title: 'assets remember'}),
		//
		newer($assets_dest_path),	// фильтр, пропускает только новые файлы,
									// которые изменились в папке назначения
		debug({title: 'assets newer'}),
		gulp.dest($assets_dest_path)
	)
	.on('error', notify.onError())
});

// build = styles + js + jsx + assets
gulp.task('build', gulp.parallel('styles', 'js', 'jsx', 'assets'));

// rebuild = clean -> build
gulp.task('rebuild', gulp.series('clean', 'build'));

// Задача инкрементальной сборки
gulp.task('watch', () => {
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
});

// dev = build -> watch
gulp.task('dev', gulp.series('build', 'watch'));

// default = dev
gulp.task('default', gulp.series(isDevelopment ? 'dev' : 'build'));
