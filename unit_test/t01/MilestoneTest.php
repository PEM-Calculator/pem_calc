<?php

use \Pem\Models\Milestone;

class MilestoneTest extends PHPUnit_Framework_TestCase
{
	/**
	 * Проверка создания объекта
	 */
	public function testCreateAndDelete() {
		# проверка создания объекта
		$ms = new Milestone();
		$this->assertInstanceOf('\Pem\Models\Milestone', $ms);
	}
	
	/**
	 * Проверка установки значений и валидации
	 */
	public function testValidation() {
		$ms = new Milestone();
		
		# валидация не должна пройти
		$this->assertFalse($ms->validateMe() === true);
		
		# 1 правило валидации: Должно быть указано ПД или ФД
		$ms->setFd(1.0);
		$this->assertTrue($ms->validateMe());
		
		# 2 правило валидации: Если указано ПД, то должно быть указано КПРплн
		$ms->setPd(1.0);
		$this->assertFalse($ms->validateMe() === false);
		$ms->setKprPlan(10.0);
		$this->assertTrue($ms->validateMe());
	}
	
	public function testCalculation1() {
		$ms = new Milestone();
		
		$ms
			->setKprPlan(10.0)
			->setPrpz(100.0)
			->setPd(1.0)
			->setKprFact(100.0)
			->setFrfz(100.0)
			->setFd(1.0);
		$this->assertTrue($ms->calculate());
		
		# проверка результатов
		$this->assertEquals($ms->prfz, 1000.0);
		$this->assertEquals($ms->kd, 1.0);
		$this->assertEquals($ms->ks, 10.0);
		$this->assertEquals($ms->kr, 1.9);
		$this->assertEquals($ms->eff, 19.0);
	}
	
	public function testCalculation2() {
		$ms = new Milestone();
		
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
	}
}
