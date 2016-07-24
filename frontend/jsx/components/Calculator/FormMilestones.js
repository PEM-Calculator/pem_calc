'use strict'
// загружаю nodejs модули
import _ from 'lodash'
import React from 'react'
import Reflux from 'reflux'
import { Link } from 'react-router'
// загружаю компоненты
import history from './../../core/history'
import Tools from './../../core/tools'
import CalculatorStore from './../../models/CalculatorStore'
import InputGoals from './InputGoals'

let period_width = 120

//	------------------------------------------
//		export class Calculator.FormMilestones
//
//		@props
//	------------------------------------------
let FormMilestones = React.createClass({
	mixins: [Reflux.connect(CalculatorStore, 'db')],
	isEditPlan: false,
	isEditFact: false,

	//	----- обработка событий -----

	onFormSubmit(event) {
		console.log('Fire p==* [FormMilestones.onFormSubmit]', this.state)
		event.preventDefault()

		// проверю все этапы
		let errors = []

		for(let i in this.state.db.periods) {
			let period = this.state.db.periods[i]
			// 1 rule
			period.fd.value = period.pd.value
			if(!period.pd.value && !period.fd.value)
				errors.push('В периоде нужно указать плановую длительность и/или фактическую длительность')
			// 2 rule
			if(period.pd.value && !period.kpr.value)
				errors.push('Если укаана плановая длительность, то нужно указать КПР план')
			// а вдруг ошибки
			if(errors.length) {
				alert('Ошибки при сохранении:\n\n- ' + errors.join('\n- '))
				return
			}
		}

		this.formSubmit()
	},

	formSubmit() {
		console.log('Fire p==* [FormMilestones.formSubmit]', this.state)
		CalculatorStore.Actions.savePeriods((noErrors) => {
			// если ошибок нет, перехожу на страницу периодов
			if(noErrors) {
				history.push('/')
			}
		})
	},

	onAddNewPeriodClick(event) {
		console.log('Fire p==* [FormMilestones.onAddNewPeriodClick]', this.state)
		event.preventDefault()
		CalculatorStore.Actions.addNewPeriod()
	},

	// изменилось одно из значений периодов
	onPeriodInputChange(event) {
		console.log('Fire p==* [FormMilestones.onPeriodInputChange]')

		let periods = _.map(this.refs, (ref) => { return ref.value })

		CalculatorStore.Actions.updatePeriods(periods, (updatedPeriods) => {
			// callback который обновит readonly поля
			let refs = this.refs
			_.map(updatedPeriods, (period, key) => {
				refs[key].setValue(period)
			})
		})
	},

	// удалился один из этапов
	onDeleteMilestone(event) {
		console.log('Fire p==* [FormMilestones.onDeleteMilestone]', this.refs, event)

		var refs = this.refs
		var deleteIndex = null
		_.map(refs, (ref, key) => {
			if(ref.refs.deleteButton == event.target)
				deleteIndex = key
		})

		if(deleteIndex !== null)
			CalculatorStore.Actions.deletePeriod(deleteIndex, () => {
				_.map(refs, (ref, key) => {
					ref.updateValue(this.state.db.periods[key])
				})
			})
	},

	// скролл по периодам
	onTimelineScroll(event) {
		event.preventDefault()
		//console.log('Fire p==* [FormMilestones.onTimelineScroll]', event.target)
		let node = event.target,
			node_width = node.scrollWidth,
			scrollLeft = node.scrollLeft,
			view_width = node.getBoundingClientRect().width

		this.timelineScroll(scrollLeft, node)
	},

	onScrollToStartClick(event) {
		event.preventDefault()

		this.timelineScroll(0)
	},

	onScrollToEndClick(event) {
		event.preventDefault()

		this.timelineScroll(99999999999)
	},

	onPlanEditModeClick(event) {
		this.isEditPlan = true
		this.isEditFact = false
		this.forceUpdate()
	},

	onPlanEditAbortClick(event) {
		this.isEditPlan = false
		this.forceUpdate()
	},

	onPlanSaveClick(event) {
		event.preventDefault()

		let config = this.state.db.config,
			units = this.state.db.units,
			goals = this.state.db.goals,
			periods = this.state.db.periods

		let kpr_plan_divs = this.refs.kpr_plan_td.getElementsByClassName('period-item'),
			plan_prpz_divs = this.refs.prpz_td.getElementsByClassName('period-item')

		// проверяю и сохраняю новые значения
		for(let key in periods) {
			// КПР
			let inputs = kpr_plan_divs[key].getElementsByTagName('input')
			if(inputs && inputs[0]) {
				periods[key].kpr.value = Tools.parseFloatOrNull(inputs[0].value)
				console.log('PARSE1', periods[key].kpr.value, '<-', inputs[0].value)
			}
			// ПРПЗ
			inputs = plan_prpz_divs[key].getElementsByTagName('input')
			if(inputs && inputs[0]) {
				periods[key].prpz.value = Tools.parseFloatOrNull(inputs[0].value)
				console.log('PARSE2', periods[key].prpz.value, '<-', inputs[0].value)
			}
		}

		// а может появился новый период?
		if(kpr_plan_divs.length > periods.length && plan_prpz_divs.length > periods.length) {
			let length = periods.length
			// КПР
			let inputs = kpr_plan_divs[length].getElementsByTagName('input'),
				kpr_plan = null,
				prpz = null
			if(inputs && inputs[0]) {
				kpr_plan = Tools.parseFloatOrNull(inputs[0].value)
			}
			// ПРПЗ
			inputs = plan_prpz_divs[length].getElementsByTagName('input')
			if(inputs && inputs[0]) {
				prpz = Tools.parseFloatOrNull(inputs[0].value)
			}
			// узнаю последний день последнего периода
			let	plan_range = goals.plan_range.value,
				plan_range_value = goals.plan_range.range[plan_range].value,
				po_last_gen = periods[length-1].po.value,
				pn_gen = po_last_gen + 24*3600*1000,
				po_gen = Tools.getFinishOfPeriod(pn_gen, plan_range_value)
			// добавляю новый период
			if(kpr_plan || prpz) {
				periods[periods.length-1].po.value = po_last_gen
				CalculatorStore.Actions.addNewPeriod(pn_gen, po_gen, kpr_plan, prpz)
			}
		}

		CalculatorStore.Actions.savePeriods((noErrors) => {
			if(noErrors) {
				this.isEditPlan = false
				this.forceUpdate()
			}
		})
	},

	onFactEditModeClick(event) {
		this.isEditPlan = false
		this.isEditFact = true
		this.forceUpdate()
	},

	onFactEditAbortClick(event) {
		this.isEditFact = false
		this.forceUpdate()
	},

	onFactSaveClick(event) {
		event.preventDefault()

		let config = this.state.db.config,
			units = this.state.db.units,
			goals = this.state.db.goals,
			periods = this.state.db.periods

		let kpr_fact_divs = this.refs.kpr_fact_td.getElementsByClassName('period-item'),
			fact_frfz_divs = this.refs.frfz_td.getElementsByClassName('period-item')

		// проверяю и сохраняю новые значения
		for(let key in periods) {
			// КПР
			let inputs = kpr_fact_divs[key].getElementsByTagName('input')
			if(inputs && inputs[0]) {
				periods[key].kpr_fact.value = Tools.parseFloatOrNull(inputs[0].value)
			}
			// ПРПЗ
			inputs = fact_frfz_divs[key].getElementsByTagName('input')
			if(inputs && inputs[0]) {
				periods[key].frfz.value = Tools.parseFloatOrNull(inputs[0].value)
			}
		}

		// а может появился новый период?
		if(kpr_fact_divs.length > periods.length && fact_frfz_divs.length > periods.length) {
			let length = periods.length
			// КПР
			let inputs = kpr_fact_divs[length].getElementsByTagName('input'),
				kpr_fact = null,
				frfz = null
			if(inputs && inputs[0]) {
				kpr_fact = Tools.parseFloatOrNull(inputs[0].value)
			}
			// ФРФЗ
			inputs = fact_frfz_divs[length].getElementsByTagName('input')
			if(inputs && inputs[0]) {
				frfz = Tools.parseFloatOrNull(inputs[0].value)
			}
			// узнаю последний день последнего периода
			let	plan_range = goals.plan_range.value,
				plan_range_value = goals.plan_range.range[plan_range].value,
				po_last_gen = Tools.getFinishOfPeriod(periods[length-1].po.value, 	plan_range_value),
				pn_gen = po_last_gen + 24*3600*1000,
				po_gen = Tools.getFinishOfPeriod(pn_gen, plan_range_value)
			// добавляю новый период
			if(kpr_fact || frfz) {
				periods[periods.length-1].po.value = po_last_gen
				CalculatorStore.Actions.addNewPeriod(pn_gen, po_gen, null, null, kpr_fact, frfz)
			}
		}

		CalculatorStore.Actions.savePeriods((noErrors) => {
			if(noErrors) {
				this.isEditFact = false
				this.forceUpdate()
			}
		})
	},

	// новое значение скролла
	timelineScroll(scrollLeft, eventer = null) {
		// скроллю остальные блоки с периодами
		let list = [
			this.refs.period_td,
			this.refs.period_pre_td,
			this.refs.timeline_td,
			this.refs.period1_td,
			this.refs.period1_pre_td,
			this.refs.interval_td,
			this.refs.interval1_td,
			this.refs.plan_begin_td,
			this.refs.plan_end_td,
			this.refs.kpr_plan_td,
			this.refs.kpr_plan_percent_td,
			this.refs.prpz_td,
			this.refs.prpz_percent_td,
			this.refs.kpr_fact_td,
			this.refs.kpr_fact_percent_td,
			this.refs.frfz_td,
			this.refs.frfz_percent_td,
			this.refs.eff_td,
			this.refs.ks_td,
			this.refs.kr_td,
		]

		for(let i in list) {
			let item = list[i]
			if(item && item != eventer)
				item.scrollLeft = scrollLeft
		}
	},

	render() {
		console.log('Fire p==* [FormMilestones.render]', this.state)

		// обновляю заголовок
		let title = (((this.state.db || {}).goals || {}).project_name || {}).value
			|| '*Новый проект'
		window.PEM.updateTitle(title)

		// ссылки на методы
		let onPeriodInputChange = this.onPeriodInputChange
		let onDeleteMilestone = this.onDeleteMilestone

		let config = this.state.db.config,
			units = this.state.db.units,
			goals = this.state.db.goals,
			periods = this.state.db.periods,
			results = this.state.db.results,
			td1_style = {width: '150px'},
			td3_style = {width: '150px'},
			result_method = goals.result_method.value

		if(!periods || periods.length == 0)
			return (
				<div>
					<h2>Необходимо заполнить настройки</h2>
				</div>
			)

		// заполняю средние блоки
		let period_td = [],
			period_pre_td = [],
			interval_td = [],
			plan_begin_td = [],
			plan_end_td = [],
			timeline_td = [],
			kpr_plan_td = [],
			kpr_plan_percent_td = [],
			prpz_td = [],
			prpz_percent_td = [],
			kpr_fact_td = [],
			kpr_fact_percent_td = [],
			frfz_td = [],
			frfz_percent_td = [],
			eff_td = [],
			ks_td = [],
			kr_td = []

		let all_period_count = periods.length,
			plan_range = goals.plan_range.value,
			plan_range_value = goals.plan_range.range[plan_range].value,
			plan_method = goals.plan_method.value,
			plan_period_count = goals.plan_count.value,
			kpr_plan_sum = 0,
			kpr_plan_percent_sum = 0,
			prpz_sum = 0,
			prpz_percent_sum = 0,
			days_fact_sum = 0,			// дней по факту
			days_after_plan_sum = 0,	// дней сверх плана
			kpr_fact_sum = 0,
			kpr_fact_percent_sum = 0,
			frfz_sum = 0,
			frfz_percent_sum = 0,
			filled_fact_count = 0,	// сколько периодов заполнено факта
			last_pre_period_text = null,	// текст большого периода
			last_pre_period_key = 0	// ключ последнего большого периода

		// генерирую DIVы
		for(let key in periods) {
			let period = periods[key] || {},
				result = (results && results.length >= key ? results[key] : null),
				pn = Tools.parseDate(new Date(period.pn.value)),
				po = Tools.parseDate(new Date(period.po.value)),
				period_text = '',
				pre_period_text = null

			switch(plan_range) {
				case 0: // day
					period_text = pn.week_day_name
					pre_period_text = pn.week_number + ' нед.'
					break

				case 1: // week
					period_text = pn.week_number + ' нед. '
					pre_period_text = pn.month_name + ', ' + pn.year
					break

				case 2: // month
					period_text = pn.month_name
					pre_period_text = pn.year
					break

				case 3: // quarter
					period_text = pn.quarter_number + ' кв.'
					pre_period_text = pn.year
					break

				case 4: // half-year
					period_text = pn.half_year_number + '-ое полугодие'
					pre_period_text = pn.year
					break

				case 5: // year
					period_text = pn.year
					break
			}

			if(pre_period_text !== null && last_pre_period_text === null) {
				last_pre_period_text = pre_period_text
				last_pre_period_key = key
			}

			period_td.push(
				<div key={key} className="period-item center middle">
					{period_text}
				</div>
			)

			interval_td.push(
				<div key={key} className="period-item center middle">
					{key * 1 + 1}
				</div>
			)

			plan_begin_td.push(
				<div key={key} className="period-item center middle">
					{pn.date}
				</div>
			)

			plan_end_td.push(
				<div key={key} className="period-item center middle">
					{po.date}
				</div>
			)

			if(pre_period_text != last_pre_period_text) {
				period_pre_td.push(
					<div key={key} className="period-item center middle" style={{width: (key - last_pre_period_key) * period_width + 'px'}}>
						{last_pre_period_text}
					</div>
				)
				last_pre_period_text = pre_period_text
				last_pre_period_key = key
			}

			// Показатели КПР ПЛАН
			let kpr_plan = (period.kpr && period.kpr.value ? period.kpr.value : null),
				kpr_plan_percent = (kpr_plan ? 100 / goals.kpr.value * kpr_plan : null)
			// E
			if(kpr_plan) kpr_plan_sum += kpr_plan
			if(kpr_plan_percent) kpr_plan_percent_sum += kpr_plan_percent

			kpr_plan_td.push(
				<div key={key} className="period-item center middle middle-value">
					{this.isEditPlan
						? <input type="number" defaultValue={kpr_plan}/>
						: (kpr_plan !== null ? Tools.formatNum(kpr_plan) : '-')}
				</div>
			)

			kpr_plan_percent_td.push(
				<div key={key} className="period-item center middle">
					{kpr_plan_percent !== null ? kpr_plan_percent.toFixed(2) + '%' : '-'}
				</div>
			)

			// Показатели ПРПЗ
			let prpz = (period.prpz && period.prpz.value ? period.prpz.value : null),
				prpz_percent = (prpz ? 100 / goals.prpz.value * prpz : null)
			// E
			if(prpz) prpz_sum += prpz
			if(prpz_percent) prpz_percent_sum += prpz_percent

			prpz_td.push(
				<div key={key} className="period-item center middle middle-value">
					{this.isEditPlan
						? <input type="number" defaultValue={prpz}/>
						: (prpz !== null ? Tools.formatNum(prpz) : '-')}
				</div>
			)

			prpz_percent_td.push(
				<div key={key} className="period-item center middle">
					{prpz_percent !== null ? prpz_percent.toFixed(2) + '%' : '-'}
				</div>
			)

			// Показатели КПР ФАКТ
			let kpr_fact = (period.kpr_fact && period.kpr_fact.value ? period.kpr_fact.value : null),
				kpr_fact_percent = (kpr_fact ? 100 / goals.kpr.value * kpr_fact : null)
			if(kpr_fact) kpr_fact_sum += kpr_fact
			if(kpr_fact_percent) kpr_fact_percent_sum += kpr_fact_percent

			kpr_fact_td.push(
				<div key={key} className="period-item center middle middle-value">
					{this.isEditFact
						? <input type="number" defaultValue={kpr_fact}/>
						: (kpr_fact !== null ? Tools.formatNum(kpr_fact) : '-')}
				</div>
			)

			kpr_fact_percent_td.push(
				<div key={key} className="period-item center middle">
					{kpr_fact_percent !== null ? kpr_fact_percent.toFixed(2) + '%' : '-'}
				</div>
			)

			// Показатели ФРФЗ
			let frfz = (period.frfz && period.frfz.value ? period.frfz.value : null),
				frfz_percent = (frfz ? 100 / goals.prpz.value * frfz : null)
			if(frfz) frfz_sum += frfz
			if(frfz_percent) frfz_percent_sum += frfz_percent

			frfz_td.push(
				<div key={key} className="period-item center middle middle-value">
					{this.isEditFact
						? <input type="number" defaultValue={frfz}/>
						: (frfz !== null ? Tools.formatNum(frfz) : '-')}
				</div>
			)

			frfz_percent_td.push(
				<div key={key} className="period-item center middle">
					{frfz_percent !== null ? frfz_percent.toFixed(2) + '%' : '-'}
				</div>
			)

			// заполнен ли период фактом
			if(kpr_fact !== null && frfz !== null) {
				days_fact_sum += period.pd.value
				if(key >= plan_period_count)
					days_after_plan_sum += period.pd.value
				filled_fact_count++
			}

			if(result) {
				//
				// Показатели эффективности
				//
				eff_td.push(
					<div key={key+'1'} className="period-item-half center middle">
						{Tools.formatShare(result.eff, result_method) || '-'}
					</div>
				)
				eff_td.push(
					<div key={key+'2'} className="period-item-half center middle">
						<b>
							{Tools.formatShare(result.eff, result_method)
								? Tools.formatShare(result.sum_eff, result_method) || '-'
								: '-'}
						</b>
					</div>
				)
				ks_td.push(
					<div key={key+'1'} className="period-item-half center middle">
						{Tools.formatShare(result.ks, result_method) || '-'}
					</div>
				)
				ks_td.push(
					<div key={key+'2'} className="period-item-half center middle">
						<b>
							{Tools.formatShare(result.ks, result_method)
								? Tools.formatShare(result.sum_ks, result_method) || '-'
								: '-'}
						</b>
					</div>
				)
				kr_td.push(
					<div key={key+'1'} className="period-item-half center middle">
						{Tools.formatShare(result.kr, result_method) || '-'}
					</div>
				)
				kr_td.push(
					<div key={key+'2'} className="period-item-half center middle">
						<b>
							{Tools.formatShare(result.kr, result_method)
								? Tools.formatShare(result.sum_kr, result_method) || '-'
								: '-'}
						</b>
					</div>
				)
			}
		}

		////////////////////////////////////////////////////////////
		// если факт заполнен во всех периодах, но факт еще не 100%
		// и если в режиме редактирования, то дабавляю везде по 1 периоду
		////////////////////////////////////////////////////////////
		if(filled_fact_count == all_period_count && kpr_plan_sum > kpr_fact_sum && (this.isEditPlan || this.isEditFact)) {
			let key = periods.length,
				period = {},
				result = null,
				po_last_gen = periods[key-1].po.value,
				po_last = Tools.parseDate(new Date(po_last_gen)),
				pn_gen = po_last_gen + 24*3600*1000,
				po_gen = Tools.getFinishOfPeriod(pn_gen, plan_range_value),
				pn = Tools.parseDate(new Date(pn_gen)),
				po = Tools.parseDate(new Date(po_gen)),
				period_text = '',
				pre_period_text = null

			switch(plan_range) {
				case 0: // day
					period_text = pn.week_day_name
					pre_period_text = pn.week_number + ' нед.'
					break

				case 1: // week
					period_text = pn.week_number + ' нед. '
					pre_period_text = pn.month_name + ', ' + pn.year
					break

				case 2: // month
					period_text = pn.month_name
					pre_period_text = pn.year
					break

				case 3: // quarter
					period_text = pn.quarter_number + ' кв.'
					pre_period_text = pn.year
					break

				case 4: // half-year
					period_text = pn.half_year_number + '-ое полугодие'
					pre_period_text = pn.year
					break

				case 5: // year
					period_text = pn.year
					break
			}

			period_td.push(
				<div key={key} className="period-item center middle">
					{period_text}
				</div>
			)

			interval_td.push(
				<div key={key} className="period-item center middle">
					{key * 1 + 1}
				</div>
			)

			if(pre_period_text != last_pre_period_text) {
				period_pre_td.push(
					<div key={key} className="period-item center middle" style={{width: (key - last_pre_period_key) * period_width + 'px'}}>
						{last_pre_period_text}
					</div>
				)
				last_pre_period_text = pre_period_text
				last_pre_period_key = key
			}

			// для даты окончания последнего периода делаю подмену
			// предыдущий период необходимо расширить до максимума
			plan_end_td[plan_end_td.length-1] = (
				<div key={key} className="period-item center middle">
					{po_last.date}
				</div>
			)

			// расчет дат следующего периода
			plan_begin_td.push(
				<div key={key+1} className="period-item center middle">
					{pn.date}
				</div>
			)

			plan_end_td.push(
				<div key={key+1} className="period-item center middle">
					{po.date}
				</div>
			)

			// Показатели КПР ПЛАН
			kpr_plan_td.push(
				<div key={key} className="period-item center middle middle-value">
					{this.isEditPlan ? <input type="number"/> : '-'}
				</div>
			)

			kpr_plan_percent_td.push(
				<div key={key} className="period-item center middle">
					-
				</div>
			)

			// Показатели ПРПЗ
			prpz_td.push(
				<div key={key} className="period-item center middle middle-value">
					{this.isEditPlan ? <input type="number"/> : '-'}
				</div>
			)

			prpz_percent_td.push(
				<div key={key} className="period-item center middle">
					-
				</div>
			)

			// Показатели КПР ФАКТ
			kpr_fact_td.push(
				<div key={key} className="period-item center middle middle-value">
					{this.isEditFact ? <input type="number"/> : '-'}
				</div>
			)

			kpr_fact_percent_td.push(
				<div key={key} className="period-item center middle">
					-
				</div>
			)

			// Показатели ФРФЗ
			frfz_td.push(
				<div key={key} className="period-item center middle middle-value">
					{this.isEditFact ? <input type="number"/> : '-'}
				</div>
			)

			frfz_percent_td.push(
				<div key={key} className="period-item center middle">
					-
				</div>
			)

			//
			// Показатели эффективности
			//

			if(eff_td.length > 0) {
				eff_td.push(
					<div key={key+'1'} className="period-item-half center middle">
						-
					</div>
				)
				eff_td.push(
					<div key={key+'2'} className="period-item-half center middle">
						<b>
							-
						</b>
					</div>
				)
			}

			if(ks_td.length > 0) {
				ks_td.push(
					<div key={key+'1'} className="period-item-half center middle">
						-
					</div>
				)
				ks_td.push(
					<div key={key+'2'} className="period-item-half center middle">
						<b>
							-
						</b>
					</div>
				)
			}

			if(kr_td.length > 0) {
				kr_td.push(
					<div key={key+'1'} className="period-item-half center middle">
						-
					</div>
				)
				kr_td.push(
					<div key={key+'2'} className="period-item-half center middle">
						<b>
							-
						</b>
					</div>
				)
			}

			all_period_count++
		}
		////////////////////////////////////////////////////////////
		// добавление нового периода при редактировании
		////////////////////////////////////////////////////////////

		// добавляю тайм-лайн
		timeline_td.push(
			<div key="1" className="timeline-plan center middle" style={{width: period_width * plan_period_count + 'px'}}>
				<span ref="text">Плановый срок</span>
			</div>
		)
		if(all_period_count > plan_period_count) {
			timeline_td.push(
				<div key="2" className="timeline-above center middle" style={{width: period_width * (all_period_count - plan_period_count) + 1 + 'px'}}>
					<span ref="text">Сверх плана</span>
				</div>
			)
		}

		if(last_pre_period_text !== null) {
			period_pre_td.push(
				<div key={all_period_count} className="period-item center middle" style={{width: (all_period_count - last_pre_period_key) * period_width + 'px'}}>
					{last_pre_period_text}
				</div>
			)
			console.log(period_pre_td, last_pre_period_text)
		}

		return (
			<div>
				<table style={{margin: '10px 0'}}>
					<tbody>
						<tr>
							<td style={{width: '180px'}}>Интервал планирования</td>
							<td>{(goals.plan_range.range[plan_range] || {}).title}</td>
						</tr>
						<tr>
							<td style={{width: '180px'}}>Метод планирования</td>
							<td>{(goals.plan_method.range[plan_method] || {}).title}</td>
						</tr>
					</tbody>
				</table>

				<div className="white-form">
					{/* Начало - Конец */}
					<div className="item header">
						<table className="values-table">
							<colgroup>
								<col style={td1_style}/>
								<col/>
								<col style={td3_style}/>
							</colgroup>
							<tbody>
								<tr>
									<td className="center middle">
										<div onClick={this.onScrollToStartClick} style={{cursor: "pointer"}}>
											<span className="glyphicon glyphicon-chevron-left"/>
											Начало
										</div>
									</td>
									<td ref="period_td" className="period-row">
										<div className="td_items period_pre_td">
											{period_pre_td}
										</div>
										<br/>
										<div className="td_items period_td">
											{period_td}
										</div>
									</td>
									<td className="center middle">
										<div onClick={this.onScrollToEndClick} style={{cursor: "pointer"}}>
											Конец
											<span className="glyphicon glyphicon-chevron-right"/>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					{/* Даты */}
					<div className="item">
						<table className="values-table">
							<colgroup>
								<col style={td1_style}/>
								<col/>
								<col style={td3_style}/>
							</colgroup>
							<tbody>
								<tr>
									<td className="center middle">
										№ интервала
									</td>
									<td ref="interval_td" className="period-row">
										<div className="td_items interval_td">
											{interval_td}
										</div>
									</td>
									<td className="center middle">
										{/* Длина по полану */}
										По плану: {Tools.formatNum(goals.pd.value)} дней
									</td>
								</tr>
								<tr>
									<td className="center middle">
										Дата начала
									</td>
									<td ref="plan_begin_td" className="period-row">
										<div className="td_items plan_begin_td">
											{plan_begin_td}
										</div>
									</td>
									<td className="center middle">
										{/* Длина по факту */}
										По факту: {Tools.formatNum(days_fact_sum)} дней
									</td>
								</tr>
								<tr>
									<td className="center middle">
										Дата окончания
									</td>
									<td ref="plan_end_td" className="period-row">
										<div className="td_items plan_end_td">
											{plan_end_td}
										</div>
									</td>
									<td/>
								</tr>
								<tr>
									<td/>
									<td ref="timeline_td" className="timeline-row" onScroll={this.onTimelineScroll}>
										<div className="td_items timeline_td">
											{timeline_td}
										</div>
									</td>
									<td className="center middle">
										Сверх плана: {Tools.formatNum(days_after_plan_sum)} дней
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					{/**********************************************************
						ПЛАН
					**********************************************************/}
					<div className="item header" style={{padding: '10px'}}>
						<table className="values-table">
							<colgroup>
								<col style={td1_style}/>
								<col/>
							</colgroup>
							<tbody>
								<tr>
									<td className="center middle">
										<h3>План</h3>
									</td>
									<td className="left middle">
										{this.isEditPlan
											? (
												<div>
													<button type="button" className="btn btn-xs btn-primary" onClick={this.onPlanSaveClick}>Сохранить</button>
													&nbsp;
													<button type="button" className="btn btn-xs btn-primary" onClick={this.onPlanEditAbortClick}>Отменить</button>
												</div>
											)
											: <button type="button" className="btn btn-xs btn-primary" onClick={this.onPlanEditModeClick}>Изменить</button>}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					{/* Плановые показатели */}
					<form onSubmit={this.onPlanSaveClick} className="item">
						<table className="values-table">
							<colgroup>
								<col style={td1_style}/>
								<col/>
								<col style={td3_style}/>
							</colgroup>
							<tbody>
								<tr>
									<td className="center middle">
										Результат
									</td>
									<td ref="kpr_plan_td" className="period-row" onScroll={this.onTimelineScroll}>
										<div className="td_items kpr_plan_td">
											{kpr_plan_td}
										</div>
									</td>
									<td className="center middle big-value">
										{(kpr_plan_sum - goals.kpr.value > 0 ? <span><span style={{color: 'red'}}>{kpr_plan_sum}</span>/</span> :
											(kpr_plan_sum - goals.kpr.value < 0 ? <span>{kpr_plan_sum}/</span> : null)
										)}
										{Tools.formatNum(goals.kpr.value)}
									</td>
								</tr>
								<tr>
									<td className="center middle">
										{goals.result_name.value}
									</td>
									<td ref="kpr_plan_percent_td" className="period-row">
										<div className="td_items kpr_plan_percent_td">
											{kpr_plan_percent_td}
										</div>
									</td>
									<td className="center middle">
										{kpr_plan_percent_sum ? kpr_plan_percent_sum.toFixed(2) + '%' : ''}
									</td>
								</tr>
								<tr>
									<td className="center middle">
										Расходы
									</td>
									<td ref="prpz_td" className="period-row" onScroll={this.onTimelineScroll}>
										<div className="td_items prpz_td">
											{prpz_td}
										</div>
									</td>
									<td className="center middle big-value">
										{(prpz_sum - goals.prpz.value > 0 ? <span><span style={{color: 'red'}}>{prpz_sum}</span>/</span> :
											(prpz_sum - goals.prpz.value < 0 ? <span>{prpz_sum}/</span> : null)
										)}
										{Tools.formatNum(goals.prpz.value)}
									</td>
								</tr>
								<tr>
									<td/>
									<td ref="prpz_percent_td" className="period-row">
										<div className="td_items prpz_percent_td">
											{prpz_percent_td}
										</div>
									</td>
									<td className="center middle">
										{prpz_percent_sum ? prpz_percent_sum.toFixed(2) + '%' : ''}
									</td>
								</tr>
							</tbody>
						</table>
					</form>
					{/**********************************************************
						ФАКТ
					**********************************************************/}
					<div className="item header" style={{padding: '10px'}}>
						<table className="values-table">
							<colgroup>
								<col style={td1_style}/>
								<col/>
							</colgroup>
							<tbody>
								<tr>
									<td className="center middle">
										<h3>Факт</h3>
									</td>
									<td className="left middle">
										{this.isEditFact
											? (
												<div>
													<button type="button" className="btn btn-xs btn-primary" onClick={this.onFactSaveClick}>Сохранить</button>
													&nbsp;
													<button type="button" className="btn btn-xs btn-primary" onClick={this.onFactEditAbortClick}>Отменить</button>
												</div>
											)
											: <button type="button" className="btn btn-xs btn-primary" onClick={this.onFactEditModeClick}>Изменить</button>}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					{/* Фактические показатели */}
					<form onSubmit={this.onFactSaveClick} className="item">
						<table className="values-table">
							<colgroup>
								<col style={td1_style}/>
								<col/>
								<col style={td3_style}/>
							</colgroup>
							<tbody>
								<tr>
									<td className="center middle">
										Результат
									</td>
									<td ref="kpr_fact_td" className="period-row" onScroll={this.onTimelineScroll}>
										<div className="td_items kpr_fact_td">
											{kpr_fact_td}
										</div>
									</td>
									<td className="center middle big-value">
										{Tools.formatNum(kpr_fact_sum)}
									</td>
								</tr>
								<tr>
									<td className="center middle">
										{goals.result_name.value}
									</td>
									<td ref="kpr_fact_percent_td" className="period-row">
										<div className="td_items kpr_fact_percent_td">
											{kpr_fact_percent_td}
										</div>
									</td>
									<td className="center middle">
										{kpr_fact_percent_sum ? kpr_fact_percent_sum.toFixed(2) + '%' : ''}
									</td>
								</tr>
								<tr>
									<td className="center middle">
										Расходы
									</td>
									<td ref="frfz_td" className="period-row" onScroll={this.onTimelineScroll}>
										<div className="td_items frfz_td">
											{frfz_td}
										</div>
									</td>
									<td className="center middle big-value">
										{Tools.formatNum(frfz_sum)}
									</td>
								</tr>
								<tr>
									<td/>
									<td ref="frfz_percent_td" className="period-row">
										<div className="td_items frfz_percent_td">
											{frfz_percent_td}
										</div>
									</td>
									<td className="center middle">
										{frfz_percent_sum ? frfz_percent_sum.toFixed(2) + '%' : ''}
									</td>
								</tr>
							</tbody>
						</table>
					</form>
					{/* Эффективность */}
					{ results && <div className="item">
						<table className="values-table">
							<colgroup>
								<col style={td1_style}/>
								<col/>
								<col style={td3_style}/>
							</colgroup>
							<tbody>
								<tr>
									<td className="center middle">
										<h3>Эффективность</h3>
									</td>
									<td ref="interval1_td" className="period-row">
										<div className="td_items interval_td">
											{interval_td}
										</div>
									</td>
									<td/>
								</tr>
								<tr>
									<td className="center middle">
										<div onClick={this.onScrollToStartClick} style={{cursor: "pointer"}}>
											<span className="glyphicon glyphicon-chevron-left"/>
											Начало
										</div>
									</td>
									<td ref="period1_td" className="period-row">
										<div className="td_items period_td_2">
											{period_td}
										</div>
									</td>
									<td className="center middle">
										<div onClick={this.onScrollToEndClick} style={{cursor: "pointer"}}>
											Конец
											<span className="glyphicon glyphicon-chevron-right"/>
										</div>
									</td>
								</tr>
								<tr>
									<td colSpan="3" className="middle-value" style={{padding: '5px 15px'}}>
										Эффективность результата (Э = Кс x Кр)
									</td>
								</tr>
								<tr>
									<td/>
									<td ref="eff_td" className="period-row">
										<div className="td_items eff_td">
											{eff_td}
										</div>
									</td>
									<td/>
								</tr>
								<tr>
									<td colSpan="3" className="middle-value" style={{padding: '5px 15px'}}>
										Эффективность по сроку (Кс)
									</td>
								</tr>
								<tr>
									<td/>
									<td ref="ks_td" className="period-row">
										<div className="td_items ks_td">
											{ks_td}
										</div>
									</td>
									<td/>
								</tr>
								<tr>
									<td colSpan="3" className="middle-value" style={{padding: '5px 15px'}}>
										Эффективность расходов (Кр)
									</td>
								</tr>
								<tr>
									<td/>
									<td ref="kr_td" className="period-row" style={{overflow: 'auto'}} onScroll={this.onTimelineScroll}>
										<div className="td_items kr_td">
											{kr_td}
										</div>
									</td>
									<td/>
								</tr>
							</tbody>
						</table>
						<table id="helpbox">
							<tbody>
								<tr>
									<td style={{padding: '20px'}}>
										<img src="/img/help01.png"/>
									</td>
									<td style={{padding: '20px'}} className="left top">
										История изменения эффективности по<br/>
										результатам в интервалах и с<br/>
										нарастанием за период (1-N), где N - это номер<br/>
										крайнего интервала в периоде.
									</td>
								</tr>
							</tbody>
						</table>
					</div>}
				</div>
			</div>
		)
	}
})

module.exports = FormMilestones
