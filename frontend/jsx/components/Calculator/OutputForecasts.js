'use strict'
// загружаю nodejs модули
import React from 'react'
import Reflux from 'reflux'
// загружаю компоненты
import Tools from './../../core/tools'
import CalculatorStore from './../../models/CalculatorStore'

//	---------------
//		class Row
//	---------------
let Row = React.createClass({
	render() {
		console.log('***', typeof this.props.value.value, this.props.value.value)
		let value = (Number(this.props.value.value) == this.props.value.value)
			? (this.props.value.value * 1.0).toFixed(1)
			: '?'
		return (
			<div className="col-md-3 col-sm-6 col-xs-12">
				<div className="deviation-row">
					<span className="value">{ value }
						<span className="unit">{ this.props.unit }</span>
					</span>
					<span className="title">{ this.props.value.title }</span>
					<span className="placeholder">{ this.props.value.placeholder }</span>
				</div>
			</div>
		)
	}
})

//	---------------------------------------------
//		export class Calculator.OutputForecasts
//
//		@props
//	---------------------------------------------
let OutputForecasts = React.createClass({
	mixins: [Reflux.connect(CalculatorStore, 'db')],

	render() {
		let forecasts 	= (this.state.db.results ? this.state.db.results.forecasts || null : null),
			units 		= this.state.db.units

		if(!forecasts)
			return null

		return (
			<div>
				<h2>Прогнозы</h2>

				<div className="row">
					<Row value={ forecasts.fd } unit={ units.unit_time.value } />
					<Row value={ forecasts.frfz } unit={ units.unit_expense.value } />
					<Row value={ forecasts.pr } unit={ units.unit_expense.value } />
					<Row value={ forecasts.pre } unit={ units.unit_expense.value } />
				</div>
			</div>
		)
	}
})

module.exports = OutputForecasts
