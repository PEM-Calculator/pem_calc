<?php

namespace Rainbow\Library;

class PageGenerator extends \Phalcon\Mvc\User\Component
{
	const 
		DROP_DOWN_MENU = "Pagegenerator/DropDownMenu",
		NUMBERS_INFO = "Pagegenerator/NumbersInfo";

	public function generatePage($page) {
		$blocks = $page->getBlocks();

		if($blocks === false)
			return $this->dispatcher->forward([
				'controller' => 'errors',
				'action' => 'show500',
			]);

		foreach ($blocks as $block) {
			$this->view->title = $block->getTitle();
			$this->view->content = json_decode($block->getContent());
			$this->view->partial($block->module);
		}
	}

	// возвращает ссылку на ресурс по Links->id
	// пример в шаблоне: {{ generator.getUrlByLinkId(link_id) }}
	public function getUrlByLinkId($link_id) {
		$db = $this->getDI()->getDb();
		$link = \Rainbow\Models\Links::getById($link_id);
		return $link->getFullUrl();
	}
}
