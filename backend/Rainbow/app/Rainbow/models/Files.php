<?php

namespace Rainbow\Models;

use \Phalcon\Mvc\Model;
use \Phalcon\Mvc\Model\Relation;

class Files extends BaseObject
{
	protected
		$description_text_key;	#	varchar(100)	NULL	
	
	public
		$filename,				#	varchar(100)	NOT NULL			
		$filetype,				#	varchar(50)		NOT NULL			
		$filesize,				#	int(11)			NOT NULL			
		$cachename;				#	varchar(50)		NOT NULL			

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Triggers
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	public function beforeValidationOnCreate() {
		# генерирую ключ если еще не сделано
		$this->getDescriptionTextKeyGuid();

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
	protected function getDescriptionTextKeyGuid() {
		if(is_null($this->description_text_key)) {
			$this->description_text_key = substr(__CLASS__ . '.description#' . $this->generateGuid(), 0, 100);
		}
		return $this->description_text_key;
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Getters
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	//
	//	Возвращает LocaleTexts объект описания
	//
	public function getDescriptionObject($locale) {
		if(is_null($locale))
			throw new \Exception(__METHOD__ . ': $locale is null');

		$text = LocaleTexts::findFirst(array(
			'conditions' => 'locale_id = ?0 AND key = ?1',
			'bind' =>array($locale->id, $this->getDescriptionTextKeyGuid())));

		if(is_null($text) || $text === false)
			return null;
		else
			return $text;
	}

	//
	//	Возвращает текст описания файла
	//
	public function getDescription($locale) {
		$title = $this->getDescriptionObject($locale);
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
	//	Устанавливает описание файла
	//
	//	Метод возвращает LocaleTexts объект,
	//	который нужно потом сохранить
	//	Пример: $object->setTitle()->save();
	//
	public function setDescription($locale, $newDescription) {
		$description = $this->getDescriptionObject($locale);
		if(is_null($description)) {
			$description = new LocaleTexts();
			$description->setLocale($locale);
			$description->key = $this->getDescriptionTextKeyGuid();
		}
		$description->value = $newDescription;

		return $description;
	}

}