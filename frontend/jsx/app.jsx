'use strict';

// react надо подключать в самом начале, а то ругаться будет
import React from 'react'
import { render } from 'react-dom'
import { Router, Route, IndexRoute } from 'react-router'
import History from './core/History'
import Calculator from './Calculator/Calculator'

function renderPage() {
    render((
        <Router history={History}>
            <Route path="/" component={Calculator}>
                <IndexRoute component={Calculator.FormMonitor} />
                <Route path="planfact" component={Calculator.FormPlanFact} />
                <Route path="settings" component={Calculator.FormSettings} />
            </Route>
        </Router>
    ), document.getElementById('calc'));
};

renderPage();