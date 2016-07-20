<?php

namespace Pem\Models;

use \Phalcon\Mvc\Model;
use \Phalcon\Mvc\Model\Relation;

class Milestone extends \Rainbow\Models\BaseObject
{
	private
		// веха обязательно должна быть внутри задачи
		$task_id,		#	int(11)			NOT NULL

		// входные
		$kpr_plan,		#	1. DOUBLE		NULL
		$prpz,			#	2. DOUBLE 		NULL
		$pd,			#	3. DOUBLE 		NULL
		$kpr_fact,		#	4. DOUBLE 		NULL
		$frfz,			#	5. DOUBLE 		NULL
		$fd,			#	6. DOUBLE		NULL

		// расчетные по периоду
		$prfz,			#	7. DOUBLE 		NULL
		$kd,			#	8. DOUBLE 		NULL
		$ks,			#	9. DOUBLE 		NULL
		$kr,			#	10. DOUBLE 		NULL
		$eff;			#	11. DOUBLE 		NULL


	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Initialize
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	public function initialize() {
		$this->setSource('pem_milestone');

		# привязка родителей
		$this->belongsTo('task_id', '\Pem\Models\Task', 'id', [
			'alias' => 'task',
			'foreignKey' => [
				'action' => Relation::ACTION_CASCADE
			]
		]);

		parent::initialize();
	}

	public function toArray($columns = NULL) {

		return [
			// входные показатели
			'kpr_plan'	=> $this->getKprPlan(),
			'prpz'		=> $this->getPrpz(),
			'pd'		=> $this->getPd(),
			'kpr_fact'	=> $this->getKprFact(),
			'frfz'		=> $this->getFrfz(),
			'fd'		=> $this->getFd(),
			// расчетные показатели
			'prfz'		=> $this->getPrfz(),
			'kd'		=> $this->getKd(),
			'ks'		=> $this->getKs(),
			'kr'		=> $this->getKr(),
			'eff'		=> $this->getEff()
		];
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Triggers
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	// Inserting/Updating
	public function beforeValidation() {
		$this->calculate();

		parent::beforeValidation();
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Getters
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	// Входные показатели

	public function getKprPlan() { return $this->kpr_plan; }
	public function getPrpz() { return $this->prpz; }
	public function getPd() { return $this->pd; }
	public function getKprFact() { return $this->kpr_fact; }
	public function getFrfz() { return $this->frfz; }
	public function getFd() { return $this->fd; }

	// Расчетные показатели

	public function getPrfz() { return $this->prfz; }
	public function getKd() { return $this->kd; }
	public function getKs() { return $this->ks; }
	public function getKr() { return $this->kr; }
	public function getEff() { return $this->eff; }

	// Показатели родителя

	public function getKrp() {
		$parent = $this->task;
		if($parent === false)
			return 1.0;
		else
			return $parent->getKrp();
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Setters
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	/**
	 * Обновляет значения из объекта.
	 * Если значение в объекте не указано, вставит null.
	 * Вернет true или int в случае ошибки
	 */
	public function set($data) {
		$this
			->setKprPlan(isset($data->kprp) ? $data->kprp : null)
			->setPrpz(isset($data->prpz) ? $data->prpz : null)
			->setPd(isset($data->pd) ? $data->pd : null)
			->setKprFact(isset($data->kprf) ? $data->kprf : null)
			->setFrfz(isset($data->frfz) ? $data->frfz : null)
			->setFd(isset($data->fd) ? $data->fd : null);

		return true;
	}

	/**
	 * Устанавливает родителя
	 * @return Вернет $this в случае успеха/false в случае ошибки
	 */
	public function setParent($task) {
		if(is_int($task)) {
			$task = Task::findFirst($task);
			if($task === false)
				return false;
		}

		$this->task_id = $task->id;

		return $this;
	}

	// Входные показатели

	public function setKprPlan($value) {
		$this->kpr_plan = is_null($value) ? null : floatval($value);
		return $this;
	}

	public function setPrpz($value) {
		$this->prpz = is_null($value) ? null : floatval($value);
		return $this;
	}

	public function setPd($value) {
		$this->pd = is_null($value) ? null : floatval($value);
		return $this;
	}

	public function setKprFact($value) {
		$this->kpr_fact = is_null($value) ? null : floatval($value);
		return $this;
	}

	public function setFrfz($value) {
		$this->frfz = is_null($value) ? null : floatval($value);
		return $this;
	}

	public function setFd($value) {
		$this->fd = is_null($value) ? null : floatval($value);
		return $this;
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Калькуляция расчетных
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	/**
	 * Выполняет проверку данных.
	 * Вернет true или int в случае ошибки
	 */
	public function validateMe() {
		// 1 правило. Не могут быть оба показателя длительности этапа пустыми
		if(!$this->fd && !$this->pd)
			return 3000;

		// 2 правило. Если указана ПД, то должна быть указана КПРплн
		if($this->pd && !$this->kpr_plan)
			return 3001;

		// Все OK
		return true;
	}

	/**
	 * Выполняет перерасчет данных контрольной точки.
	 * Вернет true или int в случае ошибки
	 */
	public function calculate() {
		// сначала валидация
		$result = $this->validateMe();
		if($result !== true)
			return $result;

		// ПРФЗ
		$this->prfz = (!$this->kpr_plan || is_null($this->kpr_fact) || is_null($this->prpz))
			? 0.0
			: $this->kpr_fact / $this->kpr_plan * $this->prpz;

		// Кд
		if(!$this->fd || is_null($this->pd))
			$this->kd = 0.0;
		else
			$this->kd = ($this->pd > $this->fd)
				? 1.0
				: ($this->pd / $this->fd);

		// Кс
		$this->ks = (!$this->prpz || is_null($this->prfz) || is_null($this->kd))
			? 0.0
			: $this->prfz / $this->prpz * $this->kd;

		// Кр
		$this->kr = (!$this->prfz)
			? 0.0
			: 1 + (1 - $this->frfz / $this->prfz) * $this->getKrp();

		// Эфф
		$this->eff = (is_null($this->ks) || is_null($this->kr))
			? 0.0
			: $this->ks * $this->kr;

		return true;
	}


}
