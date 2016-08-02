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
            goals = this.state.db.goals,
            periods = this.state.db.periods,
            results = this.state.db.results,
            min_period_index = 0,
            max_period_index = results.length - 1

		// надо проверить забитость периодов по факту
		for(let i = max_period_index; i >= min_period_index; i--)
		{
			if(results[i].kpr_fact === null || results[i].frfz === null) {
				max_period_index--
			}
			else {
				break;
			}
		}

        // устанавливаю период
        if (this.period_index === null) {
            this.period_index = max_period_index
        }

        let period_index = this.period_index,
            result = results[period_index],
            period = periods[period_index]

        console.log('RENDER MONITOR', results, results.length)

        if (!results || !results.length) {
            return (
                <div className="alert alert-info">
                    <p>
                        План и факт не заполнен.
                    </p>
                    <a href="/planfact" className="alert-link">Перейти в План и факт</a>
                </div>
            )
        }

        // обновляю заголовок
        window.PEM.updateTitle(goals.project_name.value)

        console.log(result)

        let currency_value = goals.currency.value,
            currency_title = (goals.currency.range[currency_value] || {}).title,
            result_value = units.unit_result.value,
            plan_percent = 100 / goals.kpr.value * result.sum_kpr_plan,
            fact_percent = 100 / goals.kpr.value * result.sum_kpr_fact,
            days_percent = 100 / goals.pd.value * result.sum_pd,
            prpz_percent = 100 / goals.prpz.value * result.sum_prpz,
            prfz_percent = 100 / goals.prpz.value * result.sum_prfz,
            frfz_percent = 100 / goals.prpz.value * result.sum_frfz,
            pn = Tools.parseDate(new Date(goals.pn.value)),
            po = Tools.parseDate(new Date(goals.po.value)),
            period_pn = Tools.parseDate(new Date(period.pn.value)),
            period_po = Tools.parseDate(new Date(period.po.value)),
            result_method = goals.result_method.value,
            // прогнозная дата окончания
            day_length = 86400*1000,
            frc_fd = Math.floor(result.frc_fd),
            frc_po = Tools.parseDate(new Date(goals.pn.value + frc_fd * day_length))

        return (
            <div>
                <table style={{margin: '10px 0'}}>
                    <tbody>
                    <tr>
                        <td style={{width: '120px'}}>Период оценки:</td>
                        <td>
                            { period_index > 0 ? <a className="glyphicon glyphicon-chevron-left pointer"
                                                    onClick={ this.onPrevPeriodClick }/> : '' }
                            <span className="value-block" style={{margin: '0 10px', padding: '4px'}}>{ pn.date }
                                - { period_po.date }</span>
                            { period_index < max_period_index ? <a className="glyphicon glyphicon-chevron-right pointer"
                                                                   onClick={ this.onNextPeriodClick }/> : '' }
                        </td>
                    </tr>
                    </tbody>
                </table>

                <div className="white-form" id="monitor-data">
                    {/*************
                     Результат
                     *************/}
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
                                    <div>Целевое значение КПР</div>
                                    <div className="small">Плановое выполнение</div>
                                    <div className="small">Фактическое выполнение</div>
                                </div>
                                <div className="col-xs-7 col-sm-6 col-md-6 value-block">
                                    <div>{ goals.kpr.value } { result_value }</div>
                                    <div className="small">{ plan_percent.toFixed(2) + '%' }</div>
                                    <div className="small">{ fact_percent.toFixed(2) + '%' }</div>
                                </div>
                            </div>
                        </div>

                        {/* right */}
                        <div className="col-xs-6 col-sm-6 col-md-6 d2">
                            <div className="row">
                                <div className="col-xs-0 col-sm-1 col-md-1"/>
                                <div className="col-xs-12 col-sm-11 col-md-11 center">
                                    <span className="effily-value">{ Tools.formatShare(result.sum_eff, result_method) }</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/********
                     Срок
                     ********/}
                    <div className="item header row">
                        <div className="col-sm-6 left d1">Срок</div>
                        <div className="col-sm-6 center d2">ЭФФЕКТИВНОСТЬ ПО СРОКУ (Кс)</div>
                    </div>
                    <div className="item row">
                        {/* left */}
                        <div className="col-sm-6 col-md-6 center d1">
                            <div className="row">
                                <div className="col-sm-5 col-md-5 left">Дата начала / окончания</div>
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
                                    <div>Длительность</div>
                                    <div className="small">Истекло времени</div>
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
                                        <div className="col-sm-8 col-md-8 left">
                                            Прогноз фактической длительности задачи (Дней)
                                        </div>
                                        <div className="col-sm-4 col-md-4 right">
                                            { Tools.formatNum(frc_fd) }
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-8 col-md-8 left">
                                            Прогноз даты фактического окончания
                                        </div>
                                        <div className="col-sm-4 col-md-4 right">
                                            { frc_po.date }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/***********
                     Расходы
                     ***********/}
                    <div className="item header row">
                        <div className="col-sm-6 col-md-6 left d1">Расходы</div>
                        <div className="col-sm-6 col-md-6 center d2">ЭФФЕКТИВНОСТЬ РАСХОДОВ (Кр)</div>
                    </div>
                    <div className="item row">
                        {/* left */}
                        <div className="col-sm-6 col-md-6 center d1">
                            <div className="row">
                                <div className="col-sm-5 col-md-5 left">
                                    <div>Бюджет расходов</div>
                                    <div className="small">Плановый объем</div>
                                    <div className="small">Освоенный объем</div>
                                    <div className="small">Фактические расходы</div>
                                </div>
                                <div className="col-sm-6 col-md-6 value-block">
                                    <div>{ Tools.formatNum(goals.prpz.value) } { currency_title }</div>
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
                                        <div className="col-sm-8 col-md-8 left">
                                            Прогноз фактических расходов на задачу (Руб.)
                                        </div>
                                        <div className="col-sm-4 col-md-4 right">
                                            { Tools.formatNum((result.frc_frfz * 1).toFixed(2)) }
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-8 col-md-8 left">
                                            Прогноз (+перерасход / -экономии) (Руб.)
                                        </div>
                                        <div className="col-sm-4 col-md-4 right">
                                            { Tools.formatNum((result.frc_frfz - goals.prpz.value).toFixed(2)) }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})
