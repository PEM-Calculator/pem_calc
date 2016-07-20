<?php

namespace Rainbow\Controllers;

class PageGeneratorController extends ControllerBase
{
    public function generatePageAction($page = null)
    {
    	if(!$page instanceof \Rainbow\Models\Pages) {
    		$urn = ($_GET['_url'] == '' ? '/' : $_GET['_url']);
        	$page = \Rainbow\Models\Pages::getByUrn($urn);
        }

        if($page === false)
            return $this->show404Action();

        $this->generator->generatePage($page);
    }
}
