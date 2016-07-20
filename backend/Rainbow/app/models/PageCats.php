<?php

namespace Rainbow\Models;

use \Phalcon\Mvc\Model;
use \Phalcon\Mvc\Model\Relation;

class PageCats extends BaseObject
{
	protected
		$parent_id;	#	int(11)	NULL

	public
		$title;		#	varchar(50)	NOT NULL			

	public function initialize() {
		# привязка PageCats(1)--PageCats(*)
		$this->hasMany('id', '\Rainbow\Models\PageCats', 'parent_id',
			array('alias' => 'children',
				  'foreignKey' => array('action' => Relation::ACTION_CASCADE)));
		$this->belongsTo('parent_id', '\Rainbow\Models\PageCats', 'id',
			array('alias' => 'parent',
				  'foreignKey' => array('action' => Relation::ACTION_CASCADE)));

		parent::initialize();
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
}