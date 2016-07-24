<?php

use \Phalcon\Mvc\Model;
use \Phalcon\Mvc\Model\Relation;

class Projects extends \Pem\Models\BaseObject
{
	const
		DATE_UNIT_DAY	= 'day',
		DATE_UNIT_WEEK	= 'week',
		DATE_UNIT_MONTH	= 'month',
		DATE_UNIT_YEAR	= 'year';

	public static
		$RUS_DATE_UNIT = [
			self::DATE_UNIT_DAY		=> 'ежедневно',
			self::DATE_UNIT_WEEK	=> 'еженедельно',
			self::DATE_UNIT_MONTH	=> 'ежемесячно',
			self::DATE_UNIT_YEAR	=> 'ежегодно'
		];

	public static
		$CASCADE_RECALCULATE = true;

	private
		$parent_id,			#	int(11)			NULL
		$name,				#	varchar(100)	NOT NULL
		$description,		#	text			NULL

		//
		// единицы результата
		//

		// единица измерения результата
		$result_unit,		#	varchar(100)	NOT NULL
		// плановое количество результата
		$plan_result,		#	double 			NULL
		// фактическое количество результата
		$fact_result,		#	double 			NULL

		//
		// даты
		//

		// старт, финиш
		$min_date,			#	timestamp 		NULL
		$max_date,			#	timestamp 		NULL
		// единица измерения (hour, day, week, month, year)
		$date_unit,			#	varchar(10) 	NOT NULL
		// плановая продолжительность
		$plan_date_length,	#	double			NULL
		// текущая дата (дата отчета)
		$fact_date,			#	timestamp 		NULL
		// фактическая продолжительность
		$fact_date_length,	#	double			NULL
		// прогноз окончания
		$frc_date,			#	timestamp 		NULL
		// проноз продолжительности
		$frc_date_length,	#	double			NULL

		//
		// расходы
		// double, NOT NULL
		//

		// план. расходы плановой задачи
		$prpz,
		// план. расходы фактической задачи
		$prfz,
		// факт. расходы факт. задачи
		$frfz,
		// прогноз ФРФЗ
		$frc_frfz,
		// план. расход на план. результат
		$prpr,
		// планируемая прибыль по результату проекта
		$ppr,
		// прогноз ППР
		$frc_ppr,

		//
		// расчетные величины
		// double, NOT NULL
		//

		// коэф эффективности
		$eff,
		// коэф длительности выполнения
		$kd,
		// коэф эффективности по сроку
		$ks,
		// коэф эффективности по расходу
		$kr,
		// ключевой показатель проекта
		$kpr;

	public function initialize() {
		# привязка Menus(1)--Menus(*)
		$this->hasMany('id', 'Projects', 'parent_id', [
			'alias' => 'items',
			'foreignKey' => [
				'action' => Relation::ACTION_CASCADE
			]
		]);

		$this->belongsTo('parent_id', 'Projects', 'id', [
			'alias' => 'parent',
			'foreignKey' => [
				'action' => Relation::ACTION_CASCADE
			]
		]);

		# skipping
		$this->skipAttributesOnCreate(['parent_id', 'description',
			'min_date', 'max_date', 'plan_date_length', 'fact_date',
			'fact_date_length', 'frc_date', 'frc_date_length',
			'prpz', 'prfz', 'frc_frfz', 'prpr', 'ppr', 'frc_ppr',
			'eff', 'kd', 'ks', 'kr', 'kpr']);

		parent::initialize();
	}

	public function toArray($columns = NULL, $canEdit = false) {
		$result = [
			'id'		=> $this->id,
			'parent_id' => $this->parent_id,
			'name'		=> $this->name,
			'description'	=> $this->description,
			'result_unit'	=> $this->result_unit,
			'plan_result'	=> $this->plan_result,
			'fact_result'	=> $this->fact_result,
			'min_date'		=> $this->min_date,
			'max_date'		=> $this->max_date,
			'date_unit'		=> $this->date_unit,
			'plan_date_length'	=> $this->plan_date_length,
			'fact_date'			=> $this->fact_date,
			'fact_date_length'	=> $this->fact_date_length,
			'frc_date'			=> $this->frc_date,
			'frc_date_length'	=> $this->frc_date_length,
			'prpz'		=> $this->prpz,
			'prfz'		=> $this->prfz,
			'frfz'		=> $this->frfz,
			'frc_frfz'	=> $this->frc_frfz,
			'prpr'		=> $this->prpr,
			'ppr'		=> $this->ppr,
			'frc_ppr'	=> $this->frc_ppr,
			'eff'		=> $this->eff,
			'kd'		=> $this->kd,
			'ks'		=> $this->ks,
			'kr'		=> $this->kr,
			'kpr'		=> $this->kpr
		];

		$result['min_date_text'] = 'с ' . date('d.m.Y', $this->min_date);
		$result['max_date_text'] = 'по ' . date('d.m.Y', $this->max_date);
		$result['date_unit_text'] = self::$RUS_DATE_UNIT[$this->date_unit];
		$result['eff_text'] = number_format($this->eff, 2, ',', '');
		$result['ks_text'] = number_format($this->ks, 2, ',', '');
		$result['kr_text'] = number_format($this->kr, 2, ',', '');

		// разрешения на редактирование
		$hasParent = !is_null($this->parent_id);
		$hasItems = count($this->getItems()) > 0;

		if($canEdit)
			$result['can_edit'] = [
				'name' 			=> true,
				'description'	=> true,
				'min_date'		=> !$hasItems,
				'max_date'		=> !$hasItems,
				'date_unit'		=> !$hasParent,
				'prpz'		=> !$hasItems,
				'prfz'		=> !$hasItems,
				'frfz'		=> !$hasItems,
			];

		return $result;
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Triggers
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	// Inserting
	public function beforeValidationOnCreate() {
		# проверяю значения
		if(is_null($this->result_unit))
			$this->setResultUnit('$');

		if(is_null($this->date_unit))
			$this->setDateUnit(self::DATE_UNIT_DAY);

		parent::beforeValidationOnCreate();
	}

	// Перед сохранением конвертирую даты
	public function beforeSave()
	{
		if(!is_null($this->min_date))
			$this->min_date = date('Y-m-d', $this->min_date);

		if(!is_null($this->max_date))
			$this->max_date = date('Y-m-d', $this->max_date);

		if(!is_null($this->fact_date))
			$this->fact_date = date('Y-m-d', $this->fact_date);

		parent::beforeSave();
	}

	// После получения данных конвертирую даты
	public function afterFetch()
	{
		if(!is_null($this->min_date))
			$this->min_date = strtotime($this->min_date);

		if(!is_null($this->max_date))
			$this->max_date = strtotime($this->max_date);

		if(!is_null($this->fact_date))
			$this->fact_date = strtotime($this->fact_date);

		parent::afterFetch();
	}

	// После сохранения конвертирую обратно
	public function afterSave()
	{
		// Convert the string to an array
		if(!is_null($this->min_date))
			$this->min_date = strtotime($this->min_date);

		if(!is_null($this->max_date))
			$this->max_date = strtotime($this->max_date);

		if(!is_null($this->fact_date))
			$this->fact_date = strtotime($this->fact_date);

		parent::afterSave();
	}

	// Выполняет валидацию данных
	// Проверяются все данные
	public function validateData() {

	}

	// Выполняет перерасчет данных проекта
	// Этот метод вызывается при изменении данных,
	// а также этот метод должны вызывать дочерние проекты
	// при изменении своих данных
	public function recalculate() {
		$oldFlag = self::$CASCADE_RECALCULATE;
		self::$CASCADE_RECALCULATE = false;

		$this->loadData();
		$this->calcDateLength();

		$this->calcKs();
		$this->calcKd();
		$this->calcKr();
		$this->calcKpr();

		$this->calcEff();

		$this->calcForecastDateLength();
		$this->calcForecastfrfz();
		$this->calcForecastPpr();

		self::$CASCADE_RECALCULATE = $oldFlag;

		// сообщаем родителю, что произошло изменение данных
		if($this->parent !== false) {
			$this->parent->recalculate();
			$this->parent->save();
		}
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Private
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	// метода заружает данные из дочерних проектов
	public function loadData() {
		$items = $this->getItems();
		if(count($items) == 0)
			return;

		// минимальная и максимальная даты дочерних проекта
		$min_date = 0;
		$max_date = 0;

		// суммарные показатели
		$prpz = 0.0;
		$prfz = 0.0;
		$frfz = 0.0;

		// средние показатели
		$eff_summ = 0.0;
		$kr_sum = 0.0;
		$ks_sum = 0.0;
		$kd_sum = 0.0;

		// перебор
		foreach($items as $item) {
			// даты
			if($min_date == 0)
				$min_date = $item->min_date;
			else
				$min_date = min($min_date, $item->min_date);
			$max_date = max($max_date, $item->max_date);

			// суммарные показатели
			$prpz += $item->prpz;
			$prfz += $item->prfz;
			$frfz += $item->frfz;

			// средние показатели
			$eff_sum = $item->eff;
			$kr_sum = $item->kr;
			$ks_sum = $item->ks;
			$kd_sum = $item->kd;
		}

		$count = count($items);
		$eff = $eff_sum / $count;
		$kr = $kr_sum / $count;
		$ks = $ks_sum / $count;
		$kd = $kd_sum / $count;

		// назначаю новые значения
		$this->setMinDate($min_date);
		$this->setMaxDate($max_date);

		$this->prpz = $prpz;
		$this->prfz = $prfz;
		$this->frfz = $frfz;

		$this->eff = $eff;
		$this->kr = $kr;
		$this->ks = $ks;
		$this->kd = $kd;
	}

	// расчет КС (коэф эффективности по сроку выполнения)
	// учавствует в формулах Э, ФРПЗпргн
	private function calcKs() {
		if($this->prpz == 0)
			$this->ks = 0;
		else
			$this->ks = ($this->prfz / $this->prpz) * $this->kd;

		if(self::$CASCADE_RECALCULATE) {
			$this->calcForecastfrfz();
			$this->calcEff();
		}
	}

	// расчет КД (коф эфф длительности выполнения)
	// учавствует в формуле КС
	private function calcKd() {
		if($this->plan_date_length > $this->fact_date_length)
			$this->kd = 1.0;
		elseif($this->fact_date_length == 0)
			$this->kd = 0.0;
		else
			$this->kd = $this->plan_date_length / $this->fact_date_length;

		if(self::$CASCADE_RECALCULATE)
			$this->calcKs();
	}

	// расчет КР (коэф эфф по расходу)
	// учавствует в формулах Э, ФРПЗпргн
	private function calcKr() {
		if($this->prfz == 0)
			$this->kr = 0;
		else
			$this->kr = 1 + (1 - $this->frfz / $this->prfz) * $this->kpr;

		if(self::$CASCADE_RECALCULATE) {
			$this->calcForecastfrfz();
			$this->calcEff();
		}
	}

	// расчет КПР (ключевой показатель проекта)
	// учавствует в формулах Э, ФРПЗпргн
	private function calcKpr() {
		if(is_null($this->prpr) || is_null($this->ppr))
			$this->kpr = 1.0;
		else
			$this->kpr = $this->prpr / $this->ppr;

		if(self::$CASCADE_RECALCULATE) {
			$this->calcForecastfrfz();
			$this->calcEff();
		}
	}

	// расчет Э (эффективности выполнения)
	// учавствует в формуле ППРпргн
	private function calcEff() {
		$this->eff = $this->ks * $this->kr;

		if(self::$CASCADE_RECALCULATE) {
			$this->calcForecastPpr();
		}
	}

	//
	//	Даты

	// расчет плановой продолжительности
	private function calcDateLength() {
		$len = $this->max_date - $this->min_date;
		$days = $len / (24*60*60) + 1;
		$this->plan_date_length = $days;
	}

	//
	//	Прогнозы

	// расчет ФДпргн (прогноза фактической даты выполнения)
	private function calcForecastDateLength() {
		if($this->fact_date_length == 0)
			$v = 1.0;
		else
			$v = $this->plan_date_length / $this->fact_date_length;
		$this->setForecastDate($v);
	}

	// расчет ФРФЗпргн (прогноз расхода на выполнение задачи за весь период)
	private function calcForecastFrfz() {
		$v = $this->prpz * (1 - ($this->kr - 1) / $this->kpr);
		$this->setForecastFrfz($v);
	}

	// расчет ППРпргн (прогноз общей фактической прибыли по завершению задачи)
	private function calcForecastPpr() {
		$v = $this->prpz * $this->eff;
		$this->setForecastPpr($v);
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Getters
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	// Родительский проект
	public function getParent() { return $this->parent; }

	// Дочерние проекты
	public function getItems() { return $this->items; }

	// Имя
	public function getName() { return $this->name; }

	// Описание
	public function getDescription() { return $this->description; }

	//
	//	Единицы измерения

	public function getDateUnit() { return $this->date_unit; }
	public function getResultUnit() { return $this->result_unit; }

	//
	//	Результат

	public function getPlanResult() { return $this->plan_result; }
	public function getFactResult() { return $this->fact_result; }

	//
	//	Даты

	public function getMinDate() { return $this->min_date; }
	public function getMaxDate() { return $this->max_date; }
	public function getPlanDateLength() { return $this->plan_date_length; }
	public function getFactDate() { return $this->fact_date; }
	public function getFactDateLength() { return $this->fact_date_length; }
	public function getForecastDate() { return $this->frc_date; }
	public function getForecastDateLength() { return $this->frc_date_length; }

	//
	//	Расходы

	public function getPrpz() { return $this->prpz; }
	public function getPrfz() { return $this->prfz; }
	public function getFrfz() { return $this->frfz; }
	public function getForecastfrfz() { return $this->frc_frfz; }
	public function getPrpr() { return $this->prpr; }
	public function getPpr() { return $this->ppr; }
	public function getForecastPpr() { return $this->frc_ppr; }

	//
	// 	Расчетные

	public function getEff() { return $this->eff; }
	public function getKd() { return $this->kd; }
	public function getKs() { return $this->ks; }
	public function getKr() { return $this->kr; }
	public function getKpr() { return $this->kpr; }


	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Setters
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	// Устанавливает родителя
	// Можно передать как объект Projects так и номер проекта
	public function setParent($parent) {
		if(is_int($parent))
		{
			$parent = $this->findFirst($parent);
			if($parent === false)
				return false;
		}

		$this->parent_id = is_null($parent) ? null : $parent->id;
	}

	// Добавляет дочерней проект
	public function addItem($childProject) {
		$childProject->setParent($this);
	}

	// Название
	public function setName($value) {
		$this->name = $value;
	}

	// Описание
	public function setDescription($value) {
		$this->description = $value;
	}

	//
	//	Единицы измерения
	//

	public function setDateUnit($value) {
		$this->date_unit = $value;

		// TODO: перерасчет данных
	}

	public function setResultUnit($value) {
		$this->result_unit = $value;
	}

	//
	//	Результат
	//

	public function setPlanResult($value) {
		$this->plan_result = $value;

		// TODO: изменение процента выполнения
	}

	public function setFactResult() {
		$this->fact_result = $value;

		// TODO: изменение процента выполнения
	}

	//
	//	Даты
	//

	public function setMinDate($date) {
		$this->min_date = $date;

		// TODO: нужен перерасчет
		// TODO: нужен перерасчет план продолжительности
	}

	public function setMaxDate($date) {
		$this->max_date = $date;

		// TODO: нужен перерасчет
		// TODO: нужен перерасчет план продолжительности
	}

	public function setPlanDateLength($value) {
		$this->plan_date_length = $value;

		// TODO: нужен перерасчет
		// TODO: нужен перерасчет максимальной план даты
	}

	public function setFactDate($date) {
		$this->fact_date = $date;

		// TODO: нужен перерасчет
		// TODO: нужен перерасчет факт продолжительности
	}

	public function setFactDateLength($value) {
		$this->fact_date_length = $value;

		// TODO: нужен перерасчет
		// TODO: нужен перерасчет максимальной факт даты
	}

	//
	//	Прогнозы
	//

	public function setForecastDate($date) {
		$this->frc_date = $date;
	}

	public function setForecastDateLength($value) {
		$this->frc_date_length;
	}

	public function setForecastFrfz($value) {
		$this->frc_frfz = $value;
	}

	public function setForecastPpr($value) {
		$this->frc_ppr = $value;
	}
}
