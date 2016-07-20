'use strict'
// загружаю модули
import _ from 'lodash'
import React from 'react'
import ReactDOM from 'react-dom'
import Reflux from 'reflux'
// загружаю компоненты
import history from './../../core/history'
import Tools from './../../core/tools'
import CalculatorStore from './../../models/CalculatorStore'

//	-------------------------------------
//		class Input1
//	-------------------------------------
let Input1 = React.createClass({
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
		console.log('Fire p==* [Input1.updateValueFromProps]', data)
		this.setValue(data.value || null)
	},

	componentWillMount() {
		// console.log('Fired p==* [Input1.componentWillMount]', this.props, this.value)
	},

	componentDidMount() {
		console.log('Fire p==* [Input1.componentDidMount]', this.props, this.value)
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
		console.log('Fire p==* [Input1.onPreChange]')

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
		console.log('Fire p==* [Input1.onChange]', event)
	},

	// Метод установки нового значения извне
	setValue(newValue) {
		console.log('Fire p==* [Input1.setValue] from "%s" to "%s"', this.value, newValue)
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
		console.log('Fire p==* [Input1.updateCheckState]')

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
		console.log('RENDER Input1')
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
}) // class Input1

//	-------------------------------------
//		class Select1
//	-------------------------------------
let Select1 = React.createClass({
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
		console.log('Fire p==* [Select1.updateValueFromProps]', data)
		// список возможных значений
		this.range = data.range

		this.setValue(data.value || null)
	},

	// Событие при изменении значения поля ввода
	onPreChange(event) {
		event.preventDefault()

		console.log('Fired p==* [Select1.onPreChange]', event, event.target)
		this.setValue(event.target.value)

		if(this.props.onChange)
			this.props.onChange(event)
		else
			this.onChange(event)
	},

	// Метод на изменение по умолчанию
	onChange(event) {
		//console.log('Fire p==* [Select1.onChange]', event)
	},

	// Метод установки нового значения извне
	setValue(newValue) {
		console.log('Fire p==* [Select1.setValue] from "%s" to "%s"', this.value, newValue)

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
}) // class Select1

//	-------------------------------------
//		class Dropdown1
//	-------------------------------------
let Dropdown1 = React.createClass({
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
		console.log('Fire p==* [Dropdown1.updateValueFromProps]', props)
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
		console.log('Fired p==* [Dropdown1.onPreChange]')
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
		console.log('Fire p==* [Dropdown1.setValue] from "%s" to "%s"', this.value, newValue)

		// валидация
		console.log('RANGE-Dropdown1', this.range)
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
}) // class Dropdown1

//	-------------------------------------
//		class Calculator.UnitsAndGoals
//
//		@props
//	-------------------------------------
let FormUnitsAndGoals = React.createClass({
	// миксин подменяет this.state.data
	mixins: [Reflux.connect(CalculatorStore, 'data')],

	componentDidMount() {
		console.log('Fire p==* [FormUnitsAndGoals.componentDidMount]', this.state)
	    this.pprDisabledUpdate()
	},

	onFormSubmit(event) {
		console.log('Fire p==* [FormUnitsAndGoals.onFormSubmit]', this.state)
		event.preventDefault()

		this.updateValues()

		this.formSubmit()
	},

	formSubmit() {
		console.log('Fire p==* [FormUnitsAndGoals.formSubmit]')

		// сохраняю
		CalculatorStore.Actions.saveUnitsAndGoals((noErrors) => {
			// если ошибок нет, перехожу на страницу периодов
			if(noErrors) {
				history.push('/planfact')
			}
			else {
				// есть ошибки, надо вывести
				let errors = []

				let units = this.state.data.units
				for(let key in units) {
					if(units[key].error)
						errors.push(units[key].title + ': ' + units[key].error)
				}

				let goals = this.state.data.goals
				for(let key in goals) {
					if(goals[key].error)
						errors.push(goals[key].title + ': ' + goals[key].error)
				}

				alert('Ошибки при сохранении:\n\n- ' + errors.join('\n- '))
			}
		})
	},

	onStartDemo(event) {
		console.log('Fire p==* [FormUnitsAndGoals.onStartDemo]', this.state)
		event.preventDefault()

		CalculatorStore.Actions.startDemo(() => {
			// обновляю данные
			this.pprDisabledUpdate()
		})
	},

	onFormReload(event) {
		console.log('Fire p==* [FormUnitsAndGoals.onFormReload]', this.state)
		event.preventDefault()

		CalculatorStore.Actions.reloadUnitsAndGoals(() => {
			// обновляю данные
			this.pprDisabledUpdate()
		})
	},

	onFormReset(event) {
		console.log('Fire p==* [FormUnitsAndGoals.onFormReset]', this.state)
		event.preventDefault()

		CalculatorStore.Actions.resetData(() => {
			// обновляю данные
			this.pprDisabledUpdate()
		})
	},

	// Изменились целевые показатели
	onValueChange(event) {
		console.log('Fire p==* [FormUnitsAndGoals.onValueChange]', this.state)
		this.updateValues()
	},

	// Изменилась настройка ППР
	onPprCheckChange(event) {
		console.log('Fire p==* [FormUnitsAndGoals.onPprCheckChange]', event)
		this.pprDisabledUpdate()
	},

	pprDisabledUpdate() {
		this.refs.ppr.setDisabled(!this.refs.ppr_check.getValue())
	},

	//
	updateValues() {
		console.log('Fire p==* [FormUnitsAndGoals.updateValues]')
		CalculatorStore.Actions.updateValues(
			{
				project_name: this.refs.project_name.value,
				result_name: this.refs.result_name.value,
				unit_result: this.refs.unit_result.value,
				kpr: this.refs.kpr.value,
				ppr_check: this.refs.ppr_check.value,
				ppr: this.refs.ppr.value,
				pn: this.refs.pn.value,
				po: this.refs.po.value,
				prpz: this.refs.prpz.value,
				currency: this.refs.currency.value,
				plan_range: this.refs.plan_range.value,
				plan_count: this.refs.plan_count.value,
				plan_method: this.refs.plan_method.value,
				result_method: this.refs.result_method.value,
			},
			// добавлю callback, который будет обновлять readonly поля
			(goals) => {
				console.log('Fire p==* [FormUnitsAndGoals.updateValues.inner]')
				this.refs.pd.setValue(goals.pd.value)
				this.refs.plan_count.setValue(goals.plan_count.value)
			}
		)
	},

	render() {
		console.log('Fire p==* [FormUnitsAndGoals.render]', this.state)

		let config = this.state.data.config,
			units = this.state.data.units,
			goals = this.state.data.goals

		return (
			<div className="white-form" style={{padding: '20px'}}>
				{/* <h2>Цель проекта</h2> */}

				<form onSubmit={this.onFormSubmit} role="form" className="form-horizontal item" style={{padding: '20px 15px'}}>
					<Input1 ref="project_name" data={goals.project_name}/>

					<h3 className="liner">Цель проекта</h3>
					<Input1 ref="result_name" data={goals.result_name}/>
					<Input1 ref="unit_result" data={units.unit_result}/>
					<Input1 ref="kpr" data={goals.kpr}/>
					<Input1 ref="ppr_check" data={goals.ppr_check} onChange={this.onPprCheckChange}/>
					<Input1 ref="ppr" data={goals.ppr} onChange={this.onValueChange}/>

					<h3 className="liner">Срок проекта</h3>
					<Input1 ref="pn" data={goals.pn} onChange={this.onValueChange}/>
					<Input1 ref="po" data={goals.po} onChange={this.onValueChange}/>
					<Input1 ref="pd" data={goals.pd}/>

					<h3 className="liner">Бюджет проекта</h3>
					<Input1 ref="prpz" data={goals.prpz} onChange={this.onValueChange}/>
					{/*<Input1 data={{title: 'Порядок изменения расходов'}}/>*/}
					<Select1 ref="currency" data={goals.currency}/>

					<h3 className="liner">Дополнительно</h3>
					<Dropdown1 ref="plan_range" data={goals.plan_range} onChange={this.onValueChange}/>
					<Input1 ref="plan_count" data={goals.plan_count}/>
					<Select1 ref="plan_method" data={goals.plan_method}/>
					<Select1 ref="result_method" data={goals.result_method}/>

					{/* кнопки сохранить, отмена, сбросить */}
					<button type="submit" className="btn btn-primary">{this.state.data.config.isNew ? 'Создать задачу' : 'Сохранить изменения'}</button>
					&nbsp;
					{this.state.data.config.isNew && <button type="button" className="btn" onClick={this.onStartDemo}>Заполнить демо</button>}
					&nbsp;
					{!this.state.data.config.isNew && <button type="button" className="btn" onClick={this.onFormReload}>Отменить изменения</button>}
					&nbsp;
					{!this.state.data.config.isNew && <button type="button" className="btn" onClick={this.onFormReset}>Сброс настроек</button>}
				</form>
				{this.props.children}
			</div>
		)
	}
}) // class Calculator.UnitsAndGoals

module.exports = FormUnitsAndGoals
