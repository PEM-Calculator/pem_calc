'use strict'

import _ from 'lodash'
import React from 'react'
import Reflux from 'reflux'
import History from './../../core/history'
import Tools from './../../core/tools'
import Store from './../../models/CalculatorStore'
import {Router, Route, IndexRoute, Redirect, Link, IndexLink} from 'react-router'

module.exports = React.createClass({
    // миксин подменяет this.state.data
    mixins: [Reflux.connect(Store, 'db')],
    period_index: null,

    // --------
    //	EVENTS
    // --------

    onPrevPeriodClick(event) {
        event.preventDefault()

        let results = this.state.db.results,
            min_period_index = 0,
            max_period_index = results.length - 1

        if (this.period_index === null) {
            this.period_index = max_period_index
        }

        this.period_index--

        if (this.period_index < min_period_index) {
            this.period_index = min_period_index
        }

        this.forceUpdate()
    },

    onNextPeriodClick(event) {
        event.preventDefault()

        let results = this.state.db.results,
            min_period_index = 0,
            max_period_index = results.length - 1

        if (this.period_index === null) {
            this.period_index = max_period_index
        }

        this.period_index++

        if (this.period_index > max_period_index) {
            this.period_index = max_period_index
        }

        this.forceUpdate()
    },

    // --------
    //	RENDER
    // --------

    render() {
        console.log('Fire p==* [FormResults.render]', this.state)

        // настройки пустые
        if (!this.state || !this.state.db || !this.state.db.config.created) {
            return (
                <div className="alert alert-info">
                    <p>
                        Настройки не заполнены.
                    </p>
                    <a href="/settings" className="alert-link">Перейти в Настройки</a>
                </div>
            )
        }

        let config = this.state.db.config,
            units = this.state.db.units,
            goals = this.state.db.goals || {},
            periods = this.state.db.periods,
            results = this.state.db.results,
            min_period_index = 0,
            max_period_index = results.length - 1

		// надо проверить забитость периодов по факту
		for(let i = max_period_index; i >= min_period_index; i--)
		{
			if(results[i].kpr_fact === null && results[i].frfz === null) {
				max_period_index--
			}
			else {
				break
			}
		}

		// заполнен ли ФАКТ
		if (!results || !results.length || max_period_index == -1) {
            return (
                <div className="alert alert-info">
                    <p>
                        План и факт не заполнен.
                    </p>
                    <a href="/planfact" className="alert-link">Перейти в План и факт</a>
                </div>
            )
        }

        // устанавливаю период
        if (this.period_index === null) {
            this.period_index = max_period_index
        }

        let period_index = this.period_index,
            result = results[period_index],
            period = periods[period_index]

        // обновляю заголовок
		// обновляю заголовок
		let title = (goals.project_name || {}).value || '*Новый проект'
		window.PEM.updateTitle(title)

        let expense_title = units.unit_expense.range[units.unit_expense.value].value,
            result_value = units.unit_result.value,
            plan_percent = 100 / goals.kpr.value * result.sum_kpr_plan,
            fact_percent = 100 / goals.kpr.value * result.sum_kpr_fact,
            days_percent = 100 / goals.pd.value * result.sum_fd,
            prpz_percent = 100 / goals.prpz.value * result.sum_prpz,
            prfz_percent = 100 / goals.prpz.value * result.sum_prfz,
            frfz_percent = 100 / goals.prpz.value * result.sum_frfz,
            pn = Tools.parseDate(new Date(goals.pn.value)),
            po = Tools.parseDate(new Date(goals.po.value)),
            period_pn = Tools.parseDate(new Date(period.pn.value)),
            period_po = Tools.parseDate(new Date(period.po.value)),
            result_method = goals.result_method.value,
            // прогнозная дата окончания
            day_length = 86400000,
            frc_fd = result.frc_fd,
			add_day = (Math.floor(frc_fd) < frc_fd ? 1 : 0),
            frc_po = Tools.parseDate(new Date(goals.pn.value + (Math.floor(frc_fd) - 1 + add_day) * day_length))

        return (
            <div>
                <table style={{margin: '10px 0'}}>
                    <tbody>
                    <tr>
                        <td style={{width: '120px'}}>Период оценки:</td>
                        <td>
                            { period_index > 0 ? <a className="glyphicon glyphicon-chevron-left pointer" onClick={ this.onPrevPeriodClick }/> : '' }
                            <span className="value-block" style={{margin: '0 10px', padding: '4px'}}>{ pn.date } - { period_po.date }</span>
                            { period_index < max_period_index ? <a className="glyphicon glyphicon-chevron-right pointer"
                                                                   onClick={ this.onNextPeriodClick }/> : '' }
                        </td>
                    </tr>
                    </tbody>
                </table>

                <div className="white-form" id="monitor-data">
                    {/**********************************************************
                    	Результат
                    **********************************************************/}
                    <div className="item header row">
                        <div className="col-xs-6 col-sm-6 left d1">Результат</div>
                        <div className="col-sm-6 center d2">ЭФФЕКТИВНОСТЬ РЕЗУЛЬТАТА (Э = Кс х Кр)</div>
                    </div>
                    <div className="item row">
                        {/* left */}
                        <div className="col-xs-6 col-sm-6 col-md-6 center d1">
                            <div className="row">
                                <div className="col-xs-7 col-sm-5 col-md-5 left">
                                    Ключевой показатель результата
                                </div>
                                <div className="col-xs-5 col-sm-6 col-md-6 value-block">
                                    { goals.result_name.value }
                                </div>
                            </div>
                            <br/>
                            <div className="row">
                                <div className="col-xs-7 col-sm-5 col-md-5 left">
                                    <div className="hide-text">Целевое значение КПР</div>
                                    <div className="small hide-text">Плановое выполнение</div>
                                    <div className="small hide-text">Фактическое выполнение</div>
                                </div>
                                <div className="col-xs-7 col-sm-6 col-md-6 value-block">
                                    <div>{ goals.kpr.value } { result_value }</div>
                                    <div className="small">{ plan_percent.toFixed(2) + '%' }</div>
                                    <div className="small">{ fact_percent.toFixed(2) + '%' }</div>
                                </div>
                            </div>
							{/* Дополнительное поле ППР */}
							{ goals.ppr_check.value && goals.ppr.value ? <div>
								<br/>
								<div className="row">
	                                <div className="col-xs-7 col-sm-5 col-md-5 left">
	                                    <div className="hide-text">Плановая прибыль</div>
	                                </div>
	                                <div className="col-xs-7 col-sm-6 col-md-6 value-block">
	                                    <div>
											{ goals.ppr.value }
											&nbsp;
											{ expense_title }
										</div>
	                                </div>
	                            </div>
							</div> : '' }
                        </div>

                        {/* right */}
                        <div className="col-xs-6 col-sm-6 col-md-6 d2">
                            <div className="row">
                                <div className="col-xs-0 col-sm-1 col-md-1"/>
                                <div className="col-xs-12 col-sm-11 col-md-11">
									<div className="center">
                                    	<span className="effily-value">{ Tools.formatShare(result.sum_eff, result_method) }</span>
									</div>
									{/* Дополнительное поле ППР */}
									{ goals.ppr_check.value && goals.ppr.value ? <div>
										<div className="row">
	                                        <div className="col-sm-8 col-md-8 left hide-text">
	                                            Прогноз по прибыли
	                                        </div>
	                                        <div className="col-sm-4 col-md-4 right">
	                                            { Tools.formatNum(result.frc_pr.toFixed(2)) }
												&nbsp;
												{ expense_title }
	                                        </div>
	                                    </div>
										<div className="row">
	                                        <div className="col-sm-8 col-md-8 left hide-text">
	                                            Прогноз по эффективной прибыли
	                                        </div>
	                                        <div className="col-sm-4 col-md-4 right">
	                                            { Tools.formatNum(result.frc_pre.toFixed(2)) }
												&nbsp;
												{ expense_title }
	                                        </div>
	                                    </div>
									</div> : '' }
                                </div>
                            </div>
                        </div>
                    </div>

                    {/**********************************************************
                    	Срок
                    **********************************************************/}
                    <div className="item header row">
                        <div className="col-sm-6 left d1">Срок</div>
                        <div className="col-sm-6 center d2">ЭФФЕКТИВНОСТЬ ПО СРОКУ (Кс)</div>
                    </div>
                    <div className="item row">
                        {/* left */}
                        <div className="col-sm-6 col-md-6 center d1">
                            <div className="row">
                                <div className="col-sm-5 col-md-5 left hide-text">Дата начала / окончания</div>
                                <div className="col-sm-6 col-md-6">
                                    <div className="row">
                                        <div className="col-sm-6 col-md-5 center value-block">{ pn.date }</div>
                                        <div className="col-sm-0 col-md-2"/>
                                        <div className="col-sm-6 col-md-5 center value-block">{ po.date }</div>
                                    </div>
                                </div>
                            </div>
                            <br/>
                            <div className="row">
                                <div className="col-sm-5 col-md-5 left">
                                    <div className="hide-text">Длительность</div>
                                    <div className="small hide-text">Истекло времени</div>
                                </div>
                                <div className="col-sm-6 col-md-6 value-block">
                                    <div>{ goals.pd.value } дней</div>
                                    <div className="small">{ days_percent.toFixed(2) + '%' }</div>
                                </div>
                            </div>
                        </div>

                        {/* right */}
                        <div className="col-sm-6 col-md-6 d2">
                            <div className="row">
                                <div className="col-sm-1 col-md-1"/>
                                <div className="col-sm-11 col-md-11">
                                    <div className="center">
                                        <span className="effily-value">{ Tools.formatShare(result.sum_ks, result_method) }</span>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-8 col-md-8 left hide-text">
                                            Прогноз фактической длительности задачи (Дней)
                                        </div>
                                        <div className="col-sm-4 col-md-4 right">
                                            { !frc_fd ? '∞' : Tools.formatNum(frc_fd.toFixed(2)) }
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-8 col-md-8 left hide-text">
                                            Прогноз даты фактического окончания
                                        </div>
                                        <div className="col-sm-4 col-md-4 right">
                                            { !frc_fd ? '∞' : frc_po.date }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/**********************************************************
                    	Расходы
                    **********************************************************/}
                    <div className="item header row">
                        <div className="col-sm-6 col-md-6 left d1">Расходы</div>
                        <div className="col-sm-6 col-md-6 center d2">ЭФФЕКТИВНОСТЬ РАСХОДОВ (Кр)</div>
                    </div>
                    <div className="item row">
                        {/* left */}
                        <div className="col-sm-6 col-md-6 center d1">
                            <div className="row">
                                <div className="col-sm-5 col-md-5 left">
                                    <div className="hide-text">Бюджет расходов</div>
                                    <div className="small hide-text">Плановый объем</div>
                                    <div className="small hide-text">Освоенный объем</div>
                                    <div className="small hide-text">Фактические расходы</div>
                                </div>
                                <div className="col-sm-6 col-md-6 value-block">
                                    <div>{ Tools.formatNum(goals.prpz.value) } { expense_title }</div>
                                    <div className="small">{ prpz_percent.toFixed(2) + '%' }</div>
                                    <div className="small">{ prfz_percent.toFixed(2) + '%' }</div>
                                    <div className="small">{ frfz_percent.toFixed(2) + '%' }</div>
                                </div>
                            </div>
                        </div>

                        {/* right */}
                        <div className="col-sm-6 col-md-6 d2">
                            <div className="row">
                                <div className="col-sm-1 col-md-1"/>
                                <div className="col-sm-11 col-md-11">
                                    <div className="center">
                                        <span className="effily-value">{ Tools.formatShare(result.sum_kr, result_method) }</span>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-8 col-md-8 left hide-text">
                                            Прогноз фактических расходов на задачу
                                        </div>
                                        <div className="col-sm-4 col-md-4 right">
                                            { Tools.formatNum((result.frc_frfz * 1).toFixed(2)) }
											&nbsp;
											{ expense_title }
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-8 col-md-8 left hide-text">
                                            Прогноз отклонения по расходам
											<br/>
											(+перерасход / -экономия)
                                        </div>
                                        <div className="col-sm-4 col-md-4 right">
                                            { Tools.formatNum((result.frc_frfz - goals.prpz.value).toFixed(2)) }
											&nbsp;
											{ expense_title }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

				{/* Инструкции */}
				<div style={ {border: '1px solid gray', padding: '10px', fontStyle: 'italic'} }>
					Эффективность — способность выполнять работу и достигать желаемого результата в заданный срок и бюджет
				</div>

				<hr/>

				<div>
					<h3>Что означают показатели оценки эффективности</h3>

					<p>
						<b>Э (Эффективность комплексная)</b> - текущая оценка выполнения результата с учетом эффективности по сроку и эффективности расходов.
					</p>

					<p>
						Э = 1 - норма эффективности.
						<br/>
						Э &lt; 1 - низкая эффективность.
						<br/>
						Э &gt; 1 - высокая эффективность (сверхэффективность)
					</p>

					<p>
						<b>Кс (Коэффициент эффективности по сроку)</b> - текущая оценка эффективности выполнения результата по объему в срок.
					</p>

					<p>
						Кс = 1 - фактический объем выполнения соответствует плановому.
						<br/>
						Кс &lt; 1 - фактический объем выполнения меньше планового.
						<br/>
						Кс &gt; 1 - фактический объем выполнения превышает плановый.
					</p>

					<p>
						<b>Кр (Коэффициент эффективности расходов)</b> - текущая оценка эффективности расходов на выполненный объем.
					</p>

					<p>
						Кр = 1 - фактические расходы на выполненный объем соответствуют плановым.
						<br/>
						Кр &lt; 1 - фактические расходы на выполненный объем превышают плановые (перерасход).
						<br/>
						Кр &gt; 1 - фактические расходы на выполненный объем ниже плановых (экономия).
					</p>

					<cite>
						<big>*</big> Уровень эффективности может отображаться в долях и в процентах (выбирается в настройках проекта). При выборе “В процентах” значения уровней эффективности умножаются на 100%
					</cite>
				</div>

				<hr/>

				<div>
					<h3>Что означают прогнозы</h3>

					<p>
						<b>Прогноз прибыли</b> (если задан параметр “Оценка эффективности проекта по прибыли” в настройках) показывает расчетное прогнозное <b>абсолютное</b> значение прибыли к моменту достижения 100% результата с учетом текущего уровня эффективности расходов (Кр).
					</p>

					<p>
						<b>Прогноз эффективной прибыли</b> (если задан параметр “Оценка эффективности проекта по прибыли” в настройках) показывает расчетное прогнозное значение прибыли к моменту достижения 100% результата с учетом текущего уровня эффективности расходов (Кр) и эффективности по сроку (Кс).
					</p>

					<p>
						<b>Прогноз фактической длительности</b> - прогнозное количество дней от планового начала, требуемое на выполнение 100% результата (КПР) при текущем уровне эффективности по сроку (Кс).
					</p>

					<p>
						<b>Прогноз даты фактического окончания</b> - прогнозная дата достижения 100% результата (КПР) при текущем уровне эффективности по сроку (Кс).
					</p>

					<p>
						<b>Прогноз фактических расходов</b> - прогнозное значение суммы расходов, требуемых на выполнение 100% результата (КПР) при текущем уровне эффективности расходов (Кр).
					</p>

					<p>
						<b>Прогноз отклонения по расходам (+перерасход / -экономия)</b> - значение, на которое по прогнозу отклонится фактическая сумма расходов от плановой к моменту выполнения 100% результата (КПР). (+000) - увеличение расходов. (-000) - уменьшение расходов.
					</p>
				</div>
            </div>
        )
    }
})
