<?php

use \Phalcon\Mvc\View;
use \Phalcon\DI\FactoryDefault;
use \Phalcon\Mvc\Dispatcher;
use \Phalcon\Mvc\Url as UrlProvider;
use \Phalcon\Mvc\View\Engine\Volt as VoltEngine;
use \Phalcon\Mvc\Model\Metadata\Memory as MetaData;
use \Phalcon\Session\Adapter\Files as SessionAdapter;
use \Phalcon\Flash\Session as FlashSession;
use \Phalcon\Events\Manager as EventsManager;

$di = new FactoryDefault();

$di->set('dispatcher', function() use ($di) {
	$eventsManager = new EventsManager;
	
	if(strpos($_GET['_url'], '/admin/') === 0) {
		$eventsManager->attach('dispatch:beforeException', new \Rainbow\Plugins\AdminNotFoundPlugin);
	}
	/*else if(strpos($_GET['_url'], '/ajax/') === 0) {
		$eventsManager->attach('dispatch:beforeException', new \Rainbow\Plugins\AjaxRequestPlugin);
	}*/
	else {
		$eventsManager->attach('dispatch:beforeException', new \Rainbow\Plugins\PageRequestPlugin);
	}

	$dispatcher = new Dispatcher;
	$dispatcher->setEventsManager($eventsManager);

	return $dispatcher;
});


$di->set('url', function() use ($config){
	$url = new UrlProvider();
	$url->setBaseUri($config->application->baseUri);
	return $url;
});


$di->set('view', function() use ($config) {
	$view = new View();
	$view->setViewsDir(APP_PATH . $config->application->viewsDir);
	$view->registerEngines([ '.volt' => 'volt' ]);
	return $view;
}, true);


$di->set('volt', function($view, $di) {
	$volt = new VoltEngine($view, $di);
	$volt->setOptions([ 'compiledPath' => APP_PATH . 'cache/volt/' ]);
	return $volt;
}, true);


$di->set('db', function() use ($config) {
	$dbclass = '\Phalcon\Db\Adapter\Pdo\\' . $config->database->adapter;
	return new $dbclass([
		'host'     => $config->database->host,
		'port'     => $config->database->port,
		'dbname'   => $config->database->dbname,
		'username' => $config->database->username,
		'password' => $config->database->password,
		'charset'  => $config->database->charset,
	]);
}, true);


$di->set('session', function() {
	$session = new SessionAdapter();
	$session->start();
	return $session;
});


$di->set('flash', function() {
	return new FlashSession([
		'error'   => 'alert alert-danger',
		'success' => 'alert alert-success',
		'notice'  => 'alert alert-info',
	]);
}, true);


$di->set('adminmenu', function() {
	return new \Rainbow\Library\AdminMenu();
}, true);


$di->set('sitemenu', function() {
	return new \Rainbow\Library\SiteMenu();
}, true);


$di->set('locale', function() {
	return new \Rainbow\Library\Localization();
}, true);


$di->set('settings', function() use($config) {
	return new \Rainbow\Library\Settings($config->settings);
}, true);


$di->set('generator', function() {
	return new \Rainbow\Library\PageGenerator();
}, true);