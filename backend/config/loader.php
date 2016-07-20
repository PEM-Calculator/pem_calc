<?php
defined('LOAD_ACCESS') || die('Access denied'); 

# namespace приложения
if(!isset($registerNamespaces) || is_null($registerNamespaces))
 	$registerNamespaces = [];

$registerNamespaces += [
	'Pem\Models' => __APP__ . 'Pem' . DIRSEP . 'models',
];
