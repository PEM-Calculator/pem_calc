<?php

namespace Rainbow\Models;

use \Phalcon\Mvc\Model;
use \Phalcon\Mvc\Model\Relation;

class Links extends BaseObject
{
	const
		# тип ссылки
		LINK_TYPE_NONE = 'link_none',
		LINK_TYPE_FILE = 'link_file',
		LINK_TYPE_PAGE = 'link_page',
		LINK_TYPE_URL = 'link_url';

	protected
		$title_text_key,	#	varchar(100)	NOT NULL
		$file_id,			#	int(11)			NULL
		$page_id,			#	int(11)			NULL
		$url;				#	varchar(250)	NULL
		
	public function initialize() {
		# привязка Files(1)--Links(1)
		$this->hasOne('file_id', '\Rainbow\Models\Files', 'id',
			array('alias' => 'link_file',
				  'foreignKey' => array('action' => Relation::ACTION_CASCADE)));

		# привязка Pages(1)--Links(1)
		$this->hasOne('page_id', '\Rainbow\Models\Pages', 'id',
			array('alias' => 'link_page',
				  'foreignKey' => array('action' => Relation::ACTION_CASCADE)));

		# skipping
		$this->skipAttributesOnCreate(array('file_id', 'page_id', 'url'));

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
	//	Возвращает уникальный номер для названия
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

	public function getFile() {
		return $this->link_file;
	}

	public function getPage() {
		return $this->link_page;
	}

	public function getUrl() {
		return $this->url;
	}

	public function getFullUrl() {
		if($this->isFile())
			return $this->link_file->getUrl();
		else if($this->isPage())
			return $this->link_page->urn;
		else
			return $this->geturl();
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
	//	Возвращает тип ссылки
	//
	public function getLinkType() {
		if($this->file != null)
			return self::LINK_TYPE_FILE;
		else if($this->page != null)
			return self::LINK_TYPE_PAGE;
		else if($this->url != null)
			return self::LINK_TYPE_URL;
		else
			return self::LINK_TYPE_NONE;
	}

	public function isFile() {
		return ($this->file != null);
	}

	public function isPage() {
		return ($this->page != null);
	}

	public function isUrl() {
		return ($this->url != null);
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Setters
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	//
	//	Сбрасывает все ссылки
	//
	protected function resetLinkType() {
		$this->file = null;
		$this->file_id = null;
		$this->page = null;
		$this->page_id = null;
		$this->url = null;
	}

	//
	//	Устанаваливает ссылку на файл в базе
	//
	public function setFile($file) {
		$this->resetLinkType();
		$this->file_id = is_null($file) ? null : $file->id;
	}

	//
	//	Устанавливает ссылку на страницу
	//
	public function setPage($page) {
		$this->resetLinkType();
		$this->page_id = is_null($page) ? null : $page->id;
	}

	//
	//	Устанаваливает ссылку на внешний ресурс
	//
	public function setUrl($url) {
		$this->resetLinkType();
		$this->url = $url;
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
}