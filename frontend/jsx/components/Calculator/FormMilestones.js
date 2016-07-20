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

//	-------------------------------------
//		class Input
//	-------------------------------------
let TdContent = React.createClass({
	data: null,

	// Инициализация
	getInitialState() {
		this.data = this.props
		return null
	},

	render() {
		return (
			<input/>
		)
	}
})

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

	onPlanEditModeClick(event) {
		this.isEditPlan = true
		this.forceUpdate()
	},

	onPlanSaveClick(event) {
		let config = this.state.db.config,
			units = this.state.db.units,
			goals = this.state.db.goals,
			periods = this.state.db.periods

		let plan_kpr_divs = this.refs.plan_kpr_td.getElementsByClassName('period-item'),
			plan_prpz_divs = this.refs.plan_prpz_td.getElementsByClassName('period-item')

		// проверяю и сохраняю новые значения
		for(let key in periods) {
			console.log(periods[key])
			// КПР
			let inputs = plan_kpr_divs[key].getElementsByTagName('input')
			if(inputs && inputs[0]) {
				periods[key].kpr.value = (parseInt(inputs[0].value) || 0) * 1.0
			}
			// ПРПЗ
			inputs = plan_prpz_divs[key].getElementsByTagName('input')
			if(inputs && inputs[0]) {
				periods[key].prpz.value = (parseInt(inputs[0].value) || 0) * 1.0
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
		this.isEditFact = true
		this.forceUpdate()
	},

	onFactSaveClick(event) {
		let config = this.state.db.config,
			units = this.state.db.units,
			goals = this.state.db.goals,
			periods = this.state.db.periods

		let fact_kpr_divs = this.refs.fact_kpr_td.getElementsByClassName('period-item'),
			fact_frfz_divs = this.refs.fact_frfz_td.getElementsByClassName('period-item')

		// проверяю и сохраняю новые значения
		for(let key in periods) {
			console.log(periods[key])
			// КПР
			let inputs = fact_kpr_divs[key].getElementsByTagName('input')
			if(inputs && inputs[0]) {
				periods[key].kpr_fact.value = (parseInt(inputs[0].value) || 0) * 1.0
			}
			// ПРПЗ
			inputs = fact_frfz_divs[key].getElementsByTagName('input')
			if(inputs && inputs[0]) {
				periods[key].frfz.value = (parseInt(inputs[0].value) || 0) * 1.0
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
		this.refs.period_td.scrollLeft = scrollLeft
		this.refs.interval_td.scrollLeft = scrollLeft
		this.refs.plan_begin_td.scrollLeft = scrollLeft
		this.refs.plan_end_td.scrollLeft = scrollLeft
		this.refs.plan_kpr_td.scrollLeft = scrollLeft
		this.refs.plan_kpr_percent_td.scrollLeft = scrollLeft
		this.refs.plan_prpz_td.scrollLeft = scrollLeft
		this.refs.plan_prpz_percent_td.scrollLeft = scrollLeft
		this.refs.fact_kpr_td.scrollLeft = scrollLeft
		this.refs.fact_kpr_percent_td.scrollLeft = scrollLeft
		this.refs.fact_frfz_td.scrollLeft = scrollLeft
		this.refs.fact_frfz_percent_td.scrollLeft = scrollLeft

		// некоторые строки содержат скролл
		// буду скроллить только те, которые не вызвали этот евент
		if(this.refs.timeline_td != eventer)
			this.refs.timeline_td.scrollLeft = scrollLeft
	},

	render() {
		console.log('Fire p==* [FormMilestones.render]', this.state)

		// ссылки на методы
		let onPeriodInputChange = this.onPeriodInputChange
		let onDeleteMilestone = this.onDeleteMilestone

		let config = this.state.db.config,
			units = this.state.db.units,
			goals = this.state.db.goals,
			periods = this.state.db.periods,
			td1_style = {width: '120px'},
			td3_style = {width: '200px'}

		if(!periods || periods.length == 0)
			return (
				<div>
					<h2>Необходимо заполнить настройки</h2>
				</div>
			)

		// заполняю средние блоки
		let period_td = [],
			interval_td = [],
			plan_begin_td = [],
			plan_end_td = [],
			timeline_td = [],
			plan_kpr_td = [],
			plan_kpr_percent_td = [],
			plan_prpz_td = [],
			plan_prpz_percent_td = [],
			fact_kpr_td = [],
			fact_kpr_percent_td = [],
			fact_frfz_td = [],
			fact_frfz_percent_td = []

		let all_period_count = periods.length,
			plan_range = goals.plan_range.value,
			plan_method = goals.plan_method.value,
			plan_period_count = goals.plan_count.value,
			kpr_percent_sum = 0,
			prpz_percent_sum = 0,
			kpr_fact_sum = 0,
			kpr_fact_percent_sum = 0,
			frfz_sum = 0,
			frfz_percent_sum = 0

		// генерирую DIVы
		for(let key in periods) {
			let period = periods[key],
				pn = Tools.parseDate(new Date(period.pn.value)),
				po = Tools.parseDate(new Date(period.po.value)),
				text = ''

			switch(plan_range) {
				case 0: // day
					text = pn.week_day_name
					break

				case 1: // week
					text = pn.week_number + ' нед. ' + pn.year
					break

				case 2: // month
					text = pn.month_name + ', ' + pn.year
					break

				case 3: // quarter
					text = pn.quarter_number + ' кв. ' + pn.year
					break

				case 4: // half-year
					text = pn.half_year_number + '-ое полугодие, ' + pn.year
					break

				case 5: // year
					text = pn.year
					break
			}

			period_td.push(
				<div key={key} className="period-item center middle">
					{text}
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

			// Показатели КПР ПЛАН
			let kpr = (period.kpr || {}).value,
				kpr_percent = (100 / goals.kpr.value * (kpr || 0))
			if(kpr_percent) kpr_percent_sum += kpr_percent

			plan_kpr_td.push(
				<div key={key} className="period-item center middle middle-value">
					{this.isEditPlan
						? <input type="number" defaultValue={kpr}/>
						: (kpr ? Tools.formatNum(kpr) : '-')}
				</div>
			)

			plan_kpr_percent_td.push(
				<div key={key} className="period-item center middle">
					{kpr_percent ? kpr_percent.toFixed(2) + '%' : '-'}
				</div>
			)

			// Показатели ПРПЗ
			let prpz = (period.prpz || {}).value,
				prpz_percent = (100 / goals.prpz.value * (prpz || 0))
			if(prpz_percent) prpz_percent_sum += prpz_percent

			plan_prpz_td.push(
				<div key={key} className="period-item center middle middle-value">
					{this.isEditPlan
						? <input type="number" defaultValue={prpz}/>
						: (prpz ? Tools.formatNum(prpz) : '-')}
				</div>
			)

			plan_prpz_percent_td.push(
				<div key={key} className="period-item center middle">
					{prpz_percent ? prpz_percent.toFixed(2) + '%' : '-'}
				</div>
			)

			// Показатели КПР ФАКТ
			let kpr_fact = (period.kpr_fact || {}).value,
				kpr_fact_percent = (100 / goals.kpr.value * (kpr_fact || 0))
			if(kpr_fact) kpr_fact_sum += kpr_fact
			if(kpr_fact_percent) kpr_fact_percent_sum += kpr_fact_percent

			fact_kpr_td.push(
				<div key={key} className="period-item center middle middle-value">
					{this.isEditFact
						? <input type="number" defaultValue={kpr_fact}/>
						: (kpr_fact ? Tools.formatNum(kpr_fact) : '-')}
				</div>
			)

			fact_kpr_percent_td.push(
				<div key={key} className="period-item center middle">
					-
				</div>
			)

			// Показатели ФРФЗ
			let frfz = (period.frfz || {}).value,
				frfz_percent = (100 / goals.prpz.value * (frfz || 0))
			if(frfz) frfz_sum += frfz
			if(frfz_percent) frfz_percent_sum += frfz_percent

			fact_frfz_td.push(
				<div key={key} className="period-item center middle middle-value">
					{this.isEditFact
						? <input type="number" defaultValue={frfz}/>
						: (frfz ? Tools.formatNum(frfz) : '-')}
				</div>
			)

			fact_frfz_percent_td.push(
				<div key={key} className="period-item center middle">
					-
				</div>
			)
		}

		// добавляю тайм-лайн
		timeline_td.push(
			<div key="1" className="timeline-plan center middle" style={{width: period_width * plan_period_count + 'px'}}>
				<span ref="text">Плановый срок</span>
			</div>
		)
		if(all_period_count > plan_period_count) {
			timeline_td.push(
				<div key="2" className="timeline-above center middle" style={{width: period_width * (all_period_count - plan_period_count) + 'px'}}>
					<span ref="text">Сверх плана</span>
				</div>
			)
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
							<tbody>
								<tr>
									<td style={td1_style} className="center middle">
										Начало
										<span className="glyphicon glyphicon-chevron-left"/>
									</td>
									<td ref="period_td" className="period-row">
										{period_td}
									</td>
									<td style={td3_style} className="center middle">
										<span className="glyphicon glyphicon-chevron-right"/>
										Конец
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					{/* Даты */}
					<div className="item">
						<table className="values-table">
							<tbody>
								<tr>
									<td style={td1_style} className="center middle">
										№ интервала
									</td>
									<td ref="interval_td" className="period-row">
										{interval_td}
									</td>
									<td style={td3_style} className="center middle">
										{/* Длина по полану */}
										По плану: {Tools.formatNum(goals.pd.value)} дней
									</td>
								</tr>
								<tr>
									<td className="center middle">
										Дата начала
									</td>
									<td ref="plan_begin_td" className="period-row">
										{plan_begin_td}
									</td>
									<td className="center middle">
										{/* Длина по факту */}
										По факту:
									</td>
								</tr>
								<tr>
									<td className="center middle">
										Дата окончания
									</td>
									<td ref="plan_end_td" className="period-row">
										{plan_end_td}
									</td>
									<td/>
								</tr>
								<tr>
									<td/>
									<td ref="timeline_td" className="timeline-row" onScroll={this.onTimelineScroll}>
										{timeline_td}
									</td>
									<td className="center middle">
										Сверх плана: {Math.max(0, all_period_count - plan_period_count)} дней
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					{/* ПЛАН */}
					<div className="item header" style={{padding: '10px'}}>
						<table className="values-table">
							<tbody>
								<tr>
									<td style={{width: '100px'}} className="center middle">
										<h3>План</h3>
									</td>
									<td className="left middle">
										{this.isEditPlan
											? <button type="submit" className="btn btn-xs btn-primary" onClick={this.onPlanSaveClick}>Сохранить</button>
										: <button type="submit" className="btn btn-xs btn-primary" onClick={this.onPlanEditModeClick}>Изменить</button>}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					{/* Плановые показатели */}
					<div className="item">
						<table className="values-table">
							<tbody>
								<tr>
									<td style={td1_style} className="center middle">
										Результат
									</td>
									<td ref="plan_kpr_td" className="period-row">
										{plan_kpr_td}
									</td>
									<td style={td3_style} className="center middle big-value">
										{Tools.formatNum(goals.kpr.value)}
									</td>
								</tr>
								<tr>
									<td className="center middle">
										{goals.result_name.value}
									</td>
									<td ref="plan_kpr_percent_td" className="period-row">{plan_kpr_percent_td}</td>
									<td className="center middle">
										{kpr_percent_sum ? kpr_percent_sum.toFixed(2) + '%' : ''}
									</td>
								</tr>
								<tr>
									<td className="center middle">
										Расходы
									</td>
									<td ref="plan_prpz_td" className="period-row">{plan_prpz_td}</td>
									<td className="center middle big-value">
										{Tools.formatNum(goals.prpz.value)}
									</td>
								</tr>
								<tr>
									<td/>
									<td ref="plan_prpz_percent_td" className="period-row">{plan_prpz_percent_td}</td>
									<td className="center middle">
										{prpz_percent_sum ? prpz_percent_sum.toFixed(2) + '%' : ''}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					{/* ФАКТ */}
					<div className="item header" style={{padding: '10px'}}>
						<table className="values-table">
							<tbody>
								<tr>
									<td style={{width: '100px'}} className="center middle">
										<h3>Факт</h3>
									</td>
									<td className="left middle">
										{this.isEditFact
											? <button type="submit" className="btn btn-xs btn-primary" onClick={this.onFactSaveClick}>Сохранить</button>
										: <button type="submit" className="btn btn-xs btn-primary" onClick={this.onFactEditModeClick}>Изменить</button>}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					{/* Фактические показатели */}
					<div className="item">
						<table className="values-table">
							<tbody>
								<tr>
									<td style={td1_style} className="center middle">
										Результат
									</td>
									<td ref="fact_kpr_td" className="period-row">
										{fact_kpr_td}
									</td>
									<td style={td3_style} className="center middle big-value">
										{Tools.formatNum(kpr_fact_sum)}
									</td>
								</tr>
								<tr>
									<td className="center middle">
										{goals.result_name.value}
									</td>
									<td ref="fact_kpr_percent_td" className="period-row">
										{fact_kpr_percent_td}
									</td>
									<td className="center middle">
										{kpr_fact_percent_sum ? kpr_fact_percent_sum.toFixed(2) + '%' : ''}
									</td>
								</tr>
								<tr>
									<td className="center middle">
										Расходы
									</td>
									<td ref="fact_frfz_td" className="period-row">
										{fact_frfz_td}
									</td>
									<td className="center middle big-value">
										{Tools.formatNum(frfz_sum)}
									</td>
								</tr>
								<tr>
									<td/>
									<td ref="fact_frfz_percent_td" className="period-row">
										{fact_frfz_percent_td}
									</td>
									<td className="center middle">
										{frfz_percent_sum ? frfz_percent_sum.toFixed(2) + '%' : ''}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				{/* кнопки сохранить, отмена, сбросить */}
				<button type="submit" className="btn btn-success">Сохранить изменения</button>
			</div>
		)
	}
})

module.exports = FormMilestones
