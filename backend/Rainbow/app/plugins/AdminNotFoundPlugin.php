<?php

namespace Rainbow\Plugins;

/**
 * NotFoundPlugin
 *
 * Handles not-found controller/actions
 */
class AdminNotFoundPlugin extends \Phalcon\Mvc\User\Plugin
{
	/**
	 * This action is executed before execute any action in the application
	 *
	 * @param Event $event
	 * @param Dispatcher $dispatcher
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
				echo nl2br($exception);
				die;
					$dispatcher->forward(array(
						'controller' => 'admin',
						'action' => 'show404'
					));
					return false;
			}
			echo nl2br($exception);
			die;
		}

		/*$dispatcher->forward(array(
			'controller' => 'admin',
			'action'     => 'show500'
		));
		return false;*/
	}
}
