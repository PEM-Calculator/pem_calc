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
		let value1 = this.props.value.absolute_value,
			value2 = this.props.value.relative_value
		let abs_value = (Number(value1) == value1)
			? (value1 * 1.0).toFixed(1)
			: '?'
		let rel_value = (Number(value2) == value2)
			? (value2 * 100.0).toFixed(1) + '%'
			: '?'
		return (
			<div className="col-md-4 col-sm-6 col-xs-12">
				<div className="deviation-row">
					<span className="value">{abs_value} / {rel_value}</span>
					<span className="title">{this.props.value.title}</span>
					<span className="placeholder">{this.props.value.placeholder}</span>
				</div>
			</div>
		)
	}
})

//	----------------------------------------------
//		export class Calculator.OutputDeviations
//
//		@props
//	----------------------------------------------
let OutputDeviations = React.createClass({
	mixins: [Reflux.connect(CalculatorStore, 'db')],

	render() {
		let deviations 	= (this.state.db.results ? this.state.db.results.deviations || null : null)

		if(!deviations) return null

		return (
			<div>
				<h2>Отклонения (абсолютные/относительные)</h2>

				<div className="row">
					<Row value={deviations.fd} />
					<Row value={deviations.frfz} />
					<Row value={deviations.kpr} />
				</div>
			</div>
		)
	}
})

module.exports = OutputDeviations
