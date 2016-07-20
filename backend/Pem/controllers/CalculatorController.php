<?php

class CalculatorController extends \Rainbow\Controllers\ControllerBase
{
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //
    //  Actions
    //
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	public function indexAction()
	{
		$this->sendJson(['view' => 'index']);
	}

	// Вывод списка проектов
	public function listAction()
	{
		// получаю список проектов
		$projects = Projects::find([
			'parent_id IS NULL',
			'order'	=> 'created'
			]);

		$items = [];
		if(count($projects))
			foreach($projects as $project)
				$items[] = $project->toArray();

		$this->sendJson([
        	'view'	=> 'projects/list',
        	'data'	=> [
        		'items'	=> $items
        	],
    	]);
	}

	// Создание нового проекта
	public function addAction()
	{
		// создаю проект
		$project = new Projects();
		$project->setName($_POST['name']);

		// возможно, указана подзадача
		if(isset($_POST['parentId'])) {
			$res = $project->setParent($_POST['parentId'] * 1);
			if($res === false)
				$this->sendJson([
					'error' => 'Родительский объект указан неверно',
				], 400, 'Error project created');
		}

		$res = $project->create();
		if($res !== true) {
			$this->sendJson([
				'error' => 'Ошибка при создании проекта',
				'innerError' => implode("\n", $project->getMessages())
				], 400, 'Error project created');
		}

		$this->sendJson(['redirect' => '/projects/view/' . $project->id], 201, 'Проект создан');
		#$this->editProject($project->id);
	}

	// Выбор одного из проектов
	public function viewAction($projectId)
	{
		// выбираю проект
		$project = Projects::findFirstById($projectId);
		if($project === false) {
			$this->sendJson(['error' => 'Проект не найден'], 404, 'Project not found');
		}
		$projectArray = $project->toArray();

		// дочерние проекты
		$list = $project->getItems();
		$items = [];
		if(count($list))
			foreach($list as $item)
				$items[] = $item->toArray();

		// линейный массив родительских проектов
		$parents = [];
		$parent = $project->getParent();
		while($parent != null) {
			$parents[] = $parent->toArray();
			$parent = $parent->getParent();
		}

		$data = [
        	'view'	=> 'projects/view',
        	'data'	=> [
        		'item'		=> $projectArray,
        		'items'		=> $items,
        		'parents'	=> $parents,
        	],
        	#'afterRender'	=> "$('[role=\"project-info\"][project-id=\"{$project->id}\"]').data('item', data.data.item).data('items', data.data.items).data('parents', data.data.parents);",
    	];

    	$this->sendJson($data);
	}

	// Запрос на изменение проекта
	public function editAction($projectId)
	{
		// выбираю проект
		$project = Projects::findFirstById($projectId);
		if($project === false) {
			$this->sendJson(['error' => 'Проект не найден'], 404, 'Project not found');
		}
		$projectArray = $project->toArray(null, true);

		// линейный массив родительских проектов
		$parents = [];
		$parent = $project->getParent();
		while($parent != null) {
			$parents[] = $parent->toArray();
			$parent = $parent->getParent();
		}

		$data = [
        	'view'	=> 'projects/view',
        	'data'	=> [
        		'mode'	=> 'edit',
        		'item'	=> $projectArray,
        		'parents'	=> $parents,
        	],
    	];

    	$this->sendJson($data);
	}

	// Сохранение проекта
	public function saveAction($projectId)
	{
		// выбираю проект
		$project = Projects::findFirstById($projectId);
		if($project === false) {
			$this->sendJson(['error' => 'Проект не найден'], 404, 'Project not found');
		}
		$projectArray = $project->toArray(null, true);

		// проверяю и изменяю каждое поле
		if($projectArray['can_edit']['name'])
			$project->setName($_POST['name']);

		if($projectArray['can_edit']['description'])
			$project->setDescription($_POST['description']);

		// проверяю и изменяю каждое поле
		if($projectArray['can_edit']['prpz'])
			$project->prpz = $_POST['prpz'];

		if($projectArray['can_edit']['prfz'])
			$project->prfz = $_POST['prfz'];

		// валидация
		$project->validateData();

		// пересчет
		$project->recalculate();

		// сохранение
		$res = $project->save();
		if($res !== true) {
			$this->sendJson([
				'error' => 'Ошибка при сохранении проекта',
				'innerError' => implode("\n", $project->getMessages())
				], 400, 'Error project saved');
		}

		$this->viewAction($projectId);
	}
}