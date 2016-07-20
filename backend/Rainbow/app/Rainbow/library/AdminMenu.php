<?php

class AdminMenu extends Phalcon\Mvc\User\Component
{
    public function getProjectName()
    {
        return "MY TEST";
    }

    /**
     * Builds header menu with left and right items
     *
     * @return string
     */
    public function getMenu()
    {
        $locale = $this->getDI()->getLocale();
        $headerMenu = array(
            'index' => $locale->PAGE_HOME,
            'pages' => array(
                '#title' => $locale->PAGE_PAGES,
                'pageCreate' => $locale->PAGE_PAGES_CREATE,
                'pagesManage' => $locale->PAGE_PAGES_MANAGE
            ),
            'config' => array(
                '#title' => $locale->PAGE_CONFIG,
                'database' => $locale->PAGE_CONFIG_DATABASE,
                'paths' => $locale->PAGE_CONFIG_PATHS,
                'modules' => $locale->PAGE_CONFIG_MODULES,
                'users' => $locale->PAGE_CONFIG_USERS
            ),
            'contact' => $locale->PAGE_CONTACTS
        );

        if(!$this->session->get('admin_auth'))
            return;

        $ctrlName = $this->view->getControllerName();
        $actName = $this->view->getActionName();

        # navbar-left
        echo '<div id="navbar" class="collapse navbar-collapse">';
        echo '<ul class="nav navbar-nav navbar-left">';

        foreach($headerMenu as $item => $menu) {
            # Элемент вложенного меню
            if(is_array($menu)) {
                echo '<li class="dropdown">';
                echo '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">'.$menu['#title'].' <span class="caret"></span></a>';
                echo '<ul class="dropdown-menu" role="menu">';
                foreach($menu as $action => $title) {
                    if($action != '#title')
                    if($title == '-')
                        echo '<li class="divider"></li>';
                    else {
                        if ($actName == $action) {
                            echo '<li class="active">';
                        } else {
                            echo '<li>';
                        }
                        echo $this->tag->linkTo($ctrlName.'/'.$action, $title);
                        echo '</li>';
                    }
                }
                echo '</ul></li>';
            }
            # Без вложенного меню
            else {
                if ($actName == $item) {
                    echo '<li class="active">';
                } else {
                    echo '<li>';
                }
                echo $this->tag->linkTo($ctrlName.'/'.$item, $menu);
                echo '</li>';
            }
        }
        echo '</ul>';

        # navbar-right
        echo '<ul class="nav navbar-nav navbar-right">';
        echo '<li>';
        echo $this->tag->linkTo('/', $locale->GOTO_WEBSITE, array('target' => '_blank'));
        echo '</li><li>';
        echo $this->tag->linkTo($ctrlName.'/logout', $locale->CALL_TO_LOGOUT);
        echo '</li>';
        echo '</ul>';
        echo '</div>';
    }
}
