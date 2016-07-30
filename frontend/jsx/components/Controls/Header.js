'use strict'
// загружаю модули
import _ from 'lodash'
import React from 'react'
import Reflux from 'reflux'
import { Router, Route, IndexRoute, Redirect, Link, IndexLink } from 'react-router'
import ReactDOM from 'react-dom'
// загружаю компоненты
import Tools from './../../core/tools'
import CalculatorStore from './../../models/CalculatorStore'

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
