'use strict'
// загружаю nodejs модули
import React from 'react'
// загружаю компоненты
import Tools from './../../core/tools'

//	-------------------------------------
//		export class Calculator.Period
//
//		@props
//			data - CalculatorStore.data.goals
//	-------------------------------------
let InputGoals = React.createClass({
	getInitialState() {
		console.log('Fire p==* [Goals.getInitialState]')
		return this.props.data || {}
	},

	render() {
		return (
			<div>
			</div>
		)
	}
})

module.exports = InputGoals
