'use strict'
// загружаю модули
import _ from 'lodash'
import Reflux from 'reflux'
import Tools from './../core/tools'

let storeActions = Reflux.createActions([
	"updateValues",		// изменился один из целевых показателей
	"updatePeriods",	// изменилось одно из значений периодов
	"saveUnitsAndGoals",	// нужно сохранить первую страницу настроек
	"savePeriods",			// нужно сохранить вторую страницу с периодами
	"reloadUnitsAndGoals",	// нужно обновить первую страницу настроек
	"resetData",		// сброс данных по умолчанию
	"addNewPeriod",		// нужно добавить новый период
	"deletePeriod",		// нужно удалить один из периодов
	//
	"startDemo",		// заполняю демо-данные
])

let CalculatorStore = Reflux.createStore({
	// ключ в localStorage
	localStorageKey: 'calculatorData',

	// ссылка на события
	Actions: storeActions,

	// известные события
	listenables: [storeActions],

	//	-----	описание событий -----

	// изменился один из целевых показателей
	onUpdateValues(data_array, cb) {
		this.updateValues(data_array)
		// событие миру
		// this.trigger(this.data)
		// callback, просто передаю новые значения
		if(cb) cb(this.data.goals)
	},

	updateValues(data_array) {
		console.log('Fire p==* [STORE.updateValues]', data_array)
		console.log(this.data.goals)
		console.log(this.data.units)
		// data_array = [kpr, ppr_check, ppr, prpz, pn, po]
		this.data.units.unit_time.value = data_array.unit_time || this.data.units.unit_time.value
		this.data.units.unit_result.value = data_array.unit_result || this.data.units.unit_result.value
		this.data.units.unit_expense.value = data_array.unit_expense || this.data.units.unit_expense.value

		this.data.goals.currency.value = data_array.currency || this.data.goals.currency.value
		this.data.goals.project_name.value = data_array.project_name || this.data.goals.project_name.value
		this.data.goals.result_name.value = data_array.result_name || this.data.goals.result_name.value

		// парсинг чисел
		let kpr = (parseInt(data_array.kpr) || 0) * 1.0,
			ppr_check = (data_array.ppr_check != false ? true : false),
			ppr = (parseInt(data_array.ppr) || 0) * 1.0,
			prpz = (parseInt(data_array.prpz) || 0) * 1.0,
			plan_range = (parseInt(data_array.plan_range) || 0),
			plan_range_count = this.data.goals.plan_range.range.length,
			plan_method = (parseInt(data_array.plan_method) || 0),
			plan_method_count = this.data.goals.plan_method.range.length,
			result_method = (parseInt(data_array.result_method) || 0),
			result_method_count = this.data.goals.result_method.range.length,
			pn = (parseInt(data_array.pn) || null),
			po = (parseInt(data_array.po) || null)
		// расчеты
		let krp = (ppr !== 0 ? prpz / ppr : 1.0),
			pd = (pn && po && po >= pn
				? Math.floor((po - pn) / 86400000) + 1	// окончание - начало + 1
				: null)
		// валидация
		plan_range = Math.max(0, Math.min(plan_range, plan_range_count-1))
		plan_method = Math.max(0, Math.min(plan_method, plan_method_count-1))
		result_method = Math.max(0, Math.min(result_method, result_method_count-1))
		// замена значений
		this.data.goals.kpr.value = kpr
		this.data.goals.ppr_check.value = ppr_check
		this.data.goals.ppr.value = ppr
		this.data.goals.prpz.value = prpz
		this.data.goals.krp.value = krp
		this.data.goals.pn.value = pn
		this.data.goals.po.value = po
		this.data.goals.pd.value = pd
		this.data.goals.plan_range.value = plan_range
		this.data.goals.plan_method.value = plan_method
		this.data.goals.result_method.value = result_method
		// считаем сколько периодов
		let range_value = this.data.goals.plan_range.range[plan_range].value,
			plan_periods = Tools.calcPlanCount(pn, po, range_value),
			plan_count = (plan_periods && typeof plan_periods == 'object' ? plan_periods.length : 0)
		this.data.goals.plan_count.value = plan_count
		this.data.goals.plan_count.periods = plan_periods

		console.log(this.data.goals)
		console.log(this.data.units)
	},

	// изменилось одно из значений периодов
	onUpdatePeriods(changedPeriods, cb) {
		console.log('p==* Fired onUpdatePeriods', changedPeriods)

		// парсинг значений
		let periods = this.data.periods
		this.data.periods = _.map(changedPeriods, (newPeriod, key) => {
			// обновляю значения для периодов
			// план
			let p = periods[key]
			p.pn.value = newPeriod.pn || null
			p.po.value = newPeriod.po || null
			p.pd.value = (newPeriod.pn && newPeriod.po && newPeriod.po >= newPeriod.pn)
				? Math.floor((newPeriod.po - newPeriod.pn) / 86400000) + 1
				: null
			console.log('Dates', newPeriod.pn, p.pn.value, newPeriod.po, p.po.value, p.pd.value)
			p.kpr.value = (parseInt(newPeriod.kpr) || 0) * 1.0
			p.prpz.value = (parseInt(newPeriod.prpz) || 0) * 1.0
			// факт
			p.kpr_fact.value = (parseInt(newPeriod.kpr_fact) || 0) * 1.0
			p.frfz.value = (parseInt(newPeriod.frfz) || 0) * 1.0

			return p
		})

		if(cb) cb(this.data.periods)
	},

	// нужно сохранить первую страницу настроек
	onSaveUnitsAndGoals(cb) {
		console.log('Fire p==* [STORE.onSaveUnitsAndGoals]')

		// даты периодов уже были сформированы, формирую сами периоды
		let data = this.data,
			periods = data.goals.plan_count.periods
		data.periods = []
		// на каждый период нужно разбить КПРплн и ПРПЗ
		let day_length = 24*60*60*1000,
			days = Math.floor((data.goals.po.value - data.goals.pn.value) / day_length) + 1,
			kpr = data.goals.kpr.value,
			prpz = data.goals.prpz.value

		// от метода заполнения зависит, будем забивать только даты по периодам
		// или даты вместе со средними КПР и ПРПЗ
		if(data.goals.plan_method.value == 0) {
			// ручная расстановка КПР и ПРПЗ
			for(let i in periods) {
				let period = data.goals.plan_count.periods[i]
				this.addNewPeriod(period.n, period.o)
			}
		}
		else {
			// авто расстановка КПР и ПРПЗ
			for(let i in periods) {
				let period = data.goals.plan_count.periods[i],
					len = Math.floor((period.o - period.n) / day_length) + 1,
					percent = len / days,
					kpr_ = Math.floor(kpr * percent),
					prpz_ = Math.floor(prpz * percent)
				// для последнего периода забираю все
				if(i == period.length - 1) {
					kpr_ = kpr
					prpz_ = prpz
				}
				this.addNewPeriod(period.n, period.o, kpr_, prpz_)
				// уменьшаю счетчики
				days -= len
				kpr -= kpr_
				prpz -= prpz_
			}
		}

		this.saveData()
		if(cb) cb(!(
			this.data.config.hasUnitsError
			|| this.data.config.hasGoalsError))
	},

	// нужно сохранить вторую страницу с периодами
	onSavePeriods(cb) {
		console.log('Fire p==* [STORE.onSavePeriods]', this.data.periods)
		// сохраняю перед калькуляцией
		this.saveData()

		// формирую данные для калькулятора
		let data = {
			tasks: [
				{
					goal: {
						kpr: this.data.goals.kpr.value,
						ppr: this.data.goals.ppr.value,
						prpz: this.data.goals.prpz.value,
						pd: this.data.goals.pd.value,
					},
					periods: _.map(this.data.periods, (period) => {
						return {
							pd: period.pd.value,
							kprp: period.kpr.value,
							prpz: period.prpz.value,
							fd: period.fd.value,
							kprf: period.kpr_fact.value,
							frfz: period.frfz.value,
						}
					})
				}
			]
		}

		// отправляю данные в калькулятор для рассчета
		let STORE = this

		var xhr = new XMLHttpRequest()
		xhr.open('post', '/calc.php', true)
		xhr.onload = function() {
			console.log('Fire p==* [STORE.onSavePeriods Response]', {xhr: xhr})
			// обработка тут
			if(xhr.status != 200) {
				alert('Ошибка при обработке запроса: ' + xhr.statusText + '\nПодробности в коносли')
				console.log('[!] REQUEST ERROR: %s', xhr.responseText)
				return
			}

			// разбор полученных данных
			this.setResults(JSON.parse(xhr.responseText).tasks[0])
			// обновлю ссылки на единицы измерения
			this.updateLinksToUnits()

			this.saveData()
			if(cb) cb(!(this.data.config.hasPeriodsError))
		}.bind(this)

		var formData = new FormData()
		let jsonData = JSON.stringify(data)
		formData.append('data', jsonData)

		xhr.send(formData)
	},

	setResults(taskResults) {
		let planfact = {
			kpr: {
				value: taskResults.skprp * 1.0,
				title: 'Ключевой показатель результата',
				placeholder: 'КПРплн',
			},
			prpz: {
				value: taskResults.sprpz * 1.0,
				title: 'Плановые расходы плановой задачи',
				placeholder: 'ПРПЗ',
			},
			pd: {
				value: taskResults.spd * 1.0,
				title: 'Плановая длительность',
				placeholder: 'ПД',
			},
			kpr_fact: {
				value: taskResults.skprf * 1.0,
				title: 'Фактический результат',
				placeholder: 'КПРфкт',
			},
			frfz: {
				value: taskResults.sfrfz * 1.0,
				title: 'Фактические расходы фактической задачи',
				placeholder: 'ФРФЗ',
			},
			fd: {
				value: taskResults.sfd * 1.0,
				title: 'Фактическая длительность',
				placeholder: 'ФД',
			},
			prfz: {
				value: taskResults.sprfz * 1.0,
				title: 'Плановые расходы фактической задачи',
				placeholder: 'ПРФЗ',
			},
		}

		let efficiency = {
			kd:  {
				value: taskResults.skd * 1.0,
				title: 'Коэффициент длительности',
				placeholder: 'Кд',
			},
			ks:  {
				value: taskResults.sks * 1.0,
				title: 'Коэффициент эффективности по сроку',
				placeholder: 'Кс',
			},
			kr:  {
				value: taskResults.skr * 1.0,
				title: 'Коэффициент эффективности по расходу',
				placeholder: 'Кр',
			},
			eff:  {
				value: taskResults.seff * 1.0,
				title: 'Комплексная эффективность',
				placeholder: 'Э',
			},
		}

		let deviations = {
			fd: {
				absolute_value: taskResults.dafd * 1.0,
				relative_value: taskResults.drfd * 1.0,
				title: 'Отклонение по сроку',
				placeholder: 'ФДоткл',
			},
			frfz: {
				absolute_value: taskResults.dafrfz * 1.0,
				relative_value: taskResults.drfrfz * 1.0,
				title: 'Отклонение по расходу',
				placeholder: 'ФРФЗоткл',
			},
			kpr: {
				absolute_value: taskResults.dakpr * 1.0,
				relative_value: taskResults.drkpr * 1.0,
				title: 'Отклонение по результату',
				placeholder: 'КПРоткл',
			},
		}

		let forecasts = {
			fd: {
				value: taskResults.ffd * 1.0,
				title: 'Прогноз фактической длительности',
				placeholder: 'ФДпргн',
			},
			frfz: {
				value: taskResults.ffrfz * 1.0,
				title: 'Прогноз фактического расхода фактической задачи',
				placeholder: 'ФРФЗпргн',
			},
			pr: {
				value: taskResults.fpr * 1.0,
				title: 'Прогноз прибыли по расходу',
				placeholder: 'ПР(Кр)пргн',
			},
			pre: {
				value: taskResults.fpre * 1.0,
				title: 'Прогноз прибыли по эффективности',
				placeholder: 'ПР(Э)пргн',
			},
		}

		this.data.results = {
			planfact: planfact,
			efficiency: efficiency,
			deviations: deviations,
			forecasts: forecasts,
			periods: taskResults.items
		}
	},

	// Нужно обновить первую страницу настроек
	onReloadUnitsAndGoals(cb) {
		this.loadData()
		if(cb) cb()
	},

	// Сброс данных по умолчанию
	onResetData(cb) {
		this.resetData()
		this.trigger(this.data)
		if(cb) cb()
	},

	// Нужно добавить новый период
	onAddNewPeriod() {
		this.addNewPeriod()
		this.trigger(this.data)
	},

	// Нужно удалить один из периодов
	onDeletePeriod(deleteIndex, cb) {
		let newPeriods = []
		for(let i in this.data.periods) {
			if(i != deleteIndex)
				newPeriods.push(this.data.periods[i])
		}
		this.data.periods = newPeriods

		this.trigger(this.data)

		if(cb) cb()
	},

	// Заполняю демо-данные
	onStartDemo(cb) {
		console.log('Fire p==* [STORE.onStartDemo]')

		this.resetData()

		this.data.config.project_name.value = 'Строительство моста через Каму'
		this.data.config.result_name.value = 'Объем принятых работ по ПСД'
		this.data.config.autor_name.value = 'Григорий Зуев'

		this.data.units.unit_time.value = 'дн.'
		this.data.units.unit_result.value = 'млн. руб.'
		this.data.units.unit_expense.value = 'млн. руб.'

		this.updateGoals({
			kpr: 500,
			ppr_check: true,
			ppr: 150,
			prpz: 900,
			pn: 1454284800000,
			po: 1458518400000,
			plan_range: 1,
		})

		this.trigger(this.data)

		if(cb) cb()
	},

	//	----- обработка данных -----

	// Сохранение данных в хранилище либо на сервер
	saveData() {
		console.log('Fire p==* [STORE.saveData]')

		// перед сохранением проверка данных
		this.checkUnits()
		this.checkGoals()
		this.checkPeriods()

		// проверяю наличие ошибок
		this.data.config.hasError =
			this.data.config.hasUnitsError
			|| this.data.config.hasGoalsError
			|| this.data.config.hasPeriodsError

		// если ошибок нет, сохраняю
		if(!this.data.config.hasError) {
			if(this.data.config.isNew)
				this.data.config.created = (new Date()).getTime()
			this.data.config.isNew = false
			this.data.config.updated = (new Date()).getTime()
			// сохраняю
			localStorage.setItem(this.localStorageKey, JSON.stringify(this.data))
		}

		this.trigger(this.data)
	},

	// Загрузка данных из хранилищ либо сервера
	loadData() {
		console.log('Fire p==* [%s]', 'STORE.loadData')
		/*var xhr = new XMLHttpRequest()
		xhr.open('get', 'data.php', true)
		xhr.onload = function() {
			console.log('Fire p==* [%s]', 'STORE.loadData Response', xhr.responseText)
			this.onLoadData(xhr.responseText)
		}.bind(this)
		xhr.send()*/
		let data = localStorage.getItem(this.localStorageKey)

		if(data != null) {
			this.data = JSON.parse(data)
			this.updateLinksToUnits()
		}

		this.trigger(this.data)
	},

	//	----- методы управления данными -----

	// Выполняет проверку Единиц измерения
	checkUnits() {
		// Время
		this.data.units.unit_time.error = (
			this.data.units.unit_time.value
				? null
				: 'Значение должно быть назначено')
		// Результат
		this.data.units.unit_result.error = (
			this.data.units.unit_result.value
				? null
				: 'Значение должно быть назначено')
		// Расходы
		this.data.units.unit_expense.error = (
			this.data.units.unit_expense.value
				? null
				: 'Значение должно быть назначено')
	},

	// Выполняет проверку Целевых показателей
	checkGoals() {
		// КПРплан
		this.data.goals.kpr.error = (
			typeof this.data.goals.kpr.value == "number"
			&& this.data.goals.kpr.value
				? null
				: 'Значение должно быть больше нуля')
		// ППР
		// ПРПЗ
		this.data.goals.prpz.error = (
			typeof this.data.goals.prpz.value == "number"
			&& this.data.goals.prpz.value
				? null
				: 'Значение должно быть больше нуля')
		// ПН
		this.data.goals.pn.error = (this.data.goals.pn.value
			? null
			: 'Укажите правильную дату')
		// ПО
		this.data.goals.po.error = (this.data.goals.po.value
			? null
			: 'Укажите правильную дату')
		// ПД
		this.data.goals.pd.error = (this.data.goals.pd.value
			? null
			: 'Плановая длительность не задана, проверьте даты')

		// устанавливаю флаг ошибок, если есть
		this.data.config.hasGoalsError =
				!!this.data.goals.kpr.error
			||	!!this.data.goals.ppr.error
			||	!!this.data.goals.prpz.error
			||	!!this.data.goals.pn.error
			||	!!this.data.goals.po.error
			||	!!this.data.goals.pd.error
	},

	// выполняет проверку данных по периодам
	checkPeriods() {
		this.data.config.hasPeriodsError = false
	},

	// Обновляет ссылки на единицы измерений
	updateLinksToUnits() {
		// целевые показатели
		this.data.goals.kpr.unit = this.data.units.unit_result
		this.data.goals.ppr.unit = this.data.units.unit_expense
		this.data.goals.prpz.unit = this.data.units.unit_expense
		this.data.goals.pd.unit = this.data.units.unit_time
		// периоды
		for(let i in this.data.periods) {
			this.data.periods[i].pd.unit = this.data.units.unit_time
			this.data.periods[i].kpr.unit = this.data.units.unit_result
			this.data.periods[i].prpz.unit = this.data.units.unit_expense
			this.data.periods[i].kpr_fact.unit = this.data.units.unit_result
			this.data.periods[i].frfz.unit = this.data.units.unit_expense
		}
	},

	// Сбрасывает данные в значения по умолчанию
	resetData() {
		// настройки задачи
		let config = {
			isNew: true,
			hasUnitsError: false,
			hasGoalsError: false,
			hasPeriodsError: false,
			hasError: false,
			created: null,
			updated: null,
		}
		// единицы измерения
		let units = {
			unit_time: {
				type: 'text',
				title: 'Единица измерения времени',
				value: 'дн.',
				placeholder: 'Доступно: день/сутки, неделя, месяц, квартал, год',
				readonly: true
			},
			unit_result: {
				type: 'text',
				title: 'Единица измерения результата',
				placeholder: 'Например: кг., км., млн. руб., шт.'
			},
			unit_expense: {
				type: 'text',
				title: 'Единица измерения расходов',
				placeholder: 'Например: кг., км., млн. руб., шт.'
			}
		}

		// целевые показатели
		let goals = {
			kpr: {
				type: 'number',
				title: 'Ключевой показатель результата',
				placeholder: 'КПРплн'
			},
			ppr_check: {
				type: 'checkbox',
				title: 'Оценка эффективности проекта по прибыли',
				description: 'Не заполняйте, если ведется некоммерческая деятельность'
			},
			ppr: {
				type: 'number',
				title: 'Размер плановой прибыли',
				placeholder: 'ППР',
			},
			prpz: {
				type: 'number',
				title: 'Сумма расходов',
				placeholder: 'ПРПЗ'
			},
			krp: {
				type: 'number',
				title: 'Коэффициент прибыли по результату',
				placeholder: 'Крп',
				readonly: true
			},
			pn: {
				type: 'date',
				title: 'Дата начала',
				placeholder: 'ПН (гггг-мм-чч)',
				//value: '1425772800000'	// 03.08.2015 ну или 2015-03-08 GMT
			},
			po: {
				type: 'date',
				title: 'Дата окончания',
				placeholder: 'ПО (гггг-мм-чч)'
			},
			pd: {
				type: 'number',
				title: 'Длительность (дней)',
				placeholder: 'ПД',
				readonly: true,
			},
			currency: {
				title: 'Валюта',
				range: [
					{title: 'Рубль', value: 'ruble', className: 'ruble'},
					{title: 'Доллар', value: 'usd', className: 'usd'},
					{title: 'Евро', value: 'euro', className: 'euro'},
				],
			},
			plan_range: {
				title: 'Интервал планирования / отчетности',
				range: [
					{title: 'Сутки', value: 'day'},
					{title: 'Неделя', value: 'week'},
					{title: 'Месяц', value: 'month'},
					{title: 'Квартал', value: 'quarter'},
					{title: 'Полугодие', value: 'half-year'},
					{title: 'Год', value: 'year'},
				]
			},
			plan_count: {
				title: 'Количество интервалов планирования',
				readonly: true,
			},
			plan_method: {
				title: 'Метод распределения плановых значений результата и расходов по длительности',
				range: [
					{title: 'Ручное', value: 'manual'},
					{title: 'Равномерно', value: 'auto'},
				],
			},
			project_name: {
				title: 'Название проекта (задачи)',
				placeholder: 'Введите название'
			},
			result_name: {
				title: 'Что измеряется в качестве результата',
				placeholder: 'Название результата'
			},
			result_method: {
				title: 'Измерение уровня эффективности',
				range: [
					{title: 'В долях', value: 'share'},
					{title: 'В процентах', value: 'percent'},
				],
			},
			fd: {
				type: 'number',
				title: 'Фактическая длительность',
				placeholder: 'ФД',
			},
			autor_name: {
				title: 'Автор задачи',
				placeholder: 'Создатель задачи'
			},
			// method: {
			// 	title: 'Метод распределения плановых значений результата и расходов по длительности',
			// 	range: [
			// 		{title: 'Ручное', value: 'manual'},
			// 		{title: 'Равномерно', value: 'evenly'},
			// 	],
			// },
			// efficiency_measuring: {
			// 	title: 'Измерение уровня эффективности',
			// 	range: [
			// 		{title: 'В долях', value: 'share'},
			// 		{title: 'В процентах', value: 'percent'},
			// 	],
			// },
		}

		// данные по периодам
		let periods = []

		// объект показателей
		this.data = {
			config: config,
			units: units,
			goals: goals,
			periods: periods,
		}

		// добавлю один период
		// this.addNewPeriod()

		// обновлю ссылки на единицы измерения
		this.updateLinksToUnits()
	},

	// Очистка периодов
	clearPeriods() {
		this.data.periods = []
	},

	// Добавление нового пустого периода
	addNewPeriod(pn, po, kpr, prpz, fd, kpr_fact, frfz) {
		console.log('Fire p==* [STORE.AddNewPeriod]', [pn, po, kpr, prpz])
		kpr = (parseInt(kpr) || 0) * 1.0
		prpz = (parseInt(prpz) || 0) * 1.0
		fd = (parseInt(fd) || 0) * 1
		kpr_fact = (parseInt(kpr_fact) || 0) * 1.0
		frfz = (parseInt(frfz) || 0) * 1.0
		// расчеты
		let
			pd = (pn && po && po >= pn
				? Math.floor((po - pn) / 86400000) + 1	// окончание - начало + 1
				: null)
		// добавляю период
		this.data.periods.push({
			pn: {
				type: 'date',
				title: 'Плановая дата начала',
				placeholder: 'гггг-мм-чч',
				value: pn || null,
			},
			po: {
				type: 'date',
				title: 'Плановая дата окончания',
				placeholder: 'гггг-мм-чч',
				value: po || null,
			},
			pd: {
				type: 'number',
				title: 'Плановая длительность',
				readonly: true,
				value: pd,
			},
			kpr: {
				type: 'number',
				title: 'Ключевой показатель результата',
				value: kpr || null,
			},
			prpz: {
				type: 'number',
				title: 'Бюджет (Плановые расходы плановой задачи)',
				value: prpz || null,
			},
			/*
			fn: {
				type: 'date',
				title: 'Фактическая дата начала',
				placeholder: 'гггг-мм-чч',
			},
			fo: {
				type: 'date',
				title: 'Фактическая дата окончания',
				placeholder: 'гггг-мм-чч'
			},
			*/
			fd: {
				type: 'number',
				title: 'Фактическая длительность',
				readonly: false,
				value: fd || null,
			},
			kpr_fact: {
				type: 'number',
				title: 'Фактический результат',
				value: kpr_fact || null,
			},
			frfz: {
				type: 'number',
				title: 'Фактические расходы фактической задачи',
				value: frfz || null,
			},
		})
	},

	// Инициализация стейта
	getInitialState() {
		// сброс по умолчанию
		this.resetData()

		// запускаю загрузку данных
		this.loadData()

		return this.data
	}

})

module.exports = CalculatorStore
