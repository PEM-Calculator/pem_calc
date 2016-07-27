'use strict'
// загружаю модули
import _ from 'lodash'
import React from 'react'
import ReactDOM from 'react-dom'
//import Reflux from 'reflux'
// загружаю компоненты
//import history from './../../core/history'
//import Tools from './../../core/tools'
//import CalculatorStore from './../../models/CalculatorStore'
//import { Router, Route, IndexRoute, Redirect, Link, IndexLink } from 'react-router'

//	-------------------------------------
//		class Dropdown
//	-------------------------------------
module.exports = React.createClass({
	value: null,
	// диапозон значений
	range: [{title: 'По умочланию', value: 'deafult'}],

	// Инициализация
	getInitialState() {
		this.updateValueFromProps(this.props)
		return null
	},

	// В контрол переданы новые props
	componentWillReceiveProps(newProps) {
		this.updateValueFromProps(newProps)
	},

	// Метод обновления переменной
	updateValueFromProps(props) {
		//console.log('Fire p==* [Dropdown1.updateValueFromProps]', props)
		// список возможных значений
		if(typeof props.data != 'object') {
			this.setValue(props.data)
			return
		}

		if(typeof props.data.range == 'object')
			this.range = props.data.range

		this.setValue(props.data.value || null)
	},

	// Событие при изменении значения поля ввода
	onPreChange(event) {
		//console.log('Fired p==* [Dropdown1.onPreChange]')
		this.setValue(event.target.value)

		if(this.props.onChange)
			this.props.onChange(event)
		else
			this.onChange(event)
	},

	// Метод на изменение по умолчанию
	onChange(event) {
		//console.log('Fire p==* [Dropdown1.onChange]', event)
	},

	// Метод установки нового значения извне
	setValue(newValue) {
		//console.log('Fire p==* [Dropdown1.setValue] from "%s" to "%s"', this.value, newValue)

		// валидация
		//console.log('RANGE-Dropdown1', this.range)
		newValue = (parseInt(newValue) || 0)
		if(!this.range)
			newValue = null
		else if(newValue >= this.range.length)
			newValue = this.range.length - 1

		this.value = newValue
		if(this.refs.title)
			this.refs.title.innerText = this.getValueTitle()
	},

	// Метод возвращает человеко-значение
	getValue() {
		return this.value
	},

	getValueTitle() {
		let value = this.getValue()
		return this.range[value].title
	},

	render() {
		let data = this.props.data

		let valueTitle = this.getValueTitle()

		let items = _.map(this.range, (item, key) => {
			return (
				<li key={key}>
					<a href='javascript:' value={key} onClick={this.onPreChange}>{item.title}</a>
				</li>
			)
		})

		return (
			<div className={'form-group' + (data.error ? ' has-error' : '')}>

				{data.title && <label className="col-md-5 col-sm-5">{data.title}</label>}

				<div className="col-md-4 col-sm-5">
					<div className="dropdown">
						<button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
							<span ref="title">{valueTitle}</span>
							&nbsp;
							<span className="caret"></span>
						</button>
						<ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
							{items}
						</ul>
						{data.error && <div className="alert alert-danger" role="alert">{data.error}</div>}
						{data.description && <span className="help-block">{data.description}</span>}
					</div>
				</div>
				<div className="col-md-3 col-sm-2">
					{data.unit && <span>{data.unit.value}</span>}
				</div>
			</div>
		)
	}
})
