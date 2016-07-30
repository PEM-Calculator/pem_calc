'use strict'

import _ from 'lodash'
import React from 'react'
import Reflux from 'reflux'
import History from './../../core/history'
import Tools from './../../core/tools'
import Store from './../../models/CalculatorStore'
import FormMonitor from './FormMonitor'
import FormPlanFact from './FormPlanFact'
import FormSettings from './FormSettings'

/*
 *	class Calculator
 *
 *	@props
 */
let Calculator = React.createClass({
	render() {
		//console.log('Fire p==* [%s]', 'Calculator.render', this.state)

		// ссылки на методы
		return (
			<div>
				{this.props.children}
			</div>
		)
	},
})

Calculator.FormMonitor = FormMonitor
Calculator.FormPlanFact = FormPlanFact
Calculator.FormSettings = FormSettings

module.exports = Calculator
