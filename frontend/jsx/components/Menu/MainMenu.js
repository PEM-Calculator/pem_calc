'use strict'
// загружаю модули
import _ from 'lodash'
import React from 'react'
import Reflux from 'reflux'
import { Router, Route, IndexRoute, Redirect, Link, IndexLink } from 'react-router'

// загружаю компоненты
import history from './../../core/history'

/*
 *	class MainMenu
 *
 *	@props
 */
let MainMenu = React.createClass({
	render() {
		console.log('***HISTOOOORY', history)
		// ссылки на методы
		return (
			<div>
				<Link className="btn btn-default" to="/">Монитор</Link>
				<Link className="btn btn-default" to="/planfact">План и факт</Link>
				<Link className="btn btn-default" to="/settings">Настройки</Link>
			</div>
		)
	}
})

module.exports = MainMenu
