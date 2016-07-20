<?php

namespace Rainbow\Models;

use \Phalcon\Mvc\Model;
use \Phalcon\Mvc\Model\Relation;

class Menus extends BaseObject
{
	protected
		$parent_id,			#	int(11)			NULL
		$title_text_key,	#	varchar(100)	NOT NULL
		$link_id;			#	int(11)			NULL

	public
		$enable;			#	int(11)			NOT NULL 	1

	public function initialize() {
		# привязка Menus(1)--Menus(*)
		$this->hasMany('id', '\Rainbow\Models\Menus', 'parent_id',
			array('alias' => 'children',
				  'foreignKey' => array('action' => Relation::ACTION_CASCADE)));
		$this->belongsTo('parent_id', '\Rainbow\Models\Menus', 'id',
			array('alias' => 'parent',
				  'foreignKey' => array('action' => Relation::ACTION_CASCADE)));
		$this->belongsTo('link_id', '\Rainbow\Models\Links', 'id',
			array('alias' => 'the_link',
				  'foreignKey' => array('action' => Relation::ACTION_CASCADE)));

		# skipping
		$this->skipAttributesOnCreate(array('parent_id', 'link_id'));

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
	//	Возвращает родительскую категорию меню
	//
	public function getParent() {
		return $this->parent;
	}

	//
	//	Возвращает список дочерних меню
	//
	public function getChildren() {
		return $this->children;
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

	//
	//	Возвращает ссылку
	//
	public function getLink() {
		return $this->the_link;
	}


	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Setters
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	//
	//	Устанавливает родительскую категорию меню
	//
	public function setParent($parent) {
		$this->parent_id = is_null($parent) ? null : $parent->id;
	}

	//
	//	Добавляет дочернее меню
	//
	public function addChild($childMenu) {
		$childMenu->setParent($this);
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
}