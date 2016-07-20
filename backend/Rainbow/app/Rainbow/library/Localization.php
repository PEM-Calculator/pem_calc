<?php

namespace Rainbow\Library;

class Localization extends \Phalcon\Mvc\User\Component
{
	private 
		$data = [],
		$locale = null;

	public function __construct()
	{
		# текущая локаль пользователя
		$lang = $this->getDI()->getSettings()->getCurrentLang();

		# загружается локаль
		$this->locale = \Rainbow\Models\Locales::getByPrefix($lang);
		if($this->locale === false)
			throw new \Exception(sprintf('Unknown locale "%s"', $lang));

		# загружаю базу переводов
		$locs = new \Phalcon\Config\Adapter\Ini(APP_PATH . 'app/config/translate.ini');
		$words = array_keys($locs->toArray());
		
		foreach($words as $key)
			if(isset($locs[$key][$lang]))
				$this->data[$key] = $locs[$key][$lang];
	}

	public function getLocale()
	{
		return $this->locale;
	}

	public function __get($key)
	{
		if(isset($this->data[$key]))
			return $this->data[$key];
		else
			return "[unknown {$key}]";
	}

	private function set($key, $value)
	{
		$this->data[$key] = $value;
	}
}