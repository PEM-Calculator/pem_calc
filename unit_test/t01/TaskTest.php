<?php

use \Pem\Models\Task;
use \Pem\Models\Milestone;

class TaskTest extends PHPUnit_Framework_TestCase
{
	/**
	 * Проверка создания объекта
	 */
	public function testCreateAndDelete() {
		# проверка создания объекта
		$task = new Task();
		$this->assertInstanceOf('\Pem\Models\Task', $task);
	}
	
	public function testCalculation1() {
		# создаю задачу
		$task = (new Task())
			->setKpr(80)
			->setPrpz(100)
			->setPpr(800)
			->setPd(185);
		
		# сохраняю задачу
		$saved = $task->save();
		if(!$saved)
			$this->assertTrue($saved, $task->getMessages()[0]->getMessage());
		
		# создаю КТ в задаче
		$task->addItem()
			->setKprPlan(10.0)
			->setPrpz(100.0)
			->setPd(1.0)
			->setKprFact(100.0)
			->setFrfz(100.0)
			->setFd(1.0)
			->save();
		
		/**
		 * @todo Тест делать дальше тут!
		 */
		$ms = $task->milestones[0];
		var_dump(3, $ms->prfz, $ms == $task->milestones[0]);
		
		# сохраняю веху
		$saved = $ms->save();
		if(!$saved)
			$this->assertTrue($saved, $ms->getMessages()[0]->getMessage());
		
		# проверю количество
		$this->assertEquals(1, $task->countMilestones());
		
		# еще раз сохраняем, перед сохранением выполнятся расчеты
		$task->save();
		
		var_dump(4, $ms->prfz, $ms == $task->milestones[0]);
		
		# проверю расчеты
		#var_dump($ms->toArray());
		var_dump(5, $task->milestones[0]->prfz);
		#var_dump($task->toArray());
		
		# просто удалю задачу, вехи тоже удалятся
		/*$deleted = $task->delete();
		if(!$deleted)
			$this->assertTrue($deleted, $task->getMessages()[0]->getMessage());
		*/
	}
	
	public function testCalculation2() {
		/*$ms = new Milestone();
		
		$ms
			->setKprPlan(80.0)
			->setPrpz(100.0)
			->setPd(185.0)
			->setKprFact(45.0)
			->setFrfz(900.0)
			->setFd(200.0);
		$this->assertTrue($ms->calculate());
		
		# проверка результатов
		$this->assertEquals($ms->prfz, 56.25);
		$this->assertEquals($ms->kd, 0.925);
		$this->assertEquals(round($ms->ks, 5), 0.52031);
		$this->assertEquals($ms->kr, -14.0);
		$this->assertEquals(round($ms->eff, 5), -7.28438);
		*/
	}
}