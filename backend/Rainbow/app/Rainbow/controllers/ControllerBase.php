<?php

namespace Rainbow\Controllers;

class ControllerBase extends \Phalcon\Mvc\Controller
{
    protected function initialize()
    {
        $this->tag->setTitleSeparator(' - ');

        $this->tag->setTitle(
            $this->settings->project_title);

        $this->view->setTemplateAfter('_main');
    }

    protected function forward($uri)
    {
        $uriParts = explode('/', $uri);
        $params = array_slice($uriParts, 2);
        return $this->dispatcher->forward(
            array(
                'controller' => $uriparams[0],
                'action' => $uriParts[1],
                'params' => $params
            )
        );
    }

    public function show404Action()
    {
        $this->tag->appendTitle(
            $this->locale->PAGE_NOT_FOUND);
    }
}
