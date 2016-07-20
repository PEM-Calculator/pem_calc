<?php

namespace Rainbow\Plugins;

/**
 * Контроллер ищет страницы из базы и создает правильные генераторы страниц
 */
class PageRequestPlugin extends \Phalcon\Mvc\User\Plugin
{
	/**
	 * Страница не была найдена.
	 * Выполняется поиск страниц с подходящим адресом
	 */
	public function beforeException(
		\Phalcon\Events\Event $event,
		\Phalcon\Mvc\Dispatcher $dispatcher,
		\Exception $exception)
	{
		if ($exception instanceof \Phalcon\Mvc\Dispatcher\Exception) {
			switch ($exception->getCode()) {
				case \Phalcon\Mvc\Dispatcher::EXCEPTION_HANDLER_NOT_FOUND:
				case \Phalcon\Mvc\Dispatcher::EXCEPTION_ACTION_NOT_FOUND:
					$urn = ($_GET['_url'] == '' ? '/' : $_GET['_url']);
					$page = \Rainbow\Models\Pages::getByUrn($urn);

					if($page === false) {
						# страница не найдена
						# выводится стандартная страница с ошибкой
						$dispatcher->forward(array(
							'controller' => 'errors',
							'action'	 => 'show404',
							'params'	 => [$exception],
						));
						return false;
					}

					# страница найдена, выполняется построение
					$this->response->setStatusCode(200);
					$dispatcher->forward(array(
						'controller' => '\Rainbow\Controllers\PageGenerator',
						'action' => 'generatePage',
						'params' => [$page],
					));
					return false;
					break;
			}
		}

		$dispatcher->forward(array(
			'controller' => 'errors',
			'action'     => 'show500',
			'params'	 => [$exception],
		));
		return false;
	}
}
