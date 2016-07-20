<?php

namespace Rainbow\Models;

use \Phalcon\Mvc\Model;
use \Phalcon\Mvc\Model\Relation;

class LocaleTexts extends BaseObject
{
	protected
		$locale_id,	#	int(11)	NOT NULL			
		$key;		#	varchar(100)	NOT NULL			

	public
		$value;		#	text	NOT NULL

	public function initialize() {
		# привязка Locales(1)--LocaleTexts(*)
		$this->belongsTo('locale_id', '\Rainbow\Models\Locales', 'id',
			array('alias' => 'locale',
				  'foreignKey' => array('action' => Relation::ACTION_CASCADE)));

		parent::initialize();
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Getters
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	//
	//	Возвращает Locales объект
	//
	public function getLocale() {
		return $this->locale;
	}

	//
	//	Вовращает значение ключа
	//
	public function getKey() {
		return $this->key;
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Setters
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	//
	//	Устанавливает локаль
	//
	public function setLocale($locale) {
		if(is_null($locale))
			throw new \Exception(__METHOD__ . ': $locale can\'t be null');

		$this->locale_id = $locale->id;
		$this->locale = $locale;
	}

	//
	//	Устанавливает значение ключа
	//
	public function setKey($newKey) {
		# валидация
		if(is_null($newKey) || $newKey == '')
			throw new \Exception(__METHOD__ . ': $newKey can\'t be empty');

		$this->key = $newKey;
	}
}