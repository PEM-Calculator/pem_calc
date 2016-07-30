'use strict'

// Regex выражения для тестирования и замены даты
// dd-mm-yyyy, dd.mm.yyyy
let dateRegex1 = /^(\d{2})[-\.](\d{2})[-\.](\d{4})$/
// yyyy.mm.dd, yyyy-mm-dd
let dateRegex2 = /^(\d{4})[-\.](\d{2})[-\.](\d{2})$/

let Tools = {
	month_names: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
	month_short_names: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
	week_day_names: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
	week_day_short_names: ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'],
	month_day_count: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],

	// Метод превращает строку с датой в объект Date
	// Если формат даты указан неверно, вернет null
	// Если дата введена ошибочно (но формат соблюден), например 9999-99-99,
	// вернет null
	stringToDate: function(str) {
		//console.log('***Test', str, dateRegex1.test(str), dateRegex2.test(str))
		let date = null

		// работаю только с датой, приставка GMT обязательна
		if(dateRegex1.test(str))
			date = (new Date(str.replace(dateRegex1, "$2/$1/$3 GMT")))
		else if(dateRegex2.test(str))
			date = (new Date(str.replace(dateRegex2, "$2/$3/$1 GMT")))

		//console.log('***Result', date, isNaN(date), isNaN(date.getTime()))

		if(date && (isNaN(date) || isNaN(date.getTime())))
			date = null

		return date
	},

	// Метод переводит строку с датой в милисекунды
	// Раотает на основе метода stringToDate
	stringToTime: function(str) {
		let date = this.stringToDate(str)
		return (date ? date.getTime() : null)
	},

	// Метод переводит милисекунды в дату в ISO формате YYYY-MM-DD
	// humanity - iso или человеческий
	timeToString: function(time, humanity) {
		let date = new Date()
		date.setTime(time)
		//console.log('Date', date)
		if(!time || isNaN(date) || !date)
			return null
		else
			if(humanity)
				return date.toLocaleDateString()
			else
				return date.toISOString().substr(0, 10)
	},

	// Метод считает количество периодов между датами
	calcPlanCount: function(pn, po, plan_range) {
		//console.log('Fire p==* [TOOLS.calcPlanCount]', pn, po, plan_range)
		let type = ['day', 'week', 'month', 'quarter', 'half-year', 'year'].indexOf(plan_range),
				day_length = 24*3600*1000

		if(!pn || !po || type === -1 || pn > po)
			return null

		// получаю количество дней без секунд
		pn = Math.floor(pn / day_length)
		po = Math.floor(po / day_length)

		let start_ = new Date(pn * day_length),
			start = this.parseDate(start_),
			// расчетные переменные
			count = null,
			st = null,
			en = null,
			y = null,
			m = null,
			d = null,
			q = null,
			// результат буду тут хранить
			periods = [],
			// максимальное количество периодов для результата
			max_periods_length = 100

		switch(type) {
			case 0: // day
				count = (po - pn) + 1
				if(count > max_periods_length) count = max_periods_length
				for(let i = 0; i < count; i++) {
					let n = (pn + i) * day_length
					periods.push({n: n, o: n})
				}
				break

			case 1: // week
				st = pn - (start.week_day - 1)
				en = st + 6
				// проверка на одну неделю
				if(en + 1 > po)
					periods.push({n: pn * day_length, o: po * day_length})
				else {
					periods.push({n: pn * day_length, o: en * day_length})
					count = Math.floor((po - pn) / 7) + 2
					if(count > max_periods_length) count = max_periods_length
					for(let i = 1; i < count && en < po; i++) {
						st += 7
						en = st + 6
						if(en > po) en = po
						periods.push({n: st * day_length, o: en * day_length})
					}
				}
				break

			case 2: // month
				st = pn - (start.day - 1)
				y = start.year
				m = start.month
				d = this.getMonthDays(m, y)
				en = st + d - 1
				// проверка на одну неделю
				if(en + 1 > po)
					periods.push({n: pn * day_length, o: po * day_length})
				else {
					periods.push({n: pn * day_length, o: en * day_length})
					count = Math.floor((po - pn) / 30) * 1.1 // не все месяцы по 30 дней
					if(count > max_periods_length) count = max_periods_length
					for(let i = 1; i < count && en < po; i++) {
						st += d
						m++
						if(m > 12) {
							m = 1
							y++
						}
						d = this.getMonthDays(m, y)
						en = st + d - 1
						if(en > po) en = po
						periods.push({n: st * day_length, o: en * day_length})
					}
				}
				break

			case 3: // quarter
				y = start.year
				// определяю номер квартала
				q = Math.floor((start.month + 2) / 3) // 1..4
				// смещусь к началу текущего месяца
				st = pn - (start.day - 1)
				// уменьшаю дни пока не найду начало квартала
				for(let i = start.month - 1; i >= q * 3 - 2; i--)
					st -= this.getMonthDays(i, y)
				d = this.getQuarterDays(q, y)
				en = st + d - 1
				// проверка на одну неделю
				if(en + 1 > po)
					periods.push({n: pn * day_length, o: po * day_length})
				else {
					periods.push({n: pn * day_length, o: en * day_length})
					count = Math.floor((po - pn) / 90) * 1.1 // не все кварталы по 90 дней
					if(count > max_periods_length) count = max_periods_length
					for(let i = 1; i < count && en < po; i++) {
						st += d
						q++
						if(q > 4) {
							q = 1
							y++
						}
						d = this.getQuarterDays(q, y)
						en = st + d - 1
						if(en > po) en = po
						periods.push({n: st * day_length, o: en * day_length})
					}
				}
				break

			case 4: // half-year
				y = start.year
				// определяю номер полугодия
				q = Math.floor((start.month + 5) / 6) // 1..2
				// смещусь к началу текущего месяца
				st = pn - (start.day - 1)
				// уменьшаю дни пока не найду начало квартала
				for(let i = start.month - 1; i >= q * 6 - 5; i--)
					st -= this.getMonthDays(i, y)
				d = this.getHalfyearDays(q, y)
				en = st + d - 1
				// проверка на одну неделю
				if(en + 1 > po)
					periods.push({n: pn * day_length, o: po * day_length})
				else {
					periods.push({n: pn * day_length, o: en * day_length})
					count = Math.floor((po - pn) / 180) * 1.1 // не все полугодия по 180 дней
					if(count > max_periods_length) count = max_periods_length
					for(let i = 1; i < count && en < po; i++) {
						st += d
						q++
						if(q > 2) {
							q = 1
							y++
						}
						d = this.getHalfyearDays(q, y)
						en = st + d - 1
						if(en > po) en = po
						periods.push({n: st * day_length, o: en * day_length})
					}
				}
				break

			case 5: // year
				y = start.year
				m = start.month
				// смещусь к началу текущего месяца
				st = pn - (start.day - 1)
				// уменьшаю дни пока не найду начало года
				for(let i = start.month - 1; i >= 1; i--)
					st -= this.getMonthDays(i, y)
				d = this.getYearDays(y)
				en = st + d - 1
				// проверка на одну неделю
				if(en + 1 > po)
					periods.push({n: pn * day_length, o: po * day_length})
				else {
					periods.push({n: pn * day_length, o: en * day_length})
					count = Math.floor((po - pn) / 365) * 1.25 + 1
					if(count > max_periods_length) count = max_periods_length
					for(let i = 1; i < count && en < po; i++) {
						st += d
						y++
						d = this.getYearDays(y)
						en = st + d - 1
						if(en > po) en = po
						periods.push({n: st * day_length, o: en * day_length})
					}
				}
				break
		}

		return periods
	},

	// получает много информации из даты
	parseDate: function(date_object) {
		let year = date_object.getUTCFullYear(),
			month = date_object.getUTCMonth() + 1,
			day = date_object.getUTCDate(),
			week_day = date_object.getUTCDay() || 7, // 1-MON, 7-SUN
			year_day = this.getYearDaysForDay(day, month, year)

		let jun1_wd = ((week_day - year_day % 7 + 7) % 7) + 1, // день недели 1го января
 			week_number = Math.floor((year_day - week_day) / 7) + 1 // номер недели
		if(jun1_wd <= 4) week_number++ // если первое января выпало на вторую половину недели, номер недели увеличивается
		//console.log('%d-%d-%d {%d} %d-%d #%d', year, month, day, week_day, year_day, jun1_wd, week_number)

		return {
			year				: year,
			month				: month,
			month_name			: this.month_names[month-1],
			month_short_name	: this.month_short_names[month-1],
			day					: day,
			year_day			: year_day,
			week_day			: week_day,
			week_day_name		: this.week_day_names[week_day-1],
			week_day_short_name	: this.week_day_short_names[week_day-1],
			week_number			: week_number,
			date				: [this.padLeft(day, 2, '0'), this.padLeft(month, 2, '0'), year].join('.'),
			quarter_number		: Math.floor((month-1) / 3) + 1,
			half_year_number	: Math.floor((month-1) / 6) + 1,
		}
	},

	// возвращает количество дней в месяце с учетом високосного года
	// month = 1..12
	getMonthDays(month, year) {
		if(month == 2 && year % 4 == 0)
			return 29
		else
			return this.month_day_count[month-1]
	},

	// возвращает количество дней в квартале с учетом високосного года
	// quarter = 1..4
	getQuarterDays(quarter, year) {
		if(quarter == 1 && year % 4 == 0)
			return 91 // 31+29+31
		else
			return [90, 91, 92, 92][quarter-1]
	},

	// возвращает количество дней в полугодии с учетом високосного года
	// halfyear = 1..2
	getHalfyearDays(halfyear, year) {
		if(halfyear == 1 && year % 4 == 0)
			return 182 // 31+29+31+30+31+30
		else
			return [181, 184][halfyear-1]
	},

	// возвращает количество дней в году с учетом високосного
	getYearDays(year) {
		if(year % 4 == 0)
			return 366
		else
			return 365
	},

	// возвращает количество дней, прошедшее с начала года с учетом
	// високосного года
	// day = 1..31
	// month = 1..12
	getYearDaysForDay(day, month, year) {
		let count = 0
		for(let i=1; i<month; i++)
			count += this.getMonthDays(i, year)
		return count + day
	},

	padLeft(str, length, char = ' ') {
		str = str + ''
		return (str.length >= length) ? str : Array(length - str.length + 1).join(char) + str
	},

	padRight(str, length, char = ' ') {
		str = str + ''
		return (str.length >= length) ? str : str + Array(length - str.length + 1).join(char)
	},

	// форматирует число с разбивкой по тысячам
	formatNum(num) {
		let parts = (num + '').split('.')
		parts[0] = parts[0].replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')
		return parts.join('.')
	},

	// формирует значение доли
	formatShare(num, config) {
		if(!num)
			return null

		if(config == 1)
			return (num * 100).toFixed(0) + '%'
		else
			return (num * 1.0).toFixed(2)
	},

	// парсит значение, вернет число либо null
	parseIntOrNull(value) {
		let parsed = parseInt(value)
		return (isNaN(parsed) ? null : parsed)
	},

	// парсит значение, вернет число либо null
	parseFloatOrNull(value) {
		let parsed = parseFloat(value)
		return (isNaN(parsed) ? null : parsed)
	},

	// определяет финальную дату по периоду
	getFinishOfPeriod(date_from, plan_range) {
		//console.log('Fire p==* [TOOLS.getFinishOfPeriod]', date_from, plan_range)
		let type = ['day', 'week', 'month', 'quarter', 'half-year', 'year'].indexOf(plan_range),
			day_length = 24*60*60*1000

		// получаю количество дней без секунд
		date_from = Math.floor(date_from / day_length)

		let date_ = new Date(date_from * day_length),
			date = this.parseDate(date_),
			add = 0

		switch(type) {
			case 0: // day
				return date_from * day_length
				break

			case 1: // week
				add = (7 - date.week_day)
				return (date_from + add) * day_length
				break

			case 2: // month
				add = (this.getMonthDays(date.month, date.year) - date.day)
				return (date_from + add) * day_length
				break

			case 3: // quarter
				let last_day_in_quarter = 0
				for(let i = 1; i <= date.quarter_number; i++) {
					last_day_in_quarter += this.getQuarterDays(i, date.year)
				}
				add = (last_day_in_quarter - date.year_day)
				return (date_from + add) * day_length
				break

			case 4: // half-year
				let last_day_in_halfyear = 0
				for(let i = 1; i <= date.half_year_number; i++) {
					last_day_in_halfyear += this.getHalfyearDays(i, date.year)
				}
				add = (last_day_in_halfyear - date.year_day)
				return (date_from + add) * day_length
				break

			case 5: // year
				add = (this.getYearDays(date.year) - date.year_day)
				return (date_from + add) * day_length
				break
		}

		return false
	},
}

window.Tools = Tools
module.exports = Tools

/*
// Для тестирования правильного расчета периодов
setTimeout(function() {
	let pn = 1454284800000,	// 01.02.2016
		// po = 1458518400000	// 21.03.2016
		// po = 1559520000000,	// 03.06.2019,
		po = 2559520000000,	// 03.06.2019,
		dayz = Tools.calcPlanCount(pn, po, 'day'),
		weekz = Tools.calcPlanCount(pn, po, 'week'),
		monthz = Tools.calcPlanCount(pn, po, 'month'),
		quarterz = Tools.calcPlanCount(pn, po, 'quarter')

	dr('DAYZ', dayz)
	dr('WEEKZ', weekz)
	dr('MONTHZ', monthz)
	dr('QUARTERZ', quarterz)
	dr('HALF-YAERZ', half_yearz)
	dr('YAERZ', yearz)
}, 1000)

function dr(name, per) {
	console.log('==== ' + name + ' ====', per)
	for(let i in per) {
		console.log('%s. From %s to %s', i, (new Date(per[i].n)), (new Date(per[i].o)) )
	}
}
*/
