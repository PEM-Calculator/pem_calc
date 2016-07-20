<?php
defined('LOAD_ACCESS') || die('Have no access');

$loader = new \Phalcon\Loader();

#
#	Register dirs
#
if(!isset($registerDirs) || is_null($registerDirs))
	$registerDirs = [];
$registerDirs += [
	__APP__ . $config->application->controllersDir,
	__APP__ . $config->application->pluginsDir,
	__APP__ . $config->application->libraryDir,
	__APP__ . $config->application->modelsDir,
	__APP__ . $config->application->formsDir,
];

$loader->registerDirs($registerDirs)->register();

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

$loader->registerNamespaces($registerNamespaces);
