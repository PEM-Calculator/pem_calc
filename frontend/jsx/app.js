'use strict'

// загружаю модули
import { render } from 'react-dom'
import { Router, Route, IndexRoute, Redirect, Link } from 'react-router'
import { createHashHistory } from 'history'
import history from './core/history'

// загружаю компоненты
import Header from './components/Controls/Header'
import Calculator from './components/Calculator/Calculator'

// загружу реакт, а то будет просить
import React from 'react'

render((
	<Router history={history}>
		<Route path="/" component={Calculator}>
			<IndexRoute component={Calculator.FormMonitor} />
			<Route path="planfact" component={Calculator.FormPlanFact} />
			<Route path="settings" component={Calculator.FormSettings} />
		</Route>
	</Router>
), document.getElementById('calc'))
