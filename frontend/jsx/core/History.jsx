'use strict';

import { browserHistory } from 'react-router'

browserHistory.gotoMonitor = function() {
	this.push('/');
	window.PEM.updateMenu();
};

browserHistory.gotoPlanFact = function() {
	this.push('/planfact');
	window.PEM.updateMenu();
};

browserHistory.gotoSettings = function() {
	this.push('/settings');
	window.PEM.updateMenu();
};

module.exports = browserHistory;
