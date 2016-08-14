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
			'kpr_plan'	=> !is_null($this->kpr_plan) ? doubleval($this->kpr_plan) : null,
			'prpz'		=> !is_null($this->prpz) ? doubleval($this->prpz) : null,
			'pd'		=> !is_null($this->pd) ? doubleval($this->pd) : null,
			'kpr_fact'	=> !is_null($this->kpr_fact) ? doubleval($this->kpr_fact) : null,
			'frfz'		=> !is_null($this->frfz) ? doubleval($this->frfz) : null,
			'fd'		=> !is_null($this->fd) ? doubleval($this->fd) : null,

			// расчетные показатели
			'prfz'		=> !is_null($this->prfz) ? doubleval($this->prfz) : null,
			'kd'		=> !is_null($this->kd) ? doubleval($this->kd) : null,
			'ks'		=> !is_null($this->ks) ? doubleval($this->ks) : null,
			'kr'		=> !is_null($this->kr) ? doubleval($this->kr) : null,
			'eff'		=> !is_null($this->eff) ? doubleval($this->eff) : null,

			// Накопительные показатели
			'sum_kpr_plan' => !is_null($this->sum_kpr_plan) ? doubleval($this->sum_kpr_plan) : null,
			'sum_prpz' => !is_null($this->sum_prpz) ? doubleval($this->sum_prpz) : null,
			'sum_pd' => !is_null($this->sum_pd) ? doubleval($this->sum_pd) : null,
			'sum_kpr_fact' => !is_null($this->sum_kpr_fact) ? doubleval($this->sum_kpr_fact) : null,
			'sum_frfz' => !is_null($this->sum_frfz) ? doubleval($this->sum_frfz) : null,
			'sum_fd' => !is_null($this->sum_fd) ? doubleval($this->sum_fd) : null,

			// Накопительные расчетные показатели
			'sum_prfz' => !is_null($this->sum_prfz) ? doubleval($this->sum_prfz) : null,
			'sum_kd' => !is_null($this->sum_kd) ? doubleval($this->sum_kd) : null,
			'sum_ks' => !is_null($this->sum_ks) ? doubleval($this->sum_ks) : null,
			'sum_kr' => !is_null($this->sum_kr) ? doubleval($this->sum_kr) : null,
			'sum_eff' => !is_null($this->sum_eff) ? doubleval($this->sum_eff) : null,

			// Прогнозные показатели (forecast)
			'frc_fd' => !is_null($this->frc_fd) ? doubleval($this->frc_fd) : null,
			'frc_frfz' => !is_null($this->frc_frfz) ? doubleval($this->frc_frfz) : null,
			'frc_pr' => !is_null($this->frc_pr) ? doubleval($this->frc_pr) : null,
			'frc_pre' => !is_null($this->frc_pre) ? doubleval($this->frc_pre) : null,

			// Показатели отклонения по накопительным (deviation)
			// Абсолютные (absolute)
			'deva_fd' => !is_null($this->deva_fd) ? doubleval($this->deva_fd) : null,
			'deva_frfz' => !is_null($this->deva_frfz) ? doubleval($this->deva_frfz) : null,
			'deva_kpr' => !is_null($this->deva_kpr) ? doubleval($this->deva_kpr) : null,

			// Относительные (relative)
			'devr_fd' => !is_null($this->devr_fd) ? doubleval($this->devr_fd) : null,
			'devr_frfz' => !is_null($this->devr_frfz) ? doubleval($this->devr_frfz) : null,
			'devr_kpr' => !is_null($this->devr_kpr) ? doubleval($this->devr_kpr) : null,
		];
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Triggers
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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
		//if($this->pd && !$this->kpr_plan)
		//	return 3001;

		// Все OK
		return true;
	}

	/**
	 * Выполняет перерасчет данных контрольной точки.
	 * Вернет true или int в случае ошибки
	 */
	public function calculate() {
		// КРП
		$krp = doubleval($this->task->krp);
		// КРП берем из таска

		// сначала валидация
		$result = $this->validateMe();
		if($result !== true) {
			return $result;
		}

		// ПРФЗ
		$prfz = (!$this->kpr_plan || is_null($this->kpr_fact) || is_null($this->prpz))
			? null
			: $this->kpr_fact / $this->kpr_plan * $this->prpz;

		// Кд
		if(!$this->fd || !$this->pd) {
			$kd = null;
		}
		else {
			$kd = ($this->pd >= $this->fd) ? 1.0 : ($this->pd / $this->fd);
		}

		//
		// Обработка частных случаев
		//
		if(!$this->kpr_plan) {
			// КПРплан = 0
			if($this->kpr_fact < 0) {
				// КПРплан = 0, КПРфакт < 0
				$ks = 0.0;
			}
			else {
				// КПРплан = 0, КПРфакт >= 0
				$ks = 1.0;
			}
			// Кр
			if(!$this->prpz) {
				if(!$this->frfz) {
					// КПРплан = 0, ПРПЗ = 0, ФРФЗ = 0
					$kr = 1.0;
				}
				else {
					// КПРплан = 0, ПРПЗ = 0, ФРФЗ <> 0
					$kr = 0.0;
				}
			}
			else {
				// КПРплан = 0, ПРПЗ <> 0
				$kr = (!$this->prpz
					? null
					: 1.0 + (1.0 - $this->frfz / $this->prpz) * $krp);
			}
		}
		else {
			// КПРплан > 0
			if(!$this->prpz) {
				// КПРплан > 0, ПРПЗ = 0
				$ks = ($this->kpr_fact / $this->kpr_plan);
				if($this->kpr_fact && !$this->frfz) {
					$kr = 1.0;
				}
				else {
					$kr = 0.0;
				}
			}
			else {
				if(!$this->kpr_fact) {
					// КПРплан > 0, ПРПЗ > 0, КПРфакт = 0
					$ks = 0.0;
					if(!$this->frfz) {
						// КПРплан > 0, ПРПЗ > 0, КПРфакт = 0, ФРФЗ = 0
						$kr = 1.0;
					}
					else {
						// КПРплан > 0, ПРПЗ > 0, КПРфакт = 0, ФРФЗ > 0
						$kr = 0.0;
					}
				}
				else {
					// КПРплан > 0, ПРПЗ > 0, КПРплан <> 0
					$ks = $prfz / $this->prpz * $kd;
					$kr = (!$prfz && !$this->frfz
						? 1.0
						: (!$prfz
							? null
							: 1.0 + (1.0 - $this->frfz / $prfz) * $krp));
				}
			}
		}

		// Эфф
		$eff = (is_null($ks) || is_null($kr))
			? null
			: $ks * $kr;

		$this->krp = $krp;
		$this->prfz = $prfz;
		$this->kd = $kd;
		$this->ks = $ks;
		$this->kr = $kr;
		$this->eff = $eff;

		return true;
	}


}
