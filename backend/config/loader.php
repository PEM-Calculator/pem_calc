<?php
defined('LOAD_ACCESS') || die('Access denied');

$loader = new \Phalcon\Loader();

$loader->registerDirs([
	__APP__ . $config->application->controllersDir,
	__APP__ . $config->application->pluginsDir,
	__APP__ . $config->application->libraryDir,
	__APP__ . $config->application->modelsDir,
	__APP__ . $config->application->formsDir,
])->register();

$loader->registerNamespaces([
	'Pem\Models' => __APP__ . 'Pem' . DIRSEP . 'models',
]);

/*
#
#	Rainbow namespaces
#
if(!isset($registerNamespaces) || is_null($registerNamespaces))
	$registerNamespaces = [];
$registerNamespaces += [
	'Rainbow\Controllers'	=> __APP__ . 'Rainbow/app/controllers/',
	'Rainbow\Plugins'		=> __APP__ . 'Rainbow/app/plugins/',
	'Rainbow\Library'		=> __APP__ . 'Rainbow/app/library/',
	'Rainbow\Models'		=> __APP__ . 'Rainbow/app/models',
];
*/
