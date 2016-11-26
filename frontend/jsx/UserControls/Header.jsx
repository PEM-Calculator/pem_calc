'use strict';

import React from 'react'
import Reflux from 'reflux'
import CalculatorStore from './../Models/CalculatorStore'

/*
 *	class MainMenu
 *
 *	@props
 */
let aHeader = React.createClass({
	// миксин подменяет this.state.data
	mixins: [Reflux.connect(CalculatorStore, 'data')],

	render() {
		console.log('Header Render')
		let title = (((this.state.data || {}).goals || {}).project_name || {}).value
			|| '*Новый проект'

		// ссылки на методы
		return (
			<div>
				{title}
			</div>
		)
	}
})

module.exports = aHeader
