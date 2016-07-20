'use strict'
// загружаю nodejs модули
import React from 'react'
import Reflux from 'reflux'
// загружаю компоненты
import Tools from './../../core/tools'
import CalculatorStore from './../../models/CalculatorStore'

//	-------------------------------------
//		class EfficiencyRow
//	-------------------------------------
let EfficiencyRow = React.createClass({

	getInitialState() {
		return this.props.data || {}
	},

	render() {
		let value = this.state.value
			? (this.state.value * 1.0).toFixed(3)
			: '?'
		return (
			<div className="col-md-4 col-sm-4 col-xs-6">
				<div className="efficiency-row">
					<span className="value">{value}</span>
					<span className="title">{this.state.title}</span>
					<span className="placeholder">{this.state.placeholder}</span>
				</div>
			</div>
		)
	}
})

//	---------------------------------------------
//		export class Calculator.OutputEffective
//
//		@props
//	---------------------------------------------
let OutputEffective = React.createClass({
	mixins: [Reflux.connect(CalculatorStore, 'db')],

	render() {
		let efficiency 	= (this.state.db.results ? this.state.db.results.efficiency || null : null)

		if(!efficiency)
			return null

		return (
			<div>
				<h2>Эффективность</h2>

				<div className="row">
					<EfficiencyRow data={efficiency.ks} />
					<EfficiencyRow data={efficiency.kr} />
					<EfficiencyRow data={efficiency.eff} />
				</div>
			</div>
		)
	}
})

module.exports = OutputEffective
