--
-- Структура таблицы `tasks`
--
CREATE TABLE IF NOT EXISTS `tasks` (
	`id`		int(11) 		NOT NULL 	AUTO_INCREMENT,
	`created`	timestamp 		NOT NULL 	DEFAULT CURRENT_TIMESTAMP,
	`updated`	timestamp 		NULL		DEFAULT NULL,
	`parent_id`	int(11)			NULL,
	`name`		varchar(100)	NOT NULL,
	`description` text			NULL,
	-- единицы результата
	`result_unit` varchar(100)	NOT NULL,
	`plan_result` double 		NULL,
	`fact_result` double 		NULL,
	-- даты
	`min_date`	timestamp 		NULL,
	`max_date`	timestamp 		NULL,
	`date_unit`	varchar(10) 	NOT NULL,
	`plan_date_length` double	NULL,
	`fact_date`	timestamp 		NULL,
	`fact_date_length` double	NULL,
	`frc_date`	timestamp 		NULL,
	`frc_date_length` double	NULL,
	-- расходы
	`prpz`		double			NULL,
	`prfz`		double			NULL,
	`frfz`		double			NULL,
	`frc_frfz`	double			NULL,
	`prpr`		double			NULL,
	`ppr`		double			NULL,
	`frc_ppr`	double			NULL,
	-- расчетные величины
	`eff`		double			NULL,
	`kd`		double			NULL,
	`ks`		double			NULL,
	`kr`		double			NULL,
	`kpr`		double			NULL,
	PRIMARY KEY(`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;
