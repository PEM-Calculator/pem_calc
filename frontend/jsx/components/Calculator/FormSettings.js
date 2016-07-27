'use strict'
//
import _ from 'lodash'
import React from 'react'
import Reflux from 'reflux'
//
import History from './../../core/history'
import Tools from './../../core/tools'
import Store from './../../models/CalculatorStore'
//
import Input from './Input'
import Select from './Select'
import Dropdown from './Dropdown'

module.exports = React.createClass({
	// миксин подменяет this.state.data
	mixins: [Reflux.connect(Store, 'data')],

	componentDidMount() {
		console.log('Fire p==* [FormUnitsAndGoals.componentDidMount]', this.state)
	    this.updateDisables()
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
		Store.Actions.saveUnitsAndGoals((noErrors) => {
			// если ошибок нет, перехожу на страницу периодов
			if(noErrors) {
				History.gotoPlanFact()
				//this.updateDisables()
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

		Store.Actions.startDemo(() => {
			// обновляю данные
			this.updateDisables()
		})
	},

	onFormReload(event) {
		console.log('Fire p==* [FormUnitsAndGoals.onFormReload]', this.state)
		event.preventDefault()

		Store.Actions.reloadUnitsAndGoals(() => {
			// обновляю данные
			this.updateDisables()
		})
	},

	onFormReset(event) {
		console.log('Fire p==* [FormUnitsAndGoals.onFormReset]', this.state)
		event.preventDefault()

		Store.Actions.resetData(() => {
			// обновляю данные
			this.updateDisables()
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
		this.updateDisables()
	},

	updateDisables() {
		this.refs.ppr.setDisabled(!this.refs.ppr_check.getValue())
	},

	//
	updateValues() {
		console.log('Fire p==* [FormUnitsAndGoals.updateValues]')
		Store.Actions.updateValues(
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

		// обновляю заголовок
		let title = (((this.state.data || {}).goals || {}).project_name || {}).value
			|| '*Новый проект'
		window.PEM.updateTitle(title)

		let config = this.state.data.config,
			units = this.state.data.units,
			goals = this.state.data.goals

		return (
			<div className="white-form" style={{padding: '20px'}}>
				{/* <h2>Цель проекта</h2> */}

				<form onSubmit={this.onFormSubmit} role="form" className="form-horizontal item" style={{padding: '20px 15px'}}>
					<Input ref="project_name" data={goals.project_name}/>

					<h3 className="liner">Цель проекта</h3>
					<Input ref="result_name" data={goals.result_name}/>
					<Input ref="unit_result" data={units.unit_result}/>
					<Input ref="kpr" data={goals.kpr}/>
					<Input ref="ppr_check" data={goals.ppr_check} onChange={this.onPprCheckChange}/>
					<Input ref="ppr" data={goals.ppr} onChange={this.onValueChange}/>

					<h3 className="liner">Срок проекта</h3>
					<Input ref="pn" data={goals.pn} onChange={this.onValueChange}/>
					<Input ref="po" data={goals.po} onChange={this.onValueChange}/>
					<Input ref="pd" data={goals.pd}/>

					<h3 className="liner">Бюджет проекта</h3>
					<Input ref="prpz" data={goals.prpz} onChange={this.onValueChange}/>
					{/*<Input data={{title: 'Порядок изменения расходов'}}/>*/}
					<Select ref="currency" data={goals.currency}/>

					<h3 className="liner">Дополнительно</h3>
					<Dropdown ref="plan_range" data={goals.plan_range} onChange={this.onValueChange}/>
					<Input ref="plan_count" data={goals.plan_count}/>
					<Select ref="plan_method" data={goals.plan_method}/>
					<Select ref="result_method" data={goals.result_method}/>

					{/* кнопки сохранить, отмена, сбросить */}
					<button type="submit" className="btn btn-primary">{this.state.data.config.isNew ? 'Создать задачу' : 'Сохранить изменения'}</button>
					{/*&nbsp;
					{this.state.data.config.isNew && <button type="button" className="btn" onClick={this.onStartDemo}>Заполнить демо</button>}
					&nbsp;
					{!this.state.data.config.isNew && <button type="button" className="btn" onClick={this.onFormReload}>Отменить изменения</button>}*/}
					&nbsp;
					{!this.state.data.config.isNew && <button type="button" className="btn" onClick={this.onFormReset}>Сброс настроек</button>}
				</form>
				{this.props.children}
			</div>
		)
	}
})
