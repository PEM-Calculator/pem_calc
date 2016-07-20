'use strict'
// загружаю nodejs модули
import React from 'react'
import Reflux from 'reflux'
// загружаю компоненты
import Tools from './../../core/tools'
import CalculatorStore from './../../models/CalculatorStore'

//	-----------------
//		class Value
//	-----------------
let Value = React.createClass({
	render() {
		let fixes = (this.props.fixes ? this.props.fixes : 0),
			ifNull = (this.props.ifNull ? this.props.ifNull : '-'),
			value = (Number(this.props.value) == this.props.value)
				? (this.props.value * 1.0).toFixed(fixes)
				: ifNull
		return ( <span>{ value }</span> )
	}
})

//	------------------------
//		class MilestoneRow
//	------------------------
let MilestoneRow = React.createClass({
	render() {
		let resultPeriod = this.props.resultPeriod
		return (
			<tr>
				<td>{ this.props.index }.</td>
				<td><Value value={ resultPeriod.kpr_plan } fixes="1" /></td>
				<td><Value value={ resultPeriod.prpz } fixes="1" /></td>
				<td><Value value={ resultPeriod.pd } />
					<span className="small-silver">{ Tools.timeToString(this.props.period.pn.value) } -<br/> { Tools.timeToString(this.props.period.po.value) }</span></td>
				<td><Value value={ resultPeriod.kpr_fact } fixes="1" /></td>
				<td><Value value={ resultPeriod.frfz } fixes="1" /></td>
				<td><Value value={ resultPeriod.fd } /></td>
				<td><Value value={ resultPeriod.prfz } fixes="1" /></td>
				<td><Value value={ resultPeriod.ks } fixes="3" /></td>
				<td><Value value={ resultPeriod.kr } fixes="3" /></td>
				<td><Value value={ resultPeriod.eff } fixes="3" /></td>
			</tr>
		)
	}
})

//	----------------------------------------------
//		export class Calculator.OutputMilestones
//
//		@props
//			data - CalculatorStore.data.goals
//	----------------------------------------------
let OutputMilestones = React.createClass({
	mixins: [Reflux.connect(CalculatorStore, 'db')],

	render() {
		//console.log('Fire p==* [%s]', 'OutputMilestones.render', this.state)

		let planfact	= (this.state.db.results ? this.state.db.results.planfact || null : null),
			efficiency	= (this.state.db.results ? this.state.db.results.efficiency || null : null),
			periods		= this.state.db.periods

		if(!planfact || !efficiency) return null

		let index = 0
		let milestones = _.map(this.state.db.results.periods, (resultPeriod, key) => {
			return (
				<MilestoneRow key={key} ref={key} index={++index} resultPeriod={resultPeriod} period={periods[key]} />
			)
		})

		return (
			<div>
				<h2>Показатели по периодам</h2>

				<div className="table-responsive">
					<table className="table table-bordered table-striped">
						<tbody>
							<tr className="th-align-center">
								<th></th>
								<th colSpan="3">ПЛАН</th>
								<th colSpan="4">ФАКТ</th>
								<th colSpan="3">ЭФФЕКТИВНОСТЬ</th>
							</tr>
							<tr>
								<th>Этап</th>
								<th>{ planfact.kpr_plan.placeholder }</th>
								<th>{ planfact.prpz.placeholder }</th>
								<th>{ planfact.pd.placeholder }</th>
								<th>{ planfact.kpr_fact.placeholder }</th>
								<th>{ planfact.frfz.placeholder }</th>
								<th>{ planfact.fd.placeholder }</th>
								<th>{ planfact.prfz.placeholder }</th>
								<th>{ efficiency.ks.placeholder }</th>
								<th>{ efficiency.kr.placeholder }</th>
								<th>{ efficiency.eff.placeholder }</th>
							</tr>
							{ milestones }
						</tbody>
					</table>
				</div>
			</div>
		)
	}
})

module.exports = OutputMilestones
