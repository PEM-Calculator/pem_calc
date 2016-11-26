<?php
define('LOAD_ACCESS', microtime(true));

# папка приложения
$path = realpath(__DIR__ . '/../backend');
if(!is_dir($path)) die('Application directory define error');
define('__APP__', $path . DIRECTORY_SEPARATOR);

require_once __APP__ . 'config' . DIRECTORY_SEPARATOR . 'bootstrap.php';

/*spl_autoload_register(
	function($class) {
		static $classes = null;
		if ($classes === null) {
			$classes = [
				'money' => 'Money.php',
			];
		}
		$cn = strtolower($class);
		if(isset($classes[$cn])) {
			require __DIR__ . DIRECTORY_SEPARATOR . $classes[$cn];
		}
	}
);*/