'use strict'
// загружаю nodejs модули
import React from 'react'
import { Link } from 'react-router'
// загружаю компоненты
import Tools from './../../core/tools'
import OutputGoals from './OutputGoals'
import OutputEffective from './OutputEffective'
import OutputMilestones from './OutputMilestones'
import OutputDeviations from './OutputDeviations'
import OutputForecasts from './OutputForecasts'

//	-------------------------------------
//		export class Calculator.Period
//
//		@props
//	-------------------------------------
let FormResults = React.createClass({
	render() {
		console.log('Fire p==* [FormResults.render]', this.state)

		return (
			<div>
				<OutputGoals />
				<OutputEffective />
				<OutputForecasts />
				<OutputDeviations />
				<OutputMilestones />
			</div>
		)
	}
})

module.exports = FormResults
