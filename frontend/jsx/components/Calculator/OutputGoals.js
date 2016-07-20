'use strict'
// загружаю nodejs модули
import React from 'react'
import Reflux from 'reflux'
// загружаю компоненты
import Tools from './../../core/tools'
import CalculatorStore from './../../models/CalculatorStore'

//	-------------------------------------
//		class OneRowValue
//	-------------------------------------
let OneRowValue = React.createClass({
	render() {
		let value1 = this.props.value1
			? (this.props.value1 * 1.0).toFixed(0)
			: '?'
		let value2 = this.props.value2
			? (this.props.value2 * 1.0).toFixed(0)
			: null
		return (
			<tr>
				<th>{this.props.title}</th>
				<td>{value1} {!value2 || ('/ ' + value2)}
					{this.props.unit || (this.props.unit)}</td>
			</tr>
		)
	}
})

//	-----------------------------------------
//		export class Calculator.OutputGoals
//
//		@props
//	-----------------------------------------
let OutputGoals = React.createClass({
	mixins: [Reflux.connect(CalculatorStore, 'db')],

	render() {
		console.log('Fire p==* [OutputGoals.render]')
		console.log(this.state.db)

		if(!this.state.db.periods || this.state.db.periods.length == 0)
			return (
				<div>
					<h2>Необходимо заполнить настройки</h2>
				</div>
			)

		let planfact 	= (this.state.db.results ? this.state.db.results.planfact || null : null),
			goals 		= this.state.db.goals,
			period 		= this.state.db.periods[0]

		if(!planfact)
			return (
				<div>
					<h2>План-факт еще не заполнен</h2>
				</div>
			)

		return (
			<div>
				<h2>Целевые показатели</h2>

				<table className="table table-striped">
					<tbody>
						{!goals.ppr || (
							<OneRowValue title={goals.ppr.title} unit={goals.ppr.unit.value} value1={goals.ppr.value} />
						)}
						<OneRowValue title={goals.krp.title} value1={goals.krp.value} />

						<tr><th colSpan="2">
							<h3>ПЛАН</h3>
						</th></tr>

						<OneRowValue title={planfact.kpr_plan.title} unit={goals.kpr_plan.unit.value} value1={planfact.kpr_plan.value} value2={goals.kpr_plan.value} />

						<OneRowValue title={planfact.prpz.title} unit={goals.prpz.unit.value} value1={planfact.prpz.value} value2={goals.prpz.value} />

						<OneRowValue title={planfact.pd.title} unit={goals.pd.unit.value} value1={planfact.pd.value} value2={goals.pd.value} />

						<tr><th colSpan="2">
							<h3>ФАКТ</h3>
						</th></tr>

						<OneRowValue title={planfact.kpr_fact.title} unit={goals.kpr_plan.unit.value} value1={planfact.kpr_fact.value} />

						<OneRowValue title={planfact.frfz.title} unit={goals.prpz.unit.value} value1={planfact.frfz.value} />

						<OneRowValue title={planfact.fd.title} unit={goals.pd.unit.value} value1={planfact.fd.value} />

						<OneRowValue title={planfact.prfz.title} unit={goals.prpz.unit.value} value1={planfact.prfz.value} />
					</tbody>
				</table>
			</div>
		)
	}
})

module.exports = OutputGoals
