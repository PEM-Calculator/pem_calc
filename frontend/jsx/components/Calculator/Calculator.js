'use strict'
// загружаю модули
import _ from 'lodash'
import React from 'react'
import FormUnitsAndGoals from './FormUnitsAndGoals'
import FormMilestones from './FormMilestones'
import FormResults from './FormResults'

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

Calculator.FormUnitsAndGoals = FormUnitsAndGoals
Calculator.FormMilestones = FormMilestones
Calculator.FormResults = FormResults

module.exports = Calculator
