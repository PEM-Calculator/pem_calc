<?php

namespace Rainbow\Controllers;

class AdminController extends Phalcon\Mvc\Controller
{
	protected function initialize()
    {
        $this->tag->setTitleSeparator(' - ');
        $this->tag->setTitle(
        	$this->adminmenu->getProjectName());
        $this->view->setTemplateAfter('_admin');
    }

    protected function forward($uri)
    {
        $uriParts = explode('/', $uri);
        $params = array_slice($uriParts, 2);
    	return $this->dispatcher->forward(
    		array(
    			'controller' => 'admin',
    			'action' => $uriParts[0],
                'params' => $params
    		)
    	);
    }

    public function show404Action()
    {
        if(!$this->session->get('admin_auth'))
            $this->forward('auth');
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //
    //  Обработка AJAX-запросов
    //
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    public function ajaxAction()
    {
        $R = $this->response;

        try {
            switch($_POST['action'])
            {
                case 'createPageGroup':
                    return $this->_createPageGroup($R, $_POST['name'], $_POST['parent_id']);

                default:
                    $R->setStatusCode(500, 'Unknown query');
                    $R->setContent('window.getAdmin().alertError("Неверно указан запрос");');
            }
        }
        catch(Exception $ex)
        {
            $R->setStatusCode(500, 'Ajax error');
            $R->setContent(json_encode(array(
                'error' => $ex)) . print_r($ex, 1));
        }
        
        return $R;
    }

    public function _createPageGroup($R, $name, $parent_id)
    {
        if($parent_id == null)
            $parent_id = 0;

        # может такая группа уже есть
        $testPG = PageGroups::findFirst(array(
            'conditions' => 'name = ?0 and parent_id = ?1',
            'bind' => array($name, $parent_id)));
        if($testPG !== false) {
            $R->setContent('window.getAdmin().alertWarning("Duplicate group name");');
            return $R;
        }

        # создаю новую группу
        $pageGroup = new PageGroups();
        $res = $pageGroup->create(array(
            'name' => $name,
            'parent_id' => $parent_id));
        if(!$res)
            $R->setContent(print_r($pageGroup->getMessages(), 1));
        else
            $R->setContent("$('#createGroupModal').modal('hide');" .
                "window.getAdmin().alert('Window created');" .
                "location.reload();");
        return $R;
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //
    //  Методы страниц
    //
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    /*
     *  Страница авторизации
     */
	public function authAction()
    {
        $this->tag->prependTitle(
            $this->locale->CALL_TO_SIGNIN);

        if(!$this->request->isPost())
            return;
        
        $person = Persons::findFirst(array(
            'conditions' => 'email=?1 and password=?2',
            'bind' => array(
                1 => $_POST['email'],
                2 => $_POST['password'])
            ));

        if($person === false)
            $this->flash->error(
                $this->locale->WRONG_EMAIL_OR_PASSWORD);
        else {
            $this->session->set('admin_auth', $person);
            $this->flash->success(
                $this->locale->SINGIN_SUCCESS);
        }

        $this->forward(substr($_GET['_url'], 7));
    }

    /*
     *  Страница выхода
     */
    public function logoutAction()
    {
        if($this->session->get('admin_auth'))
            $this->flash->success(
                $this->locale->LOGOUT_SUCCESS);

        $this->session->set('admin_auth', null);
        $this->response->redirect('/admin');
    }

    /*
     *  Главная страница
     */
    public function indexAction()
    {
        if(!$this->session->get('admin_auth'))
            $this->forward('auth');
    }

    /*
     *  Создание страницы
     */
    public function pageCreateAction()
    {
        if(!$this->session->get('admin_auth'))
            $this->forward('auth');

        $this->forward('pageEdit');
    }

    /*
     *  Редактирование страницы
     */
    public function pageEditAction($id = null)
    {
        if(!$this->session->get('admin_auth'))
            $this->forward('auth');

        $page = null;
        if($id != null) {
            $page = Pages::findFirst(array(
                'conditions' => 'id = ?',
                bind => array($id)));
            if($page === fale)
                $this->forward('show404');
        }
    }

    /*
     *  Управление страницами
     */
    public function pagesManageAction()
    {
        $this->tag->prependTitle(
            $this->locale->PAGE_PAGES_MANAGE);

        # отдаю список групп страниц
        $this->view->pageGroups = PageGroups::find(array(
            'parent_id = 0',
            'order' => 'name'));

        # отдаю текущую выделенную группу
        $this->view->selectedGroup = $_GET['group'];
    }
}