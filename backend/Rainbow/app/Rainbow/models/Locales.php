<?php

namespace Rainbow\Models;

use \Phalcon\Mvc\Model;
use \Phalcon\Mvc\Model\Relation;

class Locales extends BaseObject
{
	public
		$prefix,	#	char(2)	NOT NULL	UNIQUE		
		$title,		#	varchar(50)	NOT NULL
		$enable;	#	int(11)			NOT NULL 	1

	public function initialize() {
		# привязка Locales(1)--LocaleTexts(*)
		$this->hasMany('id', '\Rainbow\Models\LocaleTexts', 'locale_id',
			array('alias' => 'texts',
				'foreignKey' => array(
				'action' => Relation::ACTION_CASCADE)));

		parent::initialize();
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Static Getters
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	public static function getByPrefix($prefix) {
		return self::findFirst(array(
			'conditions' => 'prefix = ?0 AND enable = 1',
			'bind' => array($prefix)));
	}

}