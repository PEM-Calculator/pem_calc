<?php
defined('LOAD_ACCESS') || die('Access denied');

/**
 *  calc.php
 *
 * @autor Makarov Evgeny <ifgeny87@gmail.com>
 * @link http://dev87.ru
 * @version 2015-10-09 13:38
 */

# Разделитель папки
define('DIRSEP', DIRECTORY_SEPARATOR);

# Настройка локали
mb_regex_encoding('UTF-8');
setlocale(LC_ALL, 'ru_RU.UTF-8');

use \Phalcon\Config\Adapter\Ini as ConfigIni;

# Загрузка конфига, регистрация констант приложения
$config = new ConfigIni(__APP__ . 'config/config.ini');
if(isset($config->const))
	foreach($config->const as $key => $value) {
		define($key, $value);
	}

# Запуск приложения
require_once __APP__ . '.auto_config.php';

#
#	Метод регистрирует константу с проверкой существования каталога
#
function defineDir($name, $path) {
	// check defined
	if(defined($name))
		return false;
	// check path
	$realpath = realpath($path);
	if(!is_dir($realpath))
		return false;
	// define
	define($name, $realpath . DIRSEP);
	return true;
}
