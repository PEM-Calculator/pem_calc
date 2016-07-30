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
//		class Select
//	-------------------------------------
module.exports = React.createClass({
	data: null,
	value: null,

	// диапозон значений
	range: [
		{title: 'Вкл', value: 'on'},
		{title: 'Откл', value: 'off'},
	],

	// Инициализация
	getInitialState() {
		this.data = this.props.data || {}
		this.updateValueFromProps(this.data)
		return null
	},

	// В контрол переданы новые props
	componentWillReceiveProps(newProps) {
		this.data = newProps.data || {}
		this.updateValueFromProps(this.data)
	},

	// Метод обновления переменной
	updateValueFromProps(data) {
		//console.log('Fire p==* [Select1.updateValueFromProps]', data)
		// список возможных значений
		this.range = data.range

		this.setValue(data.value || null)
	},

	// Событие при изменении значения поля ввода
	onPreChange(event) {
		event.preventDefault()

		//console.log('Fired p==* [Select1.onPreChange]', event, event.target)

		let target = $(event.target)
		var value = target.attr('value')

		this.setValue(value)

		if(this.props.onChange) {
			this.props.onChange(event)
		}
		else {
			this.onChange(event)
		}
	},

	// Метод на изменение по умолчанию
	onChange(event) {
		//console.log('Fire p==* [Select1.onChange]', event)
	},

	// Метод установки нового значения извне
	setValue(newValue) {
		//console.log('Fire p==* [Select1.setValue] from "%s" to "%s"', this.value, newValue, this.range, this.range.length)

		// валидация
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
		let selected = this.value,
			labelCls = 'btn btn-default ',
			onChange = this.onPreChange,
			items = _.map(this.range, (item, key) => {
				let text = (item.className
					? <span className={'glyphicon glyphicon-' + item.className} aria-hidden="true" value={key}/>
					: item.title)

				return (
					<label key={key} className={labelCls + (selected == key ? ' active' : '')} onClick={onChange} value={key}>
						<input type="radio" name="options" autocomplete="on"/>
						{text}
					</label>
				)
			})

		return (
			<div className="form-group">
				{this.data && this.data.title && <label className="col-md-5 col-sm-5">{this.data.title}</label>}
				<div className="col-md-4 col-sm-5">
					<div className="btn-group" data-toggle="buttons">
						{items}
					</div>
				</div>
				<div className="col-md-3 col-sm-2">
				</div>
			</div>
		)
	}
})
