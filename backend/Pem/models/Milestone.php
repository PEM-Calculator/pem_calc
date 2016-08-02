<?php

namespace Pem\Models;

use \Phalcon\Mvc\Model;
use \Phalcon\Mvc\Model\Relation;

class Milestone extends \Pem\Models\BaseObject
{
	public
		// веха обязательно должна быть внутри задачи
		$task_id,		#	int(11)			NOT NULL

		// входные
		$kpr_plan,		#	1. DOUBLE		NULL
		$prpz,			#	2. DOUBLE 		NULL
		$pd,			#	3. DOUBLE 		NULL
		$kpr_fact,		#	4. DOUBLE 		NULL
		$frfz,			#	5. DOUBLE 		NULL
		$fd,			#	6. DOUBLE		NULL
		$ppr,
		$krp,

		// расчетные по периоду
		$prfz,			#	7. DOUBLE 		NULL
		$kd,			#	8. DOUBLE 		NULL
		$ks,			#	9. DOUBLE 		NULL
		$kr,			#	10. DOUBLE 		NULL
		$eff,			#	11. DOUBLE 		NULL

		// Накопительные показатели
		$sum_kpr_plan,
		$sum_prpz,
		$sum_pd,
		$sum_kpr_fact,
		$sum_frfz,
		$sum_fd,

		// Накопительные расчетные показатели
		$sum_prfz,
		$sum_kd,
		$sum_ks,
		$sum_kr,
		$sum_eff,

		// Прогнозные показатели (forecast)
		$frc_fd,
		$frc_frfz,
		$frc_pr,
		$frc_pre,

		// Показатели отклонения по накопительным (deviation)
		// Абсолютные (absolute)
		$deva_fd,
		$deva_frfz,
		$deva_kpr,

		// Относительные (relative)
		$devr_fd,
		$devr_frfz,
		$devr_kpr;


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
			'kpr_plan'	=> $this->kpr_plan,
			'prpz'		=> $this->prpz,
			'pd'		=> $this->pd,
			'kpr_fact'	=> $this->kpr_fact,
			'frfz'		=> $this->frfz,
			'fd'		=> $this->fd,

			// расчетные показатели
			'prfz'		=> $this->prfz,
			'kd'		=> $this->kd,
			'ks'		=> $this->ks,
			'kr'		=> $this->kr,
			'eff'		=> $this->eff,

			// Накопительные показатели
			'sum_kpr_plan' => $this->sum_kpr_plan,
			'sum_prpz' => $this->sum_prpz,
			'sum_pd' => $this->sum_pd,
			'sum_kpr_fact' => $this->sum_kpr_fact,
			'sum_frfz' => $this->sum_frfz,
			'sum_fd' => $this->sum_fd,

			// Накопительные расчетные показатели
			'sum_prfz' => $this->sum_prfz,
			'sum_kd' => $this->sum_kd,
			'sum_ks' => $this->sum_ks,
			'sum_kr' => $this->sum_kr,
			'sum_eff' => $this->sum_eff,

			// Прогнозные показатели (forecast)
			'frc_fd' => $this->frc_fd,
			'frc_frfz' => $this->frc_frfz,
			'frc_pr' => $this->frc_pr,
			'frc_pre' => $this->frc_pre,

			// Показатели отклонения по накопительным (deviation)
			// Абсолютные (absolute)
			'deva_fd' => $this->deva_fd,
			'deva_frfz' => $this->deva_frfz,
			'deva_kpr' => $this->deva_kpr,

			// Относительные (relative)
			'devr_fd' => $this->devr_fd,
			'devr_frfz' => $this->devr_frfz,
			'devr_kpr' => $this->devr_kpr,
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
		// КРП
		$this->krp = (!$this->ppr)
			? 1.0
			: $this->prpz / $this->ppr;

		// сначала валидация
		$result = $this->validateMe();
		if($result !== true)
			return $result;

		// ПРФЗ
		$this->prfz = (!$this->kpr_plan || is_null($this->kpr_fact) || is_null($this->prpz))
			? null
			: $this->kpr_fact / $this->kpr_plan * $this->prpz;

		// Кд
		if(!$this->fd || is_null($this->pd))
			$this->kd = null;
		else
			$this->kd = ($this->pd >= $this->fd)
				? 1.0
				: ($this->pd / $this->fd);

		// Кс
		$this->ks = (!$this->prpz || is_null($this->prfz) || is_null($this->frfz) || is_null($this->kd))
			? null
			: $this->prfz / $this->prpz * $this->kd;

		// Кр
		$this->kr = (is_null($this->frfz) || is_null($this->kpr_fact)
			? null
			: (!$this->prfz && !$this->frfz
				? 1.0
				: (!$this->prfz
					? null
					: 1 + (1 - $this->frfz / $this->prfz) * $this->krp)));

		// Эфф
		$this->eff = (is_null($this->ks) || is_null($this->kr))
			? null
			: $this->ks * $this->kr;

		return true;
	}


}
