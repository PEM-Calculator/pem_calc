<?php

namespace Rainbow\Models;

use \Phalcon\Mvc\Model;
use \Phalcon\Mvc\Model\Relation;

class Pages extends BaseObject
{
	protected
		$title_text_key,	#	varchar(100)	NOT NULL
		$page_cat_id;		#	int(11)			NULL

	public
		$urn,				#	varchar(250)	NOT NULL
		$enable;			#	int(11)			NOT NULL 	1

	public function initialize() {
		# привязка PageCats(1)--Pages(*)
		$this->belongsTo('page_cat_id', '\Rainbow\Models\PageCats', 'id',
			array('alias' => 'page_cat',
				  'foreignKey' => array('action' => Relation::ACTION_CASCADE)));

		# привязка Pages(1)--PageBlocks(*)
		$this->hasMany('id', '\Rainbow\Models\PageBlocks', 'page_id',
			array('alias' => 'blocks',
				  'foreignKey' => array('action' => Relation::ACTION_CASCADE)));

		# skipping
		$this->skipAttributesOnCreate(array('page_cat_id'));

		parent::initialize();
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Triggers
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	public function beforeValidationOnCreate() {
		# генерирую ключ если еще не сделано
		$this->getTitleTextKeyGuid();

		parent::beforeValidationOnCreate();
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Private
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	//
	//	Генерирует если не создан и 
	//	Возвращает уникальный номер для описания
	//
	protected function getTitleTextKeyGuid() {
		if(is_null($this->title_text_key)) {
			$this->title_text_key = substr(__CLASS__ . '.title#' . $this->generateGuid(), 0, 100);
		}
		return $this->title_text_key;
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Getters
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	//
	//	Возвращает каталог страниц
	//
	public function getPageCategory() {
		return $this->page_cat;
	}

	//
	//	Возвращает список дочерних меню
	//
	public function getBlocks() {
		return $this->blocks;
	}

	//
	//	Возвращает LocaleTexts объект названия
	//
	public function getTitleObject($locale) {
		if(is_null($locale))
			throw new \Exception(__METHOD__ . ': $locale is null');

		$text = LocaleTexts::findFirst(array(
			'conditions' => 'locale_id = ?0 AND key = ?1',
			'bind' =>array($locale->id, $this->getTitleTextKeyGuid())));

		if(is_null($text) || $text === false)
			return null;
		else
			return $text;
	}

	//
	//	Возвращает текст названия
	//
	public function getTitle($locale) {
		$title = $this->getTitleObject($locale);
		if(is_null($title))
			return null;
		else
			return $title->value;
	}


	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Setters
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	//
	//	Устанавливает каталог страниц
	//
	public function setPageCategory($pageCat) {
		$this->page_cat_id = is_null($pageCat) ? null : $pageCat->id;
	}

	//
	//	Добавляет дочернее меню
	//
	public function addBlock($pageBlock) {
		$pageBlock->setPage($this);
	}

	//
	//	Устаналивает название
	//
	//	Метод возвращает LocaleTexts объект,
	//	который нужно потом сохранить
	//	Пример: $object->setTitle()->save();
	//
	public function setTitle($locale, $newTitle) {
		$title = $this->getTitleObject($locale);
		if(is_null($title)) {
			$title = new LocaleTexts();
			$title->setLocale($locale);
			$title->key = $this->getTitleTextKeyGuid();
		}
		$title->value = $newTitle;

		return $title;
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Static Getters
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	public static function getById($id) {
		return self::findFirst(array(
			'conditions' => 'id = ?0 AND enable = 1',
			'bind' => array($id)));
	}

	public static function getByUrn($urn) {
		return self::findFirst(array(
			'conditions' => 'urn = ?0 AND enable = 1',
			'bind' => array($urn)));
	}
}