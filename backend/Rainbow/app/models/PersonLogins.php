<?php

namespace Rainbow\Models;

use \Phalcon\Mvc\Model;
use \Phalcon\Mvc\Model\Relation;

class PersonLogins extends BaseObject
{
	public
		$person_id,	#	char(8)			NOT NULL			
		$secret,	#	varchar(32)		NOT NULL			
		$ip,		#	varchar(15)		NOT NULL			
		$geo,		#	varchar(100)	NULL			
		$location,	#	varchar(100)	NULL			
		$enable;	#	int(11)			NOT NULL		1	

	public function initialize() {
		# привязка Persons(1)--PersonLogins(*)
		$this->belongsTo('person_id', '\Rainbow\Models\Persons', 'id',
			array('alias' => 'person',
				  'foreignKey' => array('action' => Relation::ACTION_CASCADE)));

		# skipping
		$this->skipAttributesOnCreate(array('geo', 'location', 'enable'));

		parent::initialize();
	}

}