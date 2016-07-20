--
-- Структура таблицы `configs`
--
CREATE TABLE IF NOT EXISTS `configs` (
	`id`		int(11) 		NOT NULL 	AUTO_INCREMENT,
	`created`	timestamp 		NOT NULL 	DEFAULT CURRENT_TIMESTAMP,
	`updated`	timestamp 		NULL		DEFAULT NULL,
	`key`		varchar(50)		NOT NULL,
	`value`		text			NOT NULL,
	PRIMARY KEY(`id`),
	UNIQUE KEY `key` (`key`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

--
-- Структура таблицы `locales`
--
CREATE TABLE IF NOT EXISTS `locales` (
	`id`		int(11) 		NOT NULL 	AUTO_INCREMENT,
	`created`	timestamp 		NOT NULL 	DEFAULT CURRENT_TIMESTAMP,
	`updated`	timestamp 		NULL		DEFAULT NULL,
	`prefix`	char(2)			NOT NULL,
	`title`		varchar(50)		NOT NULL,
	`enable` 	int(11) 		NOT NULL 	DEFAULT '1',
	PRIMARY KEY(`id`),
	UNIQUE KEY `prefix` (`prefix`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

--
-- Структура таблицы `locale_texts`
--
CREATE TABLE IF NOT EXISTS `locale_texts` (
	`id` 		int(11) 		NOT NULL 	AUTO_INCREMENT,
	`created` 	timestamp 		NOT NULL 	DEFAULT CURRENT_TIMESTAMP,
	`updated` 	timestamp 		NULL		DEFAULT NULL,
	`locale_id` int 			NOT NULL,
	`key` 		varchar(100)	NOT NULL,
	`value` 	text 			NOT NULL,
	PRIMARY KEY(`id`),
	UNIQUE KEY `prefix_key` (`locale_id`,`key`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

--
-- Структура таблицы `persons`
--
CREATE TABLE IF NOT EXISTS `persons` (
	`id` 		int(11) 		NOT NULL 	AUTO_INCREMENT,
	`created` 	timestamp 		NOT NULL 	DEFAULT CURRENT_TIMESTAMP,
	`updated` 	timestamp 		NULL		DEFAULT NULL,
	`username` 	varchar(20) 	NOT NULL,
	`email` 	varchar(40) 	NOT NULL,
	`password` 	varchar(60) 	NOT NULL,
	`admin` 	int(11) 		NOT NULL 	DEFAULT '0',
	`name` 		varchar(50) 	NULL		DEFAULT NULL,
	`middlename` varchar(50) 	NULL		DEFAULT NULL,
	`surname` 	varchar(50) 	NULL		DEFAULT NULL,
	`birthday` 	date 			NULL		DEFAULT NULL,
	`phone` 	varchar(50) 	NULL		DEFAULT NULL,
	`location` 	varchar(50) 	NULL		DEFAULT NULL,
	PRIMARY KEY(`id`),
	UNIQUE KEY `username` (`username`),
	UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

--
-- Структура таблицы `person_logins`
--
CREATE TABLE IF NOT EXISTS `person_logins` (
	`id` 		int(11) 		NOT NULL 	AUTO_INCREMENT,
	`created` 	timestamp 		NOT NULL 	DEFAULT CURRENT_TIMESTAMP,
	`updated` 	timestamp 		NULL		DEFAULT NULL,
	`person_id` char(8) 		NOT NULL,
	`secret` 	varchar(32) 	NOT NULL 					COMMENT 'Строка входа',
	`ip` 		varchar(15) 	NOT NULL,
	`geo` 		varchar(100) 	NULL		DEFAULT NULL,
	`location` 	varchar(100) 	NULL		DEFAULT NULL,
	`enable` 	int(11) 		NOT NULL 	DEFAULT '1' 	COMMENT 'Статус авториазции',
	PRIMARY KEY(`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

--
-- Структура таблицы `menus`
--
CREATE TABLE IF NOT EXISTS `menus` (
	`id`		int(11)			NOT NULL	AUTO_INCREMENT,
	`created`	timestamp 		NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`updated`	timestamp 		NULL		DEFAULT NULL,
	`parent_id`	int(11)			NULL		DEFAULT NULL,
	`title_text_key` varchar(100) NOT NULL,
	`link_id`	int(11)			NULL		DEFAULT NULL,
	`enable` 	int(11) 		NOT NULL 	DEFAULT '1',
	PRIMARY KEY(`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

--
-- Структура таблицы `files`
--
CREATE TABLE IF NOT EXISTS `files` (
	`id`		int(11)			NOT NULL	AUTO_INCREMENT,
	`created`	timestamp 		NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`updated`	timestamp 		NULL		DEFAULT NULL,
	`filename`	varchar(100)	NOT NULL,
	`filetype`	varchar(50)		NOT NULL,
	`filesize`	int(11)			NOT NULL,
	`cachename`	varchar(50)		NOT NULL,
	`description_text_key` varchar(100)	NULL	DEFAULT NULL,
	PRIMARY KEY(`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

--
-- Структура таблицы `links`
--
CREATE TABLE IF NOT EXISTS `links` (
	`id`		int(11)			NOT NULL	AUTO_INCREMENT,
	`created`	timestamp 		NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`updated`	timestamp 		NULL		DEFAULT NULL,
	`title_text_key` varchar(100) NOT NULL,
	`file_id`	int(11)			NULL		DEFAULT NULL,
	`page_id`	int(11)			NULL		DEFAULT NULL,
	`url`		varchar(250)	NULL		DEFAULT NULL,
	PRIMARY KEY(`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

--
-- Структура таблицы `page_cats`
--
CREATE TABLE IF NOT EXISTS `page_cats` (
	`id`		int(11)			NOT NULL	AUTO_INCREMENT,
	`created`	timestamp 		NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`updated`	timestamp 		NULL		DEFAULT NULL,
	`title`		varchar(50)		NOT NULL,
	`parent_id`	int(11)			NULL		DEFAULT NULL,
	PRIMARY KEY(`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

--
-- Структура таблицы `pages`
--
CREATE TABLE IF NOT EXISTS `pages` (
	`id`		int(11)			NOT NULL	AUTO_INCREMENT,
	`created`	timestamp 		NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`updated`	timestamp 		NULL		DEFAULT NULL,
	`title_text_key` varchar(100) NOT NULL,
	`page_cat_id` int(11)		NULL		DEFAULT NULL,
	`urn`		varchar(250)	NOT NULL	COMMENT 'Ссылка страницы от корня сайта',
	`enable` 	int(11) 		NOT NULL 	DEFAULT '1',
	PRIMARY KEY(`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

--
-- Структура таблицы `page_blocks`
--
CREATE TABLE IF NOT EXISTS `page_blocks` (
	`id`		int(11)			NOT NULL	AUTO_INCREMENT,
	`created`	timestamp 		NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`updated`	timestamp 		NULL		DEFAULT NULL,
	`page_id`	int(11)			NULL		DEFAULT NULL,
	`order`		int(11)			NOT NULL	DEFAULT 999,
	`module`	varchar(100)	NOT NULL,
	`title_text_key` varchar(100) NOT NULL,
	`content_text_key` varchar(100) NOT NULL,
	`enable` 	int(11) 		NOT NULL 	DEFAULT '1',
	PRIMARY KEY(`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;