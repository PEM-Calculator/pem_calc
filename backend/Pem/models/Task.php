<?php

namespace Pem\Models;

#use \Phalcon\Mvc\Model;
use \Phalcon\Mvc\Model\Relation;

class Task extends \Pem\Models\BaseObject
{
	const
		DATE_UNIT_DAY		= 'day',
		DATE_UNIT_WEEK		= 'week',
		DATE_UNIT_MONTH		= 'month',
		DATE_UNIT_QUARTER	= 'quarter',
		DATE_UNIT_YEAR		= 'year';

	public static
		$RUS_DATE_UNIT = [
			self::DATE_UNIT_DAY		=> 'ежедневно',
			self::DATE_UNIT_WEEK	=> 'еженедельно',
			self::DATE_UNIT_MONTH	=> 'ежемесячно',
			self::DATE_UNIT_QUARTER	=> 'ежеквартально',
			self::DATE_UNIT_YEAR	=> 'ежегодно',
		];

	public
		// ссылки
		$calculation_id;

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Initialize
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	public function initialize() {
		$this->setSource('pem_task');

		# привязка детей
		$this->hasMany('id', '\Pem\Models\Milestone', 'task_id', [
			'alias' => 'milestones',
			'foreignKey' => [
				'action' => Relation::ACTION_CASCADE
			]
		]);

		# привязка родителей
		$this->belongsTo('caclulation_id', '\Pem\Models\Calculation', 'id', [
			'alias' => 'parentCalculation',
			'foreignKey' => [
				'action' => Relation::ACTION_CASCADE
			]
		]);

		# skipping
		$this->skipAttributesOnCreate(['caclulation_id', 'ppr']);

		parent::initialize();
	}

	public function toArray($columns = NULL) {
		return $this->getItemsArray();
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

	// Ссылки

	public function getItemsArray() {
		$result = [];
		foreach($this->getMilestones() as $ms)
			$result[] = $ms->toArray();
		return $result;
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Setters
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	// Устанавливает родителя
	// Можно передать как объект Calculation так и id
	// Не должно быть null
	public function setParent($calculation) {
		if(is_int($calculation)) {
			$task = Calculation::findFirst($calculation);
			if($calculation === false)
				return false;
		}

		$this->calculation_id = $calculation->id;

		return $this;
	}

	public function addItem($milestone = null) {
		if(empty($milestone))
			$milestone = new Milestone();
		$milestone->setParent($this);
		return $milestone;
		#return (new Milestone())->setParent($this);
	}

	//	Целевые показатели

	public function setKpr($value) {
		$this->kpr = floatval($value);
		return $this;
	}

	public function setPrpz($value) {
		$this->prpz = floatval($value);
		return $this;
	}

	public function setPpr($value) {
		$this->ppr = floatval($value);
		return $this;
	}

	public function setPd($value) {
		$this->pd = floatval($value);
		return $this;
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Калькуляция расчетных
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	/**
	 * Выполняет перерасчет данных задачи.
	 * Вернет true или int в случае ошибки
	 */
	public function calculate() {
		$result = $this->calculateItems();
		if($result !== true) return $result;

		return true;
	}

	/**
	 * Обновляю нарастающие показатели
	 */
	public function calculateItems() {
		$E_kpr_plan = 0.0;
		$E_prpz = 0.0;
		$E_pd = 0.0;
		$E_kpr_fact = 0.0;
		$E_frfz = 0.0;
		$E_fd = 0.0;
		$E_prfz = 0.0;

		// по каждой КТ суммирую и считаю
		foreach($this->getMilestones() as $ms) {
			$result = $ms->calculate();
			if($result !== true) return $result;

			$E_kpr_plan += $ms->kpr_plan;
			$E_prpz += $ms->prpz;
			$E_pd += $ms->pd;
			$E_kpr_fact += $ms->kpr_fact;
			$E_frfz += $ms->frfz;
			$E_fd += $ms->fd;
			$E_prfz += $ms->prfz;

			// расчет промежуточных итогов для каждой вехи
			if(!$E_fd) {
				$kd = null;
			}
			else {
				$kd = ($E_pd > $E_fd) ? 1.0 : $E_pd / $E_fd;
			}

			$ks = (!$E_prpz) ? null : ($E_prfz / $E_prpz * $kd);
			$kr = (!$E_prfz) ? null : (1 + (1 - $E_frfz / $E_prfz) * $ms->krp);
			$eff = (is_null($ks) || is_null($kr)) ? null : ($ks * $kr);

			// запоминаю суммарные
			$ms->sum_kpr_plan = $E_kpr_plan;
			$ms->sum_prpz = $E_prpz;
			$ms->sum_pd = $E_pd;
			$ms->sum_kpr_fact = $E_kpr_fact;
			$ms->sum_frfz = $E_frfz;
			$ms->sum_fd = $E_fd;

			//
			$ms->sum_prfz = $E_prfz;
			$ms->sum_kd = $kd;
			$ms->sum_ks = $ks;
			$ms->sum_kr = $kr;
			$ms->sum_eff = $eff;

			// прогнозные показатели (forecast)
			$ms->frc_fd = ($ks ? $ms->pd / $ks : 0.0);
			$ms->frc_frfz = $ms->prpz * (1 - ($kr - 1) / $ms->krp);
			$ms->frc_pr = $ms->ppr * $kr;
			$ms->frc_pre = $ms->ppr * $eff;

			// показатели отклонения по накопительным (deviation)
			// абсолютные (absolute)
			$ms->deva_fd = ($ms->pd > $ms->sum_fd ? 0.0 : $ms->pd - $ms->sum_fd);
			$ms->deva_frfz = $ms->prpz - $ms->sum_frfz;
			$ms->deva_kpr = $ms->kpr_plan - $ms->sum_kpr_fact;

			// относительные (relative)
			$ms->devr_fd = $ms->deva_fd / $ms->pd;
			$ms->devr_frfz = $ms->deva_frfz / $ms->prpz;
			$ms->devr_kpr = $ms->deva_kpr / $ms->kpr_plan;

			// сохраняю КТ
			$ms->save();
		}

		return true;
	}
}
