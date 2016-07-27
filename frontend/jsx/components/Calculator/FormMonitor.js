'use strict'
//
import _ from 'lodash'
import React from 'react'
import Reflux from 'reflux'
//
import History from './../../core/history'
import Tools from './../../core/tools'
import Store from './../../models/CalculatorStore'
//
import { Router, Route, IndexRoute, Redirect, Link, IndexLink } from 'react-router'

//	-------------------------------------
//
//	-------------------------------------
module.exports = React.createClass({
	// миксин подменяет this.state.data
	mixins: [Reflux.connect(Store, 'db')],

	render() {
		console.log('Fire p==* [FormResults.render]', this.state)

		// настройки пустые
		if(!this.state || !this.state.db || !this.state.db.config.created) {
			return (
				<div className="alert alert-info">
					<p>
						Настройки не заполнены.
					</p>
					<a href="/settings" className="alert-link">Перейти в Настройки</a>
				</div>
			)
		}

		let config = this.state.db.config,
			units = this.state.db.units,
			goals = this.state.db.goals,
			periods = this.state.db.periods,
			results = this.state.db.results,
			result = results[results.length - 1]

		if(!results || !results.length) {
			return (
				<div className="alert alert-info">
					<p>
						План и факт не заполнен.
					</p>
					<a href="/planfact" className="alert-link">Перейти в План и факт</a>
				</div>
			)
		}

		// обновляю заголовок
		window.PEM.updateTitle(goals.project_name.value)

		let currency_value = goals.currency.value,
			currency_title = (goals.currency.range[currency_value] || {}).title,
			result_value = units.unit_result.value,
			plan_percent = 100 / goals.kpr.value * result.sum_kpr_plan,
			fact_percent = 100 / goals.kpr.value * result.sum_kpr_fact,
			days_percent = 100 / goals.pd.value * result.sum_pd,
			prpz_percent = 100 / goals.prpz.value * result.sum_prpz,
			prfz_percent = 100 / goals.prpz.value * result.sum_prfz,
			frfz_percent = 100 / goals.prpz.value * result.sum_frfz,
			pn = Tools.parseDate(new Date(goals.pn.value)),
			po = Tools.parseDate(new Date(goals.po.value))

		return (
			<div>
				<table style={{margin: '10px 0'}}>
					<tbody>
						<tr>
							<td style={{width: '180px'}}>Интервал планирования</td>
							<td style={{width: '180px'}}>Метод планирования</td>
						</tr>
					</tbody>
				</table>

				<div className="white-form" id="monitor-data">
					{/* Результат */}
					<div className="item header row">
						<div className="col-sm-6 left d1">Результат</div>
						<div className="col-sm-6 right d2">ЭФФЕКТИВНОСТЬ РЕЗУЛЬТАТА (Э = Кс х Кр)</div>
					</div>
					<div className="item row">
						<div className="col-sm-6 center d1">
							<div className="row">
								<div className="col-sm-6 left">
									Ключевой показатель результата
								</div>
								<div className="col-sm-6">
									{goals.result_name.value}
								</div>
							</div>
							<div className="row">
								<div className="col-sm-6 left">
									Целевое значение КПР
								</div>
								<div className="col-sm-6">
									{goals.kpr.value} {result_value}
								</div>
							</div>
							<div className="row small">
								<div className="col-sm-6 left">
									Плановое выполнение
								</div>
								<div className="col-sm-6">
									{plan_percent.toFixed(2) + '%'}
								</div>
							</div>
							<div className="row small">
								<div className="col-sm-6 left">
									Фактическое выполнение
								</div>
								<div className="col-sm-6">
									{fact_percent.toFixed(2) + '%'}
								</div>
							</div>
						</div>
						<div className="col-sm-6 center d2">
							{result.sum_eff}
						</div>
					</div>
					{/* Срок */}
					<div className="item header row">
						<div className="col-sm-6 left d1">Срок</div>
						<div className="col-sm-6 right d2">ЭФФЕКТИВНОСТЬ ПО СРОКУ (Кс)</div>
					</div>
					<div className="item row">
						<div className="col-sm-6 center d1">
							<div className="row">
								<div className="col-sm-6 left">
									Дата начала / окончания
								</div>
								<div className="col-sm-6">
									<div className="row">
										<div className="col-sm-6 center">
											{pn.date}
										</div>
										<div className="col-sm-6 center">
											{po.date}
										</div>
									</div>
								</div>
							</div>
							<div className="row">
								<div className="col-sm-6 left">
									Длительность
								</div>
								<div className="col-sm-6">
									{goals.pd.value} дней
								</div>
							</div>
							<div className="row small">
								<div className="col-sm-6 left">
									Истекло времени
								</div>
								<div className="col-sm-6">
									{days_percent.toFixed(2) + '%'}
								</div>
							</div>
						</div>
						<div className="col-sm-6 center d2">
							{result.sum_ks}
						</div>
					</div>
					{/* Расходы */}
					<div className="item header row">
						<div className="col-sm-6 left d1">Расходы</div>
						<div className="col-sm-6 right d2">ЭФФЕКТИВНОСТЬ РАСХОДОВ (Кр)</div>
					</div>
					<div className="item row">
						<div className="col-sm-6 center d1">
							<div className="row">
								<div className="col-sm-6 left">
									Бюджет расходов
								</div>
								<div className="col-sm-6">
									{Tools.formatNum(goals.prpz.value)} {currency_title}
								</div>
							</div>
							<div className="row small">
								<div className="col-sm-6 lef">
									Плановый объем
								</div>
								<div className="col-sm-6">
									{prpz_percent.toFixed(2) + '%'}
								</div>
							</div>
							<div className="row small">
								<div className="col-sm-6 left">
									Освоенный объем
								</div>
								<div className="col-sm-6">
									{prfz_percent.toFixed(2) + '%'}
								</div>
							</div>
							<div className="row small">
								<div className="col-sm-6 left">
									Фактические расходы
								</div>
								<div className="col-sm-6">
									{frfz_percent.toFixed(2) + '%'}
								</div>
							</div>
						</div>
						<div className="col-sm-6 center d2">
							{result.sum_kr}
						</div>
					</div>
				</div>
			</div>
		)
	}
})
