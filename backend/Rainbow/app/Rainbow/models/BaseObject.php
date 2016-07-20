<?php

namespace Rainbow\Models;

use \Phalcon\Mvc\Model;
use \Phalcon\Mvc\Model\Relation;

class BaseObject extends Model
{
	public
		$id,		#	int(11)	NOT NULL	PRIMARY		
		$created,	#	timestamp	NOT NULL		CURRENT_TIMESTAMP	
		$updated,	#	timestamp	NULL			
		$_myMessages = array();

	public function initialize() {
		# use dynamic
		$this->useDynamicUpdate(true);

		# skipping
		$this->skipAttributesOnCreate(array('id', 'created', 'updated'));
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Triggers
	//
	//	https://docs.phalconphp.com/ru/latest/reference/models.html
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	// Inserting/Updating
	public function beforeValidation() { }

	// Inserting
	public function beforeValidationOnCreate() { }

	// Updating
	public function beforeValidationOnUpdate() { }

	// Inserting/Updating
	public function onValidationFails() { }

	// Inserting
	public function afterValidationOnCreate() { }

	// Updating
	public function afterValidationOnUpdate() { }

	// Inserting/Updating
	public function afterValidation() { }

	// Inserting/Updating
	public function beforeSave()
	{
		$this->updated = date('Y-m-d H:i:s');
	}

	// Updating
	public function beforeUpdate() { }

	// Inserting
	public function beforeCreate() { }

	// Updating
	public function afterUpdate() { }

	// Inserting
	public function afterCreate() { }

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Override
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	public function getMessages() {
		$result = array_merge($this->_myMessages, parent::getMessages());
		return $result;
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Protected
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	protected function generateGuid() {
		return sprintf('%04X%04X-%04X-%04X-%04X-%04X%04X%04X', mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(16384, 20479), mt_rand(32768, 49151), mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535));
	}

	// Пробую получить текущую локаль из текущего приложения
	protected function getLocale() {
		$di = $this->getDI();
		if(is_null($di)) return null;
		$localization = $di->getLocale();
		if(is_null($localization)) return null;
		return $localization->getLocale();
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Static Getters
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	public static function getById($id) {
		return self::findFirst(array(
			'conditions' => 'id = ?0',
			'bind' => array($id)));
	}
	
}
