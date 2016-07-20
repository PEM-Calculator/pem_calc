<?php

namespace Pem\Models;

#use \Phalcon\Mvc\Model;
use \Phalcon\Mvc\Model\Relation;

class Task extends \Rainbow\Models\BaseObject
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

	private
		// ссылки
		$calculation_id,

		// Целевые показатели
		$kpr,			#	1.	DOUBLE 		NOT NULL
		$prpz,			#	2.	DOUBLE 		NOT NULL
		$ppr,			#	3.	DOUBLE 		NULL
		$krp,			#	4.	DOUBLE 		NOT NULL
		$pd,			#	5.	DOUBLE		NOT NULL

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
		$result = [
			// целевые показатели
			'kpr'		=> $this->getKpr(),
			'prpz'	=> $this->getPrpz(),
			'ppr'		=> $this->getPpr(),
			'krp'		=> $this->getKrp(),
			'pd'		=> $this->getPd(),
		];

		$periods = $this->getMilestones();

		if(count($periods)) {
			$lp = $periods[count($periods)-1];
			// показатели последнего периода
			$result += [
				'prfz'	=> $lp->getPrfz(),
				'kd'		=> $lp->getKd(),
				'ks'		=> $lp->getKs(),
				'kr'		=> $lp->getKr(),
				'eff'		=> $lp->getEff(),
			];
			// суммарные показатели по периодам
			$result += [
				'skprp'	=> $this->sum_kpr_plan,
				'sprpz'	=> $this->sum_prpz,
				'spd'		=> $this->sum_pd,
				'skprf'	=> $this->sum_kpr_fact,
				'sfrfz'	=> $this->sum_frfz,
				'sfd'		=> $this->sum_fd,
				'sprfz'	=> $this->sum_prfz,
				'skd'		=> $this->sum_kd,
				'sks'		=> $this->sum_ks,
				'skr'		=> $this->sum_kr,
				'seff'	=> $this->sum_eff,
			];
		}

		// прогнозы
		$result += [
			'ffd'		=> $this->frc_fd,
			'ffrfz'	=> $this->frc_frfz,
			'fpr'		=> $this->frc_pr,
			'fpre'	=> $this->frc_pre,
		];

		if(count($periods)) {
			// погрешности по последнему периоду
			$result += [
				'dafd'	=> $this->deva_fd,
				'dafrfz'	=> $this->deva_frfz,
				'dakpr'	=> $this->deva_kpr,
				'drfd'	=> $this->devr_fd,
				'drfrfz'	=> $this->devr_frfz,
				'drkpr'	=> $this->devr_kpr,
			];

			$result += [
				'items'	=> $this->getItemsArray(),
			];
		}

		return $result;
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

	// Целевые показатели

	public function getKpr() { return $this->kpr; }
	public function getPrpz() { return $this->prpz; }
	public function getPpr() { return $this->ppr; }
	public function getKrp() { return $this->krp; }
	public function getPd() { return $this->pd; }

	// Накопительные
	/*
	public function getSumPrpz() { return $this->sum_prpz; }
	public function getSumPrfz() { return $this->sum_prfz; }
	public function getSumFrfz() { return $this->sum_frfz; }
	public function getSumPd() { return $this->sum_pd; }
	public function getSumFd() { return $this->sum_fd; }

	// Расчетные накопительные

	public function getKd() { return $this->kd; }
	public function getKs() { return $this->ks; }
	public function getKr() { return $this->kr; }
	public function getEff() { return $this->eff; }

	// Прогнозы

	public function getForecastFd() { return $this->forecast_fd; }
	public function getForecastFrfz() { return $this->forecast_frfz; }
	public function getForecastFpr() { return $this->forecast_fpr; }
	*/

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Setters
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	public function set($data) {
		$this
			->setKpr($data->kpr)
			->setPrpz($data->prpz)
			->setPpr($data->ppr)
			->setPd($data->pd);

		$this->calculate();

		return $this;
	}

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
		// КРП
		$this->krp = (!$this->ppr)
			? 1.0
			: $this->prpz / $this->ppr;

		return true;
	}

	/**
	 * Вызываю calculate для кт
	 */
	public function calculateItems() {
		foreach($this->getMilestones() as $ms) {
			$result = $ms->calculate();
			$ms->save();
			if($result !== true) return $result;
		}

		return true;
	}

	/**
	 * Обновляю нарастающие показатели
	 */
	public function calculateSummaries() {
		$kpr_plan = 0.0;
		$prpz = 0.0;
		$pd = 0.0;
		$kpr_fact = 0.0;
		$frfz = 0.0;
		$fd = 0.0;
		$prfz = 0.0;

		foreach($this->getMilestones() as $ms) {
			$kpr_plan += $ms->getKprPlan();
			$prpz += $ms->getPrpz();
			$pd += $ms->getPd();
			$kpr_fact += $ms->getKprFact();
			$frfz += $ms->getFrfz();
			$fd += $ms->getFd();
			$prfz += $ms->getPrfz();
		}

		if(!$fd)
			$kd = null;
		else
			$kd = ($pd > $fd) ? 1.0 : $pd / $fd;

		$ks = (!$prpz) ? null : ($prfz / $prpz * $kd);
		$kr = (!$prfz) ? null : (1 + (1 - $frfz / $prfz) * $this->krp);
		$eff = (is_null($ks) || is_null($kr)) ? null : ($ks * $kr);

		// Накопительные показатели
		$this->sum_kpr_plan = $kpr_plan;
		$this->sum_prpz = $prpz;
		$this->sum_pd = $pd;
		$this->sum_kpr_fact = $kpr_fact;
		$this->sum_frfz = $frfz;
		$this->sum_fd = $fd;

		// Накопительные расчетные показатели
		$this->sum_prfz = $prfz;
		$this->sum_kd = $kd;
		$this->sum_ks = $ks;
		$this->sum_kr = $kr;
		$this->sum_eff = $eff;

		// Прогнозные показатели (forecast)
		$this->frc_fd = ($this->sum_ks ? $this->pd / $this->sum_ks : 0.0);
		$this->frc_frfz = $this->prpz * (1 - ($this->sum_kr - 1) / $this->krp);
		$this->frc_pr = $this->ppr * $this->sum_kr;
		$this->frc_pre = $this->ppr * $this->sum_eff;

		// Показатели отклонения по накопительным (deviation)
		// Абсолютные (absolute)
		$this->deva_fd = ($this->pd > $this->sum_fd ? 0.0 : $this->pd - $this->sum_fd);
		$this->deva_frfz = $this->prpz - $this->sum_frfz;
		$this->deva_kpr = $this->kpr - $this->sum_kpr_fact;
		// Относительные (relative)
		$this->devr_fd = $this->deva_fd / $this->pd;
		$this->devr_frfz = $this->deva_frfz / $this->prpz;
		$this->devr_kpr = $this->deva_kpr / $this->kpr;

		return true;
	}

	// Выполняю полный пересчет данных для задачи
	public function calculateAll() {
		$result = $this->calculate();
		if($result !== true) return $result;

		$result = $this->calculateItems();
		if($result !== true) return $result;

		$result = $this->calculateSummaries();
		if($result !== true) return $result;

		return true;
	}
}
