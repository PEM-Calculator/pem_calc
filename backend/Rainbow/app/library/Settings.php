<?php

namespace Rainbow\Library;

class Settings extends \Phalcon\Mvc\User\Component
{
	private $data = [];

	public function __construct($settings) {
		# загрузка из конфига
		foreach($settings as $key => $value)
			$this->data[$key] = $value;

		# загрузка из базы
		$configs = \Rainbow\Models\Configs::find();
		if($configs === false)
			throw new \Exception('Конфигурация не доступна');

		foreach($configs as $config) {
			$this->data[$config->key] = $config->value;
		}
	}

	public function __get($key)
	{
		if(isset($this->data[$key]))
			return $this->data[$key];
		else
			return "[unknown {$key}]";
	}

	#
	#	PUBLIC EVENTS
	#

	/*
	 *	Вовзращает текущую локаль для пользователя.
	 *	Если пользователь не менял в куки, то по умолчанию.
	 */
	public function getCurrentLang()
	{
		$cookies = $this->getDI()->getCookies();
		return $cookies->has('user_choosen_lang')
			? $cookies->user_choosen_lang
			: $this->default_lang;
	}
}