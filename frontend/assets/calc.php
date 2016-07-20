<?php
/**
 *  calc.php
 *
 * @autor Makarov Evgeny <ifgeny87@gmail.com>
 * @link http://dev87.ru
 * @version 2015-10-09 13:38
 */

define('LOAD_ACCESS', microtime(true));

# папка приложения
$path = realpath(__DIR__ . '/../backend');
if(!is_dir($path)) die('Application directory define error');
define('__APP__', $path . DIRECTORY_SEPARATOR);

require_once __APP__ . 'config/bootstrap.php';

use \Pem\Models\Calculations;
use \Pem\Models\Milestones;
use \Phalcon\Mvc\Application;

/**
 * Выполняется что-то
 */
try {
	$app = new Application($di);
	$response = $di->getResponse();

	# не выполнять проверку NOT NULL для полей таблиц
	\Phalcon\Mvc\Model::setup([
		'notNullValidations' => false
	]);

	// подключаю модель калькулятора
	// и выполняю парсинг данных
	$input = isset($_POST['data']) ? $_POST['data']
		: (isset($_GET['data']) ? $_GET['data'] : null);

	$result = \Pem\Models\Calculation::createCalculation(json_decode($input));

	if(is_int($result)) {
		error([
			'code' => $result,
			'message' => \Pem\Models\Calculation::RESULT_MESSAGES[$result]
		], 400);
	}
	elseif(is_object($result)) {
		$calculation = $result;
	}
	else {
		// unnown error
		error([
			'message' => $result,
		]);
	}

	// Все удачно. Отправляю результат
	$response = $di->getResponse();
	$response->setContentType('application/json');

	$output = $calculation->toArray();
	$response->setContent(
		moreInfo('INPUT ::', json_decode($input))
		. moreInfo('OUTPUT ::', $output)
		. json_encode($output));
	$response->send();
}
catch (\Exception $ex) {
	if(defined('DEVELOPER_MODE')) {
		echo "<table>", $ex->xdebug_message, "</table>";
		echo "\n\n<br/><font color=\"red\">[ERROR] ", $ex->getMessage(), "</font>\n";
		debug_print_backtrace();
	}
}

/**
 * Функция выводит MoreInfo
 *
 * @return string|null - какой-то текст
 */
function moreInfo() {
	if(defined('MORE_INFO')) {
		ob_start();
		foreach(func_get_args() as $line)
			if(is_array($line) || is_object($line))
				echo print_r($line, 1), "\n";
			else
				echo $line, "\n";
		echo "\n";
		return ob_get_clean();
	}
}

// Отправляет заголовок с ошибкой и завершает работу
function error($content, $code = 500, $status = 'Application error') {
	global $response;
	$response->setContentType('application/json');
	$response->setStatusCode($code, $status);

	if($content)
		$response->setContent(json_encode(['error' => $content]));

	$response->send();
	exit($code);
}

