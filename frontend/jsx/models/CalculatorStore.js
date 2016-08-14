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
		// data_array = [kpr, ppr_check, ppr, prpz, pn, po]
		this.data.units.unit_time.value = data_array.unit_time || this.data.units.unit_time.value
		this.data.units.unit_result.value = data_array.unit_result || this.data.units.unit_result.value
		this.data.units.unit_expense.value = data_array.unit_expense || this.data.units.unit_expense.value

		this.data.goals.project_name.value = data_array.project_name || this.data.goals.project_name.value
		this.data.goals.result_name.value = data_array.result_name || this.data.goals.result_name.value

		// парсинг чисел
		let kpr = Tools.parseFloatOrNull(data_array.kpr),
			ppr_check = (data_array.ppr_check ? true : false),
			ppr = (ppr_check ? Tools.parseFloatOrNull(data_array.ppr) : null),
			prpz = Tools.parseFloatOrNull(data_array.prpz),
			plan_range = Tools.parseIntOrNull(data_array.plan_range),
			plan_range_count = this.data.goals.plan_range.range.length,
			plan_method = Tools.parseIntOrNull(data_array.plan_method),
			plan_method_count = this.data.goals.plan_method.range.length,
			result_method = Tools.parseIntOrNull(data_array.result_method),
			result_method_count = this.data.goals.result_method.range.length,
			pn = Tools.parseIntOrNull(data_array.pn),
			po = Tools.parseIntOrNull(data_array.po)
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
		data.results = []

		// на каждый период нужно разбить КПРплн и ПРПЗ
		let day_length = 86400000,
			days = Math.floor((data.goals.po.value - data.goals.pn.value) / day_length) + 1,
			kpr = data.goals.kpr.value * 100,
			prpz = data.goals.prpz.value * 100

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
				console.info('PERIODA', i, kpr, prpz, kpr_, prpz_)
				this.addNewPeriod(period.n, period.o, kpr_ / 100.0, prpz_ / 100.0)
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
							fd: period.pd.value,
							kprp: period.kpr.value,
							prpz: period.prpz.value,
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
		console.log('Fire p==* [STORE.setResults]', taskResults)

		this.data.results = taskResults
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
	onAddNewPeriod(pn, po, kpr, prpz, kpr_fact, frfz) {
		this.addNewPeriod(pn, po, kpr, prpz, kpr_fact, frfz)
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

		localStorage.setItem(this.localStorageKey, '{"config":{"isNew":false,"hasUnitsError":false,"hasGoalsError":false,"hasPeriodsError":false,"hasError":false,"created":1471166967525,"updated":1471189130507},"units":{"unit_time":{"type":"text","title":"Единица измерения времени","value":"дн.","placeholder":"Доступно: день/сутки, неделя, месяц, квартал, год","readonly":true,"error":null},"unit_result":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null},"unit_expense":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}},"goals":{"kpr":{"type":"number","title":"Ключевой показатель результата","placeholder":"КПРплн","unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null},"value":18,"error":null},"ppr_check":{"type":"checkbox","title":"Оценка эффективности проекта по прибыли","description":"Не заполняйте, если ведется некоммерческая деятельность","value":true},"ppr":{"type":"number","title":"Размер плановой прибыли","placeholder":"ППР","unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null},"value":10},"prpz":{"type":"number","title":"Сумма расходов","placeholder":"ПРПЗ","unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null},"value":18,"error":null},"krp":{"type":"number","title":"Коэффициент прибыли по результату","placeholder":"Крп","readonly":true,"value":1.8},"pn":{"type":"date","title":"Дата начала","placeholder":"ПН (гггг-мм-чч)","value":1470960000000,"error":null},"po":{"type":"date","title":"Дата окончания","placeholder":"ПО (гггг-мм-чч)","value":1472428800000,"error":null},"pd":{"type":"number","title":"Длительность (дней)","placeholder":"ПД","readonly":true,"unit":{"type":"text","title":"Единица измерения времени","value":"дн.","placeholder":"Доступно: день/сутки, неделя, месяц, квартал, год","readonly":true,"error":null},"value":18,"error":null},"plan_range":{"title":"Интервал планирования / отчетности","range":[{"title":"Сутки","value":"day"},{"title":"Неделя","value":"week"},{"title":"Месяц","value":"month"},{"title":"Квартал","value":"quarter"},{"title":"Полугодие","value":"half-year"},{"title":"Год","value":"year"}],"value":0},"plan_count":{"title":"Количество интервалов планирования","readonly":true,"value":18,"periods":[{"n":1470960000000,"o":1470960000000},{"n":1471046400000,"o":1471046400000},{"n":1471132800000,"o":1471132800000},{"n":1471219200000,"o":1471219200000},{"n":1471305600000,"o":1471305600000},{"n":1471392000000,"o":1471392000000},{"n":1471478400000,"o":1471478400000},{"n":1471564800000,"o":1471564800000},{"n":1471651200000,"o":1471651200000},{"n":1471737600000,"o":1471737600000},{"n":1471824000000,"o":1471824000000},{"n":1471910400000,"o":1471910400000},{"n":1471996800000,"o":1471996800000},{"n":1472083200000,"o":1472083200000},{"n":1472169600000,"o":1472169600000},{"n":1472256000000,"o":1472256000000},{"n":1472342400000,"o":1472342400000},{"n":1472428800000,"o":1472428800000}]},"plan_method":{"title":"Метод распределения плановых значений результата и расходов по длительности","range":[{"title":"Ручное","value":"manual"},{"title":"Равномерно","value":"auto"}],"value":1},"project_name":{"title":"Название проекта (задачи)","placeholder":"Введите название","value":"Строительство моста"},"result_name":{"title":"Что измеряется в качестве результата","placeholder":"Название результата","value":"Мост"},"result_method":{"title":"Измерение уровня эффективности","range":[{"title":"В долях","value":"share"},{"title":"В процентах","value":"percent"}],"value":0},"autor_name":{"title":"Автор задачи","placeholder":"Создатель задачи"}},"periods":[{"pn":{"type":"date","title":"Плановая дата начала","placeholder":"гггг-мм-чч","value":1470960000000},"po":{"type":"date","title":"Плановая дата окончания","placeholder":"гггг-мм-чч","value":1470960000000},"pd":{"type":"number","title":"Плановая длительность","readonly":true,"value":1,"unit":{"type":"text","title":"Единица измерения времени","value":"дн.","placeholder":"Доступно: день/сутки, неделя, месяц, квартал, год","readonly":true,"error":null}},"kpr":{"type":"number","title":"Ключевой показатель результата","value":1,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"prpz":{"type":"number","title":"Бюджет (Плановые расходы плановой задачи)","value":1,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}},"kpr_fact":{"type":"number","title":"Фактический результат","value":1,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"frfz":{"type":"number","title":"Фактические расходы фактической задачи","value":1,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}}},{"pn":{"type":"date","title":"Плановая дата начала","placeholder":"гггг-мм-чч","value":1471046400000},"po":{"type":"date","title":"Плановая дата окончания","placeholder":"гггг-мм-чч","value":1471046400000},"pd":{"type":"number","title":"Плановая длительность","readonly":true,"value":1,"unit":{"type":"text","title":"Единица измерения времени","value":"дн.","placeholder":"Доступно: день/сутки, неделя, месяц, квартал, год","readonly":true,"error":null}},"kpr":{"type":"number","title":"Ключевой показатель результата","value":1,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"prpz":{"type":"number","title":"Бюджет (Плановые расходы плановой задачи)","value":1,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}},"kpr_fact":{"type":"number","title":"Фактический результат","value":2,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"frfz":{"type":"number","title":"Фактические расходы фактической задачи","value":2,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}}},{"pn":{"type":"date","title":"Плановая дата начала","placeholder":"гггг-мм-чч","value":1471132800000},"po":{"type":"date","title":"Плановая дата окончания","placeholder":"гггг-мм-чч","value":1471132800000},"pd":{"type":"number","title":"Плановая длительность","readonly":true,"value":1,"unit":{"type":"text","title":"Единица измерения времени","value":"дн.","placeholder":"Доступно: день/сутки, неделя, месяц, квартал, год","readonly":true,"error":null}},"kpr":{"type":"number","title":"Ключевой показатель результата","value":null,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"prpz":{"type":"number","title":"Бюджет (Плановые расходы плановой задачи)","value":1,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}},"kpr_fact":{"type":"number","title":"Фактический результат","value":2,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"frfz":{"type":"number","title":"Фактические расходы фактической задачи","value":2,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}}},{"pn":{"type":"date","title":"Плановая дата начала","placeholder":"гггг-мм-чч","value":1471219200000},"po":{"type":"date","title":"Плановая дата окончания","placeholder":"гггг-мм-чч","value":1471219200000},"pd":{"type":"number","title":"Плановая длительность","readonly":true,"value":1,"unit":{"type":"text","title":"Единица измерения времени","value":"дн.","placeholder":"Доступно: день/сутки, неделя, месяц, квартал, год","readonly":true,"error":null}},"kpr":{"type":"number","title":"Ключевой показатель результата","value":null,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"prpz":{"type":"number","title":"Бюджет (Плановые расходы плановой задачи)","value":1,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}},"kpr_fact":{"type":"number","title":"Фактический результат","value":-0.5,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"frfz":{"type":"number","title":"Фактические расходы фактической задачи","value":2,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}}},{"pn":{"type":"date","title":"Плановая дата начала","placeholder":"гггг-мм-чч","value":1471305600000},"po":{"type":"date","title":"Плановая дата окончания","placeholder":"гггг-мм-чч","value":1471305600000},"pd":{"type":"number","title":"Плановая длительность","readonly":true,"value":1,"unit":{"type":"text","title":"Единица измерения времени","value":"дн.","placeholder":"Доступно: день/сутки, неделя, месяц, квартал, год","readonly":true,"error":null}},"kpr":{"type":"number","title":"Ключевой показатель результата","value":null,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"prpz":{"type":"number","title":"Бюджет (Плановые расходы плановой задачи)","value":null,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}},"kpr_fact":{"type":"number","title":"Фактический результат","value":2,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"frfz":{"type":"number","title":"Фактические расходы фактической задачи","value":2,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}}},{"pn":{"type":"date","title":"Плановая дата начала","placeholder":"гггг-мм-чч","value":1471392000000},"po":{"type":"date","title":"Плановая дата окончания","placeholder":"гггг-мм-чч","value":1471392000000},"pd":{"type":"number","title":"Плановая длительность","readonly":true,"value":1,"unit":{"type":"text","title":"Единица измерения времени","value":"дн.","placeholder":"Доступно: день/сутки, неделя, месяц, квартал, год","readonly":true,"error":null}},"kpr":{"type":"number","title":"Ключевой показатель результата","value":null,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"prpz":{"type":"number","title":"Бюджет (Плановые расходы плановой задачи)","value":null,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}},"kpr_fact":{"type":"number","title":"Фактический результат","value":null,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"frfz":{"type":"number","title":"Фактические расходы фактической задачи","value":2,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}}},{"pn":{"type":"date","title":"Плановая дата начала","placeholder":"гггг-мм-чч","value":1471478400000},"po":{"type":"date","title":"Плановая дата окончания","placeholder":"гггг-мм-чч","value":1471478400000},"pd":{"type":"number","title":"Плановая длительность","readonly":true,"value":1,"unit":{"type":"text","title":"Единица измерения времени","value":"дн.","placeholder":"Доступно: день/сутки, неделя, месяц, квартал, год","readonly":true,"error":null}},"kpr":{"type":"number","title":"Ключевой показатель результата","value":null,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"prpz":{"type":"number","title":"Бюджет (Плановые расходы плановой задачи)","value":null,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}},"kpr_fact":{"type":"number","title":"Фактический результат","value":null,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"frfz":{"type":"number","title":"Фактические расходы фактической задачи","value":null,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}}},{"pn":{"type":"date","title":"Плановая дата начала","placeholder":"гггг-мм-чч","value":1471564800000},"po":{"type":"date","title":"Плановая дата окончания","placeholder":"гггг-мм-чч","value":1471564800000},"pd":{"type":"number","title":"Плановая длительность","readonly":true,"value":1,"unit":{"type":"text","title":"Единица измерения времени","value":"дн.","placeholder":"Доступно: день/сутки, неделя, месяц, квартал, год","readonly":true,"error":null}},"kpr":{"type":"number","title":"Ключевой показатель результата","value":null,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"prpz":{"type":"number","title":"Бюджет (Плановые расходы плановой задачи)","value":1,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}},"kpr_fact":{"type":"number","title":"Фактический результат","value":null,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"frfz":{"type":"number","title":"Фактические расходы фактической задачи","value":null,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}}},{"pn":{"type":"date","title":"Плановая дата начала","placeholder":"гггг-мм-чч","value":1471651200000},"po":{"type":"date","title":"Плановая дата окончания","placeholder":"гггг-мм-чч","value":1471651200000},"pd":{"type":"number","title":"Плановая длительность","readonly":true,"value":1,"unit":{"type":"text","title":"Единица измерения времени","value":"дн.","placeholder":"Доступно: день/сутки, неделя, месяц, квартал, год","readonly":true,"error":null}},"kpr":{"type":"number","title":"Ключевой показатель результата","value":null,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"prpz":{"type":"number","title":"Бюджет (Плановые расходы плановой задачи)","value":1,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}},"kpr_fact":{"type":"number","title":"Фактический результат","value":null,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"frfz":{"type":"number","title":"Фактические расходы фактической задачи","value":2,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}}},{"pn":{"type":"date","title":"Плановая дата начала","placeholder":"гггг-мм-чч","value":1471737600000},"po":{"type":"date","title":"Плановая дата окончания","placeholder":"гггг-мм-чч","value":1471737600000},"pd":{"type":"number","title":"Плановая длительность","readonly":true,"value":1,"unit":{"type":"text","title":"Единица измерения времени","value":"дн.","placeholder":"Доступно: день/сутки, неделя, месяц, квартал, год","readonly":true,"error":null}},"kpr":{"type":"number","title":"Ключевой показатель результата","value":null,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"prpz":{"type":"number","title":"Бюджет (Плановые расходы плановой задачи)","value":null,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}},"kpr_fact":{"type":"number","title":"Фактический результат","value":2,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"frfz":{"type":"number","title":"Фактические расходы фактической задачи","value":null,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}}},{"pn":{"type":"date","title":"Плановая дата начала","placeholder":"гггг-мм-чч","value":1471824000000},"po":{"type":"date","title":"Плановая дата окончания","placeholder":"гггг-мм-чч","value":1471824000000},"pd":{"type":"number","title":"Плановая длительность","readonly":true,"value":1,"unit":{"type":"text","title":"Единица измерения времени","value":"дн.","placeholder":"Доступно: день/сутки, неделя, месяц, квартал, год","readonly":true,"error":null}},"kpr":{"type":"number","title":"Ключевой показатель результата","value":null,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"prpz":{"type":"number","title":"Бюджет (Плановые расходы плановой задачи)","value":1,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}},"kpr_fact":{"type":"number","title":"Фактический результат","value":2,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"frfz":{"type":"number","title":"Фактические расходы фактической задачи","value":null,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}}},{"pn":{"type":"date","title":"Плановая дата начала","placeholder":"гггг-мм-чч","value":1471910400000},"po":{"type":"date","title":"Плановая дата окончания","placeholder":"гггг-мм-чч","value":1471910400000},"pd":{"type":"number","title":"Плановая длительность","readonly":true,"value":1,"unit":{"type":"text","title":"Единица измерения времени","value":"дн.","placeholder":"Доступно: день/сутки, неделя, месяц, квартал, год","readonly":true,"error":null}},"kpr":{"type":"number","title":"Ключевой показатель результата","value":1,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"prpz":{"type":"number","title":"Бюджет (Плановые расходы плановой задачи)","value":null,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}},"kpr_fact":{"type":"number","title":"Фактический результат","value":2,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"frfz":{"type":"number","title":"Фактические расходы фактической задачи","value":2,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}}},{"pn":{"type":"date","title":"Плановая дата начала","placeholder":"гггг-мм-чч","value":1471996800000},"po":{"type":"date","title":"Плановая дата окончания","placeholder":"гггг-мм-чч","value":1471996800000},"pd":{"type":"number","title":"Плановая длительность","readonly":true,"value":1,"unit":{"type":"text","title":"Единица измерения времени","value":"дн.","placeholder":"Доступно: день/сутки, неделя, месяц, квартал, год","readonly":true,"error":null}},"kpr":{"type":"number","title":"Ключевой показатель результата","value":1,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"prpz":{"type":"number","title":"Бюджет (Плановые расходы плановой задачи)","value":null,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}},"kpr_fact":{"type":"number","title":"Фактический результат","value":null,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"frfz":{"type":"number","title":"Фактические расходы фактической задачи","value":2,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}}},{"pn":{"type":"date","title":"Плановая дата начала","placeholder":"гггг-мм-чч","value":1472083200000},"po":{"type":"date","title":"Плановая дата окончания","placeholder":"гггг-мм-чч","value":1472083200000},"pd":{"type":"number","title":"Плановая длительность","readonly":true,"value":1,"unit":{"type":"text","title":"Единица измерения времени","value":"дн.","placeholder":"Доступно: день/сутки, неделя, месяц, квартал, год","readonly":true,"error":null}},"kpr":{"type":"number","title":"Ключевой показатель результата","value":1,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"prpz":{"type":"number","title":"Бюджет (Плановые расходы плановой задачи)","value":null,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}},"kpr_fact":{"type":"number","title":"Фактический результат","value":null,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"frfz":{"type":"number","title":"Фактические расходы фактической задачи","value":null,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}}},{"pn":{"type":"date","title":"Плановая дата начала","placeholder":"гггг-мм-чч","value":1472169600000},"po":{"type":"date","title":"Плановая дата окончания","placeholder":"гггг-мм-чч","value":1472169600000},"pd":{"type":"number","title":"Плановая длительность","readonly":true,"value":1,"unit":{"type":"text","title":"Единица измерения времени","value":"дн.","placeholder":"Доступно: день/сутки, неделя, месяц, квартал, год","readonly":true,"error":null}},"kpr":{"type":"number","title":"Ключевой показатель результата","value":1,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"prpz":{"type":"number","title":"Бюджет (Плановые расходы плановой задачи)","value":null,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}},"kpr_fact":{"type":"number","title":"Фактический результат","value":2,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"frfz":{"type":"number","title":"Фактические расходы фактической задачи","value":null,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}}},{"pn":{"type":"date","title":"Плановая дата начала","placeholder":"гггг-мм-чч","value":1472256000000},"po":{"type":"date","title":"Плановая дата окончания","placeholder":"гггг-мм-чч","value":1472256000000},"pd":{"type":"number","title":"Плановая длительность","readonly":true,"value":1,"unit":{"type":"text","title":"Единица измерения времени","value":"дн.","placeholder":"Доступно: день/сутки, неделя, месяц, квартал, год","readonly":true,"error":null}},"kpr":{"type":"number","title":"Ключевой показатель результата","value":1,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"prpz":{"type":"number","title":"Бюджет (Плановые расходы плановой задачи)","value":1,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}},"kpr_fact":{"type":"number","title":"Фактический результат","value":null,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"frfz":{"type":"number","title":"Фактические расходы фактической задачи","value":null,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}}},{"pn":{"type":"date","title":"Плановая дата начала","placeholder":"гггг-мм-чч","value":1472342400000},"po":{"type":"date","title":"Плановая дата окончания","placeholder":"гггг-мм-чч","value":1472342400000},"pd":{"type":"number","title":"Плановая длительность","readonly":true,"value":1,"unit":{"type":"text","title":"Единица измерения времени","value":"дн.","placeholder":"Доступно: день/сутки, неделя, месяц, квартал, год","readonly":true,"error":null}},"kpr":{"type":"number","title":"Ключевой показатель результата","value":1,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"prpz":{"type":"number","title":"Бюджет (Плановые расходы плановой задачи)","value":1,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}},"kpr_fact":{"type":"number","title":"Фактический результат","value":null,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"frfz":{"type":"number","title":"Фактические расходы фактической задачи","value":2,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}}},{"pn":{"type":"date","title":"Плановая дата начала","placeholder":"гггг-мм-чч","value":1472428800000},"po":{"type":"date","title":"Плановая дата окончания","placeholder":"гггг-мм-чч","value":1472428800000},"pd":{"type":"number","title":"Плановая длительность","readonly":true,"value":1,"unit":{"type":"text","title":"Единица измерения времени","value":"дн.","placeholder":"Доступно: день/сутки, неделя, месяц, квартал, год","readonly":true,"error":null}},"kpr":{"type":"number","title":"Ключевой показатель результата","value":1,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"prpz":{"type":"number","title":"Бюджет (Плановые расходы плановой задачи)","value":1,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}},"kpr_fact":{"type":"number","title":"Фактический результат","value":2,"unit":{"type":"text","title":"Единица измерения результата","placeholder":"Например: кг., км., млн. руб., шт.","value":"км","error":null}},"frfz":{"type":"number","title":"Фактические расходы фактической задачи","value":null,"unit":{"title":"Валюта","range":[{"title":"Рубль","value":"₽","className":"ruble"},{"title":"Доллар","value":"$","className":"usd"},{"title":"Евро","value":"€","className":"euro"}],"value":0,"error":null}}}],"results":[{"kpr_plan":1,"prpz":1,"pd":1,"kpr_fact":1,"frfz":1,"fd":1,"prfz":1,"kd":1,"ks":1,"kr":1,"eff":1,"sum_kpr_plan":1,"sum_prpz":1,"sum_pd":1,"sum_kpr_fact":1,"sum_frfz":1,"sum_fd":1,"sum_prfz":1,"sum_kd":1,"sum_ks":1,"sum_kr":1,"sum_eff":1,"frc_fd":18,"frc_frfz":18,"frc_pr":10,"frc_pre":10,"deva_fd":0,"deva_frfz":0,"deva_kpr":0,"devr_fd":0,"devr_frfz":0,"devr_kpr":0},{"kpr_plan":1,"prpz":1,"pd":1,"kpr_fact":2,"frfz":2,"fd":1,"prfz":2,"kd":1,"ks":2,"kr":1,"eff":2,"sum_kpr_plan":2,"sum_prpz":2,"sum_pd":2,"sum_kpr_fact":3,"sum_frfz":3,"sum_fd":2,"sum_prfz":3,"sum_kd":1,"sum_ks":1.5,"sum_kr":1,"sum_eff":1.5,"frc_fd":12,"frc_frfz":18,"frc_pr":10,"frc_pre":15,"deva_fd":0,"deva_frfz":-1,"deva_kpr":-1,"devr_fd":0,"devr_frfz":-0.5,"devr_kpr":-0.5},{"kpr_plan":null,"prpz":1,"pd":1,"kpr_fact":2,"frfz":2,"fd":1,"prfz":null,"kd":1,"ks":1,"kr":-0.8,"eff":-0.8,"sum_kpr_plan":2,"sum_prpz":3,"sum_pd":3,"sum_kpr_fact":5,"sum_frfz":5,"sum_fd":3,"sum_prfz":7.5,"sum_kd":1,"sum_ks":2.5,"sum_kr":1.6,"sum_eff":4,"frc_fd":7.2,"frc_frfz":12,"frc_pr":16,"frc_pre":40,"deva_fd":0,"deva_frfz":-2,"deva_kpr":-3,"devr_fd":0,"devr_frfz":-0.66666666666667,"devr_kpr":-1.5},{"kpr_plan":null,"prpz":1,"pd":1,"kpr_fact":-0.5,"frfz":2,"fd":1,"prfz":null,"kd":1,"ks":0,"kr":-0.8,"eff":0,"sum_kpr_plan":2,"sum_prpz":4,"sum_pd":4,"sum_kpr_fact":4.5,"sum_frfz":7,"sum_fd":4,"sum_prfz":9,"sum_kd":1,"sum_ks":2.25,"sum_kr":1.4,"sum_eff":3.15,"frc_fd":8,"frc_frfz":14,"frc_pr":14,"frc_pre":31.5,"deva_fd":0,"deva_frfz":-3,"deva_kpr":-2.5,"devr_fd":0,"devr_frfz":-0.75,"devr_kpr":-1.25},{"kpr_plan":null,"prpz":null,"pd":1,"kpr_fact":2,"frfz":2,"fd":1,"prfz":null,"kd":1,"ks":1,"kr":0,"eff":0,"sum_kpr_plan":2,"sum_prpz":4,"sum_pd":5,"sum_kpr_fact":6.5,"sum_frfz":9,"sum_fd":5,"sum_prfz":13,"sum_kd":1,"sum_ks":3.25,"sum_kr":1.5538461538462,"sum_eff":5.05,"frc_fd":5.5384615384615,"frc_frfz":12.461538461538,"frc_pr":15.538461538462,"frc_pre":50.5,"deva_fd":0,"deva_frfz":-5,"deva_kpr":-4.5,"devr_fd":0,"devr_frfz":-1.25,"devr_kpr":-2.25},{"kpr_plan":null,"prpz":null,"pd":1,"kpr_fact":null,"frfz":2,"fd":1,"prfz":null,"kd":1,"ks":1,"kr":0,"eff":0,"sum_kpr_plan":2,"sum_prpz":4,"sum_pd":6,"sum_kpr_fact":6.5,"sum_frfz":11,"sum_fd":6,"sum_prfz":13,"sum_kd":1,"sum_ks":3.25,"sum_kr":1.2769230769231,"sum_eff":4.15,"frc_fd":5.5384615384615,"frc_frfz":15.230769230769,"frc_pr":12.769230769231,"frc_pre":41.5,"deva_fd":0,"deva_frfz":-7,"deva_kpr":-4.5,"devr_fd":0,"devr_frfz":-1.75,"devr_kpr":-2.25},{"kpr_plan":null,"prpz":null,"pd":1,"kpr_fact":null,"frfz":null,"fd":1,"prfz":null,"kd":1,"ks":1,"kr":1,"eff":1,"sum_kpr_plan":2,"sum_prpz":4,"sum_pd":7,"sum_kpr_fact":6.5,"sum_frfz":11,"sum_fd":7,"sum_prfz":13,"sum_kd":1,"sum_ks":3.25,"sum_kr":1.2769230769231,"sum_eff":4.15,"frc_fd":5.5384615384615,"frc_frfz":15.230769230769,"frc_pr":12.769230769231,"frc_pre":41.5,"deva_fd":0,"deva_frfz":-7,"deva_kpr":-4.5,"devr_fd":0,"devr_frfz":-1.75,"devr_kpr":-2.25},{"kpr_plan":null,"prpz":1,"pd":1,"kpr_fact":null,"frfz":null,"fd":1,"prfz":null,"kd":1,"ks":1,"kr":2.8,"eff":2.8,"sum_kpr_plan":2,"sum_prpz":5,"sum_pd":8,"sum_kpr_fact":6.5,"sum_frfz":11,"sum_fd":8,"sum_prfz":16.25,"sum_kd":1,"sum_ks":3.25,"sum_kr":1.5815384615385,"sum_eff":5.14,"frc_fd":5.5384615384615,"frc_frfz":12.184615384615,"frc_pr":15.815384615385,"frc_pre":51.4,"deva_fd":0,"deva_frfz":-6,"deva_kpr":-4.5,"devr_fd":0,"devr_frfz":-1.2,"devr_kpr":-2.25},{"kpr_plan":null,"prpz":1,"pd":1,"kpr_fact":null,"frfz":2,"fd":1,"prfz":null,"kd":1,"ks":1,"kr":-0.8,"eff":-0.8,"sum_kpr_plan":2,"sum_prpz":6,"sum_pd":9,"sum_kpr_fact":6.5,"sum_frfz":13,"sum_fd":9,"sum_prfz":19.5,"sum_kd":1,"sum_ks":3.25,"sum_kr":1.6,"sum_eff":5.2,"frc_fd":5.5384615384615,"frc_frfz":12,"frc_pr":16,"frc_pre":52,"deva_fd":0,"deva_frfz":-7,"deva_kpr":-4.5,"devr_fd":0,"devr_frfz":-1.1666666666667,"devr_kpr":-2.25},{"kpr_plan":null,"prpz":null,"pd":1,"kpr_fact":2,"frfz":null,"fd":1,"prfz":null,"kd":1,"ks":1,"kr":1,"eff":1,"sum_kpr_plan":2,"sum_prpz":6,"sum_pd":10,"sum_kpr_fact":8.5,"sum_frfz":13,"sum_fd":10,"sum_prfz":25.5,"sum_kd":1,"sum_ks":4.25,"sum_kr":1.8823529411765,"sum_eff":8,"frc_fd":4.2352941176471,"frc_frfz":9.1764705882353,"frc_pr":18.823529411765,"frc_pre":80,"deva_fd":0,"deva_frfz":-7,"deva_kpr":-6.5,"devr_fd":0,"devr_frfz":-1.1666666666667,"devr_kpr":-3.25},{"kpr_plan":null,"prpz":1,"pd":1,"kpr_fact":2,"frfz":null,"fd":1,"prfz":null,"kd":1,"ks":1,"kr":2.8,"eff":2.8,"sum_kpr_plan":2,"sum_prpz":7,"sum_pd":11,"sum_kpr_fact":10.5,"sum_frfz":13,"sum_fd":11,"sum_prfz":36.75,"sum_kd":1,"sum_ks":5.25,"sum_kr":2.1632653061224,"sum_eff":11.357142857143,"frc_fd":3.4285714285714,"frc_frfz":6.3673469387755,"frc_pr":21.632653061224,"frc_pre":113.57142857143,"deva_fd":0,"deva_frfz":-6,"deva_kpr":-8.5,"devr_fd":0,"devr_frfz":-0.85714285714286,"devr_kpr":-4.25},{"kpr_plan":1,"prpz":null,"pd":1,"kpr_fact":2,"frfz":2,"fd":1,"prfz":null,"kd":1,"ks":2,"kr":0,"eff":0,"sum_kpr_plan":3,"sum_prpz":7,"sum_pd":12,"sum_kpr_fact":12.5,"sum_frfz":15,"sum_fd":12,"sum_prfz":29.166666666667,"sum_kd":1,"sum_ks":4.1666666666667,"sum_kr":1.8742857142857,"sum_eff":7.8095238095238,"frc_fd":4.32,"frc_frfz":9.2571428571429,"frc_pr":18.742857142857,"frc_pre":78.095238095238,"deva_fd":0,"deva_frfz":-8,"deva_kpr":-9.5,"devr_fd":0,"devr_frfz":-1.1428571428571,"devr_kpr":-3.1666666666667},{"kpr_plan":1,"prpz":null,"pd":1,"kpr_fact":null,"frfz":2,"fd":1,"prfz":null,"kd":1,"ks":0,"kr":0,"eff":0,"sum_kpr_plan":4,"sum_prpz":7,"sum_pd":13,"sum_kpr_fact":12.5,"sum_frfz":17,"sum_fd":13,"sum_prfz":21.875,"sum_kd":1,"sum_ks":3.125,"sum_kr":1.4011428571429,"sum_eff":4.3785714285714,"frc_fd":5.76,"frc_frfz":13.988571428571,"frc_pr":14.011428571429,"frc_pre":43.785714285714,"deva_fd":0,"deva_frfz":-10,"deva_kpr":-8.5,"devr_fd":0,"devr_frfz":-1.4285714285714,"devr_kpr":-2.125},{"kpr_plan":1,"prpz":null,"pd":1,"kpr_fact":null,"frfz":null,"fd":1,"prfz":null,"kd":1,"ks":0,"kr":0,"eff":0,"sum_kpr_plan":5,"sum_prpz":7,"sum_pd":14,"sum_kpr_fact":12.5,"sum_frfz":17,"sum_fd":14,"sum_prfz":17.5,"sum_kd":1,"sum_ks":2.5,"sum_kr":1.0514285714286,"sum_eff":2.6285714285714,"frc_fd":7.2,"frc_frfz":17.485714285714,"frc_pr":10.514285714286,"frc_pre":26.285714285714,"deva_fd":0,"deva_frfz":-10,"deva_kpr":-7.5,"devr_fd":0,"devr_frfz":-1.4285714285714,"devr_kpr":-1.5},{"kpr_plan":1,"prpz":null,"pd":1,"kpr_fact":2,"frfz":null,"fd":1,"prfz":null,"kd":1,"ks":2,"kr":1,"eff":2,"sum_kpr_plan":6,"sum_prpz":7,"sum_pd":15,"sum_kpr_fact":14.5,"sum_frfz":17,"sum_fd":15,"sum_prfz":16.916666666667,"sum_kd":1,"sum_ks":2.4166666666667,"sum_kr":0.99113300492611,"sum_eff":2.3952380952381,"frc_fd":7.448275862069,"frc_frfz":18.088669950739,"frc_pr":9.9113300492611,"frc_pre":23.952380952381,"deva_fd":0,"deva_frfz":-10,"deva_kpr":-8.5,"devr_fd":0,"devr_frfz":-1.4285714285714,"devr_kpr":-1.4166666666667},{"kpr_plan":1,"prpz":1,"pd":1,"kpr_fact":null,"frfz":null,"fd":1,"prfz":null,"kd":1,"ks":0,"kr":1,"eff":0,"sum_kpr_plan":7,"sum_prpz":8,"sum_pd":16,"sum_kpr_fact":14.5,"sum_frfz":17,"sum_fd":16,"sum_prfz":16.571428571429,"sum_kd":1,"sum_ks":2.0714285714286,"sum_kr":0.95344827586207,"sum_eff":1.975,"frc_fd":8.6896551724138,"frc_frfz":18.465517241379,"frc_pr":9.5344827586207,"frc_pre":19.75,"deva_fd":0,"deva_frfz":-9,"deva_kpr":-7.5,"devr_fd":0,"devr_frfz":-1.125,"devr_kpr":-1.0714285714286},{"kpr_plan":1,"prpz":1,"pd":1,"kpr_fact":null,"frfz":2,"fd":1,"prfz":null,"kd":1,"ks":0,"kr":0,"eff":0,"sum_kpr_plan":8,"sum_prpz":9,"sum_pd":17,"sum_kpr_fact":14.5,"sum_frfz":19,"sum_fd":17,"sum_prfz":16.3125,"sum_kd":1,"sum_ks":1.8125,"sum_kr":0.70344827586207,"sum_eff":1.275,"frc_fd":9.9310344827586,"frc_frfz":20.965517241379,"frc_pr":7.0344827586207,"frc_pre":12.75,"deva_fd":0,"deva_frfz":-10,"deva_kpr":-6.5,"devr_fd":0,"devr_frfz":-1.1111111111111,"devr_kpr":-0.8125},{"kpr_plan":1,"prpz":1,"pd":1,"kpr_fact":2,"frfz":null,"fd":1,"prfz":2,"kd":1,"ks":2,"kr":2.8,"eff":5.6,"sum_kpr_plan":9,"sum_prpz":10,"sum_pd":18,"sum_kpr_fact":16.5,"sum_frfz":19,"sum_fd":18,"sum_prfz":18.333333333333,"sum_kd":1,"sum_ks":1.8333333333333,"sum_kr":0.93454545454545,"sum_eff":1.7133333333333,"frc_fd":9.8181818181818,"frc_frfz":18.654545454545,"frc_pr":9.3454545454545,"frc_pre":17.133333333333,"deva_fd":0,"deva_frfz":-9,"deva_kpr":-7.5,"devr_fd":0,"devr_frfz":-0.9,"devr_kpr":-0.83333333333333}]}')

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
		console.log('CHECK ERRORS', this.data.config.hasUnitsError, this.data.config.hasGoalsError, this.data.config.hasPeriodsError)

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

		if(data !== null) {
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
			(typeof this.data.units.unit_time.value === 'undefined'
			|| this.data.units.unit_time.value === null)
				? 'Значение должно быть назначено'
				: null)
		// Результат
		this.data.units.unit_result.error = (
			(typeof this.data.units.unit_result.value === 'undefined'
			|| this.data.units.unit_result.value === null)
				? 'Значение должно быть назначено'
				: null)
		// Расходы
		this.data.units.unit_expense.error = (
			(this.data.units.unit_expense.value === 'undefined'
			|| this.data.units.unit_expense.value === null)
				? 'Значение должно быть назначено'
				: null)

		// устанавливаю флаг ошибок, если есть
		this.data.config.hasUnitsError =
				!!this.data.units.unit_time.error
			||	!!this.data.units.unit_result.error
			||	!!this.data.units.unit_expense.error
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
		this.data.goals.ppr.unit = this.data.units.unit_expense
		this.data.goals.pd.unit = this.data.units.unit_time
		// периоды
		for(let i in this.data.periods) {
			this.data.periods[i].kpr.unit = this.data.units.unit_result
			this.data.periods[i].kpr_fact.unit = this.data.units.unit_result
			this.data.periods[i].prpz.unit = this.data.units.unit_expense
			this.data.periods[i].frfz.unit = this.data.units.unit_expense
			this.data.periods[i].pd.unit = this.data.units.unit_time
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
				title: 'Валюта',
				range: [
					{title: 'Рубль', value: '₽', className: 'ruble'},
					{title: 'Доллар', value: '$', className: 'usd'},
					{title: 'Евро', value: '€', className: 'euro'},
				],
				value: 0,
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
			autor_name: {
				title: 'Автор задачи',
				placeholder: 'Создатель задачи'
			},
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
	addNewPeriod(pn, po, kpr, prpz, kpr_fact, frfz) {
		console.log('Fire p==* [STORE.AddNewPeriod]', [pn, po, kpr, prpz])
		kpr = Tools.parseFloatOrNull(kpr)
		prpz = Tools.parseFloatOrNull(prpz)
		kpr_fact = Tools.parseFloatOrNull(kpr_fact)
		frfz = Tools.parseFloatOrNull(frfz)
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
				value: pn,
			},
			po: {
				type: 'date',
				title: 'Плановая дата окончания',
				placeholder: 'гггг-мм-чч',
				value: po,
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
				value: kpr,
			},
			prpz: {
				type: 'number',
				title: 'Бюджет (Плановые расходы плановой задачи)',
				value: prpz,
			},
			kpr_fact: {
				type: 'number',
				title: 'Фактический результат',
				value: kpr_fact,
			},
			frfz: {
				type: 'number',
				title: 'Фактические расходы фактической задачи',
				value: frfz,
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
