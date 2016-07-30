<?php

namespace Pem\Models;

use \Phalcon\Mvc\Model;
use \Phalcon\Mvc\Model\Relation;
use \Phalcon\Mvc\Model\Transaction\Failed as TxFailed;
use \Phalcon\Mvc\Model\Transaction\Manager as TxManager;

class Calculation extends \Pem\Models\BaseObject
{
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Const
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	const RESULT_MESSAGES = [
		// ошибки класса Calculation
		1000 => 'Has no data',
		1001 => 'Has no goals',
		1002 => 'Has no tasks',
		1003 => 'Has no milestones',
		1010 => 'Error while create new Calculation',
		// ошибки класса Tasks

		// ошибки класса Milestones
		3000 => 'Plan date and fact date cannot be null at same time',
		3001 => 'KPRplan is not defined when PD is defined',
	];

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Properties
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Initialize
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	public function initialize() {
		# привязка детей
		$this->hasMany('id', 'Pem\Models\Task', 'calculation_id', [
			'alias' => 'tasks',
			'foreignKey' => [
				 'action' => Relation::ACTION_CASCADE
			]
		]);

		parent::initialize();
	}

	public function getSource()
	{
		return 'pem_calculation';
	}

	public function toArray($columns = NULL) {
		return [
			'id'	=> $this->id,
			'tasks'	=> $this->getItemsArray(),
		];
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Triggers
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	// Updating
	public function beforeValidationOnUpdate() {
		foreach($this->getTasks() as $task) {
			$task->calculate();
			$task->save();
		}
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Getters
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	// Ссылки

	public function getItemsArray() {
		$result = [];
		foreach($this->getTasks() as $task)
			$result[] = $task->toArray();
		return $result;
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Setters
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	public function addItem($task = null) {
		if(empty($task))
			$task = new Task();
		$task->setParent($this);
		return $task;
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Public
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Private
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//
	//		Static
	//
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	// Создает новую калькуляцию и выполняет расчет задач
	// object - результат, ошибок не возникло
	// int - код ошибки, произошла ошибка
	public static function createCalculation($data)
	{
		if(!isset($data) || !$data)
			return 1000;

		if(!isset($data->tasks) || !$data->tasks)
			return 1002;

		// парсинг данных
		$calc = new Calculation();

		// Стартую транзакцию
		$db = $calc->getDI()->get('db');
		$db->begin();

		// надо получить id
		// PS. Модель без полей, создастся нормально, если таблица существует
		$calc->create();

		foreach($data->tasks as $taskData) {
			// проверка целевых показателей
			if(!isset($taskData->goal) || !$taskData->goal) {
				// откат
				$db->rollback();
				return 1001;
			}

			// проверка этапов
			if(!isset($taskData->periods) || !$taskData->periods || !count($taskData->periods)) {
				// откат
				$db->rollback();
				return 1002;
			}

			// создаю задачу, полчаю id
			$task = $calc->addItem();

            $task->kpr = $taskData->goal->kpr;
            $task->ppr = $taskData->goal->ppr;
            $task->prpz = $taskData->goal->prpz;
            $task->pd = $taskData->goal->pd;

			$task->create();

			// показатели по периодам
			foreach($taskData->periods as $period) {
				$milestone = $task->addItem();
				$result = $milestone->set($period);

				if($result !== true) {
					// откат
					$db->rollback();
					return $result;
				}

				// сразу создаю, чтобы связи обновились
				$milestone->create();
			}

			// сохраняю связи
			$task->save();
		}

		// сохраняю результаты работы
		$result = $calc->save();

		// транзакция прошла успешно
		$db->commit();

		#print_r('calc->toArray', $calc->toArray());
		#print_r('items->toArray', $calc->toArray()['tasks'][0]['items']);

		return $calc;
	}
}
