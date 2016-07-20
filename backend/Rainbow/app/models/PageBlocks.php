<?php

namespace Rainbow\Models;

use \Phalcon\Mvc\Model;
use \Phalcon\Mvc\Model\Relation;

class PageBlocks extends BaseObject
{
	protected
		$page_id,			#	int(11)			NULL
		$title_text_key,	#	varchar(50)		NOT NULL
		$content_text_key;	#	varchar(50)		NOT NULL

	public
		$order,				#	int(11)			NOT NULL	999
		$module,			#	varchar(100)	NOT NULL
		$enable;			#	int(11)			NOT NULL 	1

	public function initialize() {
		# привязка Pages(1)--PageBlocks(*)
		$this->belongsTo('page_id', '\Rainbow\Models\Pages', 'id',
			array('alias' => 'the_page',
				  'foreignKey' => array('action' => Relation::ACTION_CASCADE)));

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
		$this->getContentTextKeyGuid();

		parent::beforeValidationOnCreate();
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Private
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	//
	//	Генерирует если не создан и 
	//	Возвращает уникальный номер для названия
	//
	protected function getTitleTextKeyGuid() {
		if(is_null($this->title_text_key)) {
			$this->title_text_key = substr(__CLASS__ . '.title#' . $this->generateGuid(), 0, 100);
		}
		return $this->title_text_key;
	}

	//
	//	Генерирует если не создан и 
	//	Возвращает уникальный номер для названия
	//
	protected function getContentTextKeyGuid() {
		if(is_null($this->content_text_key)) {
			$this->content_text_key = substr(__CLASS__ . '.content#' . $this->generateGuid(), 0, 100);
		}
		return $this->content_text_key;
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Getters
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	//
	//	Возвращает страницу
	//
	public function getPage() {
		return $this->the_page;
	}

	//
	//	Возвращает LocaleTexts объект названия
	//
	public function getTitleObject($locale = null) {
		// проверка локали
		if(is_null($locale || $locale = $this->getLocale()))
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
	public function getTitle($locale = null) {
		$text = $this->getTitleObject($locale);
		if(is_null($text))
			return null;
		else
			return $text->value;
	}

	//
	//	Возвращает LocaleTexts объект контента
	//
	public function getContentObject($locale = null) {
		if(is_null($locale || $locale = $this->getLocale()))
			throw new \Exception(__METHOD__ . ': $locale is null');

		$text = LocaleTexts::findFirst(array(
			'conditions' => 'locale_id = ?0 AND key = ?1',
			'bind' =>array($locale->id, $this->getContentTextKeyGuid())));

		if(is_null($text) || $text === false)
			return null;
		else
			return $text;
	}

	//
	//	Возвращает текст контента
	//
	public function getContent($locale = null) {
		$text = $this->getContentObject($locale);
		if(is_null($text))
			return null;
		else
			return $text->value;
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Setters
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	//
	//	Устанавливает страницу
	//
	public function setPage($page) {
		$this->page_id = is_null($page) ? null : $page->id;
	}

	//
	//	Устанавливает текст заголовка
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

	//
	//	Устанавливает текст заголовка
	//
	//	Метод возвращает LocaleTexts объект,
	//	который нужно потом сохранить
	//	Пример: $object->setTitle()->save();
	//
	public function setContent($locale, $newContent) {
		$content = $this->getcontentObject($locale);
		if(is_null($content)) {
			$content = new LocaleTexts();
			$content->setLocale($locale);
			$content->key = $this->getcontentTextKeyGuid();
		}
		$content->value = $newContent;

		return $content;
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

	public static function getByPageId($pageId) {
		return self::findFirst(array(
			'conditions' => 'page_id = ?0 AND enable = 1',
			'bind' => array($pageId)));
	}
}
