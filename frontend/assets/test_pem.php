<?php
/**
 *  test_pem.php
 *
 *	Tesing PEM models
 *
 * @autor Makarov Evgeny <ifgeny87@gmail.com>
 * @link http://dev87.ru
 * @version 2015-09-03 11:18
 */

//
// проверяю сначала ip-адрес запустившего на доступность
//
error_reporting(0);
ini_set('display_errors', 0);

($ip = $_SERVER['HTTP_X_REAL_IP'])
|| ($ip = $_SERVER['HTTP_X_FORWARDED_FOR'])
|| ($ip = $_SERVER['REMOTE_ADDR']);

$avail_ips = array('127.0.0.1');

if(in_array($ip, $avail_ips) !== true) {
	header("HTTP/1.1 403 Unauthorized");
	die("Forbidden for {$ip}");
}

//
// тест на ip-адрес пройден
// выполняю основную работу
//
define('LOAD_ACCESS', time());
define('DEVELOPER_MODE', true);
//
// локалью меняю
mb_regex_encoding('UTF-8');
setlocale(LC_ALL, 'ru_RU.UTF-8');
//
// настраиваю вывод ошибок
error_reporting(E_ALL - E_NOTICE);
ini_set('display_errors', 'On');
//
// определяю каталог приложения
define('APP_PATH', realpath('..') . '/');
//
// подключаю namespaces
use \Phalcon\Config\Adapter\Ini as ConfigIni;
use \Phalcon\Mvc\Application;

try {
	// загружаю настройки, стартую приложение
	$config = new ConfigIni(APP_PATH . 'app/config/config.ini');
	require APP_PATH . 'Rainbow/app/.auto_config.php';
	$app = new Application($di);

	// заголовки
	header('Content-Type: text/plain, charset=utf-8');

	#
	#	Создаю задачу
	#
	$task = (new \Pem\Models\Tasks())
		// реквизиты
		->setName('test1')
		->setDateUnit(\Pem\Models\Tasks::DATE_UNIT_DAY)
		->setValueUnit('руб.')
		// входные
		->setPrpz(1500)
		->setPpr(300)
		->setPrpr(1800)
		// сроки
		->setPd(500);

	// сохраняю чтобы получить id
	$task->calculate();
	$res = $task->save();
	if($res !== true)
		throw new Exception('Task create: ' . implode(",\n", $task->getMessages()));

	#
	#	Создаю 3 этапа задачи
	#

	$mile1 = (new \Pem\Models\Milestones())
		// входные
		->setPrpz(160.0)
		->setPrfz(160.0)
		->setFrfz(140.0)
		->setPd(50.0)
		->setFd(55.0)
		->setTask($task)
		->calculate();
	$res = $mile1->save();
	if($res !== true)
		throw new Exception('Milestone1 create: ' . implode(",\n", $mile1->getMessages()));

	$mile2 = (new \Pem\Models\Milestones())
		// входные
		->setPrpz(150.0)
		->setPrfz(150.0)
		->setFrfz(150.0)
		->setPd(55.0)
		->setFd(65.0)
		->setTask($task)
		->calculate();
	$mile2->save();
	if($res !== true)
		throw new Exception('Milestone2 create: ' . implode(",\n", $mile2->getMessages()));

	#
	#	Обновление данных и расчеты
	#
	$task
		->loadData()
		->calculate();

	$res = $task->save();
	if($res !== true)
		throw new Exception('Task update: ' . implode(",\n", $task->getMessages()));

	echo 'Milestone1 = ';
	print_r($mile1->toArray());
	echo 'Milestone2 =';
	print_r($mile2->toArray());
	echo 'Task = ';
	print_r($task->toArray());

	#
	#	Удаление объектов
	#
	/*$res = $task->delete();
	if($res !== true)
		throw new Exception('Task delete: ' . implode(",\n", $task->getMessages()));
	$res = $mile1->delete();
	if($res !== true)
		throw new Exception('Milestone1 delete: ' . implode(",\n", $mile1->getMessages()));
	$res = $mile2->delete();
	if($res !== true)
		throw new Exception('Milestone2 delete: ' . implode(",\n", $mile2->getMessages()));
	$res = $mile3->delete();
	if($res !== true)
		throw new Exception('Milestone3 delete: ' . implode(",\n", $mile3->getMessages()));*/

	echo "Done\n";

	$R->send();

} catch (\Exception $ex) {
	echo "\n[ERROR] ", $ex->getMessage();

	debug_print_backtrace();
}
