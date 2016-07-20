<?php

namespace Rainbow\Models;

use \Phalcon\Mvc\Model;
use \Phalcon\Mvc\Model\Relation;

class Configs extends Model
{
	public
		$id,		#	int(11)	NOT NULL	PRIMARY		
		$created,	#	timestamp	NOT NULL		CURRENT_TIMESTAMP	
		$updated,	#	timestamp	NULL			
		$key,		#	varchar(50)	NOT NULL	UNIQUE		
		$value;		#	text	NOT NULL

	public function initialize() {
		# use dynamic
		$this->useDynamicUpdate(true);

		# skipping
		$this->skipAttributesOnCreate(array('id'));
	}

	public function beforeSave() {
		# set updated before update
		$this->updated = date('Y-m-d H:i:s');
	}
}