'use strict'
/*
 
 // загружаю модули
import { createHistory, useBasename } from 'history'

// задаю корень приложения
module.exports = useBasename(createHistory)({
	basename: '/'
})

*/

import { browserHistory } from 'react-router'

module.exports = browserHistory