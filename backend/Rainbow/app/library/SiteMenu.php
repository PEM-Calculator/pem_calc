<?php

namespace Rainbow\Library;

class SiteMenu extends \Phalcon\Mvc\User\Component
{
    public function getMenu()
    {
        $menuId = $this->settings->SITE_MENU;
        $menu = \Rainbow\Models\Menus::getById($menuId);
        if($menu === false)
            throw new \Exception(sprintf('Menu #%s not found', $menuId));

        $locale = $this->locale->getLocale();
        $urn = ($_GET['_url'] == '' ? '/' : $_GET['_url']);

        $content = [];

        $content[] = '<div id="navbar" class="collapse navbar-collapse">'
                   . '<ul class="nav navbar-nav navbar-left">';

        foreach($menu->getChildren() as $menuItem) {
            $title = $menuItem->getTitle($locale);
            $linkObject = $menuItem->getLink();
            
            # Элемент вложенного меню
            $subMenus = $menuItem->getChildren();
            if(count($subMenus)) {

                $subContent = [];
                $activeHere = false; // одно из подменю является активным

                foreach($subMenus as $subMenu) {
                    $subTitle = $subMenu->getTitle($locale);
                    $subLink = $subMenu->getLink()->getFullUrl();

                    if($subLink !== false)
                        if($subTitle == '-')
                            $subContent[] = '<li class="divider"></li>';
                        else {
                            $activeHere |= $subLink == $urn;
                            $subContent[] = ($subLink == $urn
                                ? '<li class="active">'
                                : '<li>')
                                . $this->tag->linkTo($subLink, $subTitle)
                                . '</li>';
                        }
                }

                $content[] = '<li class="dropdown' . ($activeHere ? ' active' : '') . '">'
                           . '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">' . $title . ' <span class="caret"></span></a>'
                           . '<ul class="dropdown-menu" role="menu">';

                $content[] = implode('', $subContent);

                $content[] = '</ul></li>';
            }
            # Без вложенного меню
            else if($linkObject !== false) {
                $link = $linkObject->getFullUrl();
                $content[] = ($link == $urn
                    ? '<li class="active">'
                    : '<li>');
                if($link !== false)
                    $content[] = $this->tag->linkTo($link, $title);
                $content[] = '</li>';
            }
        }
        $content[] = '</ul>';

        # navbar-right
        $content[] = '<ul class="nav navbar-nav navbar-right">'
                   . '<li>'
                   . $this->tag->linkTo('/', $this->locale->GOTO_WEBSITE, array('target' => '_blank'))
                   . '</li><li>'
                   . $this->tag->linkTo($ctrlName.'/logout', $this->locale->CALL_TO_LOGOUT)
                   . '</li>'
                   . '</ul>'
                   . '</div>';

        return implode('', $content);
    }
}
