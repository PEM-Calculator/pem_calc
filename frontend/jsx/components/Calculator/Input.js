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
//		class Input
//	-------------------------------------
module.exports = React.createClass({
	data: null,
	value: null,

	// Инициализация
	getInitialState() {
		this.data = this.props.data || {}
		this.updateValueFromProps(this.data)
		return null
	},

	// в контрол переданы новые props
	componentWillReceiveProps(newProps) {
		this.data = newProps.data || {}
		this.updateValueFromProps(this.data)
	},

	// метод обновления переменной
	updateValueFromProps(data) {
		//console.log('Fire p==* [Input1.updateValueFromProps]', data)
		this.setValue(data.value || null)
	},

	componentWillMount() {
		// console.log('Fired p==* [Input1.componentWillMount]', this.props, this.value)
	},

	componentDidMount() {
		//console.log('Fire p==* [Input1.componentDidMount]', this.props, this.value)
		this.updateCheckState()
	},

	componentWillUpdate() {
		//console.log('Fired p==* [Input1.componentWillUpdate]', this.props, this.value)
	},

	componentDidUpdate() {
		//console.log('Fired p==* [Input1.componentDidUpdate]', this.props, this.value)
	},

	componentWillUnmount() {
		//console.log('Fired p==* [Input1.componentWillUnmount]', this.props, this.value)
	},

	// Событие при изменении значения поля ввода
	onPreChange(event) {
		//console.log('Fire p==* [Input1.onPreChange]')

		switch(this.data.type) {
			case 'date':
				this.setValue(Tools.stringToTime(event.target.value))
				break

			case 'checkbox':
				this.setValue(event.target.checked)
				break

			default:
				this.setValue(event.target.value)
				break
		}

		if(this.props.onChange)
			this.props.onChange(event)
		else
			this.onChange(event)
	},

	// Метод на изменение по умолчанию
	onChange(event) {
		//console.log('Fire p==* [Input1.onChange]', event)
	},

	// Метод установки нового значения извне
	setValue(newValue) {
		//console.log('Fire p==* [Input1.setValue] from "%s" to "%s"', this.value, newValue)
		this.value = newValue

		if(this.refs.input)
			switch(this.data.type) {
				case 'checkbox':
					this.refs.input.checked = this.getValue()
					break

				default:
					this.refs.input.value = this.getValue()
					break
			}
	},

	updateCheckState() {
		//console.log('Fire p==* [Input1.updateCheckState]')

		if(this.refs.input)
			if(this.data.type == 'checkbox')
				this.refs.input.checked = this.getValue()
	},

	// Метод возвращает человеко-значение
	getValue() {
		switch(this.data.type) {
			case 'date': {
				return Tools.timeToString(this.value)
				break
			}

			default: {
				return this.value
			}
		}
	},

	setDisabled(disabled) {
		this.refs.input.disabled = (disabled == true ? true : null)
	},

	render() {
		return (
			<div className={'form-group' + (this.data.error ? ' has-error' : '')}>

				{this.data.title && <label className="col-md-5 col-sm-5">{this.data.title}</label>}

				<div className="col-md-4 col-sm-5">
					<input
						ref="input"
						className={this.data.type != 'checkbox' ? 'form-control' : ''}
						type={this.data.type || 'text'}
						defaultValue={this.getValue()}
						placeholder={this.data.placeholder}
						readOnly={this.data.readonly}
						onChange={this.onPreChange} />
					{this.data.error && <div className="alert alert-danger" role="alert">{this.data.error}</div>}
					{this.data.description && <span className="help-block">{this.data.description}</span>}
				</div>
				{/*<div className="col-md-3 col-sm-2">
					{data.unit && <span>{data.unit.value}</span>}
				</div>*/}
			</div>
		)
	}
})
