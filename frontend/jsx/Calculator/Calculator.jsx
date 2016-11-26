'use strict';

import React from 'react'
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
});

Calculator.FormMonitor = FormMonitor;
Calculator.FormPlanFact = FormPlanFact;
Calculator.FormSettings = FormSettings;

module.exports = Calculator;
