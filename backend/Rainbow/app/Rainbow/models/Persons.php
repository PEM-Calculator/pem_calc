<?php

namespace Rainbow\Models;

use \Phalcon\Mvc\Model;
use \Phalcon\Mvc\Model\Relation;

class Persons extends BaseObject
{
	public
		$username,		#	varchar(20)	NOT NULL	UNIQUE
		$email,			#	varchar(40)	NOT NULL	UNIQUE
		$password,		#	varchar(60)	NOT NULL
		$admin,			#	int(11)	NOT NULL		0
		$name,			#	varchar(50)	NULL
		$middlename,	#	varchar(50)	NULL
		$surname,		#	varchar(50)	NULL
		$birthday,		#	date		NULL
		$phone,			#	varchar(50)	NULL
		$location;		#	varchar(50)	NULL

	public function initialize() {
		# skipping
		$this->skipAttributesOnCreate(array('admin', 'name', 'middlename', 'surname', 'birthday', 'phone', 'location'));

		parent::initialize();
	}

}