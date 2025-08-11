import moment from 'moment';
import React, {Component} from 'react';
import '../../css/payouts.css';
// import '../css/reactDate.css';
import {api} from '../../services/api';


const AdminPayoutAction = {start: 'start', save: 'save', complete: 'complete', cancel: 'cancel'};

class AdminPayouts extends Component {

    constructor(props) {
        super(props);

        this.state = {
            openedTotalPayoutAmount: 0,
            openedPayouts: [],
            pendingPayouts: [],
            completedPayouts: [],
            canceledPayouts: []
        };
    }

    componentDidMount() {
        this.fetchData({opened: true});
    }

    formatCard(value) {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = []

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    }

    fetchData(params) {
        this.setState({isLoading: true}, () => {
            api.getOpenedPayouts(params).then(data => {
                if (data) {
                    const {openedTotalPayoutAmount, openedPayouts, pendingPayouts, completedPayouts, canceledPayouts} = data;
                    const {skipOpenedPayouts} = params;
                    const opts = {pendingPayouts, completedPayouts, canceledPayouts};

                    if (!skipOpenedPayouts) {
                        opts.openedTotalPayoutAmount = openedTotalPayoutAmount;
                        opts.openedPayouts = openedPayouts;
                    }

                    this.setState(opts);
                }
            });
        });
    }

    onChange = (e, i, cat, field) => {
        const {value} = e.target;
        const category = this.state[cat];

        category[i][field] = value;

        this.setState({[cat]: category});
    }

    updatePayout = (action, params) => {
        api.saveOpenedPayouts({action, params}).then((resp) => {
            if (action === AdminPayoutAction.start) {
                const {userIds} = params;
                let {openedPayouts} = this.state;

                openedPayouts = openedPayouts.filter(function (item) {
                    return userIds.indexOf(item.userId) === -1;
                });

                this.setState({openedPayouts});
            }

            if (action !== AdminPayoutAction.save) {
                this.fetchData({skipOpenedPayouts: true});
            }
        });
    }

    renderOpenedPayouts() {
        const {openedPayouts} = this.state;

        return <section className="payouts">
            <h3 className="alert alert-primary">Нові перекази</h3>

            {openedPayouts && openedPayouts.length > 0 && this.renderTable(openedPayouts, true, false)}
        </section>;
    }

    renderTable(items, hasAction, hasId, showDateColumn) {
        return <div>
            {items && items.length > 0 && <table className="table table-hover table-responsive-sm"
                                                 style={{fontSize: '0.8rem'}}>
                {this.renderTableHead(showDateColumn, hasAction, hasId)}
                <tbody>
                {items.map((item, i) => this.renderRow(item, i, showDateColumn, hasAction))}
                {hasAction && this.renderTotalRow(items)}
                </tbody>
            </table>}
        </div>;
    }

    renderTableHead(showDateColumn, hasAction, hasId) {
        return <thead style={{borderTop: '2px solid #dee2e6', backgroundColor: '#f6f6f6'}}>
        <tr>
            {showDateColumn && <th scope="col" className="text-left">Дата</th>}
            <th scope="col" className="text-left" style={{width: '180px'}}>Нікнейм</th>
            <th scope="col" className="text-center">Картка</th>
            {hasId && <th scope="col" className="text-center">Код</th>}
            <th scope="col" className="text-right">Донати</th>
            <th scope="col" className="text-right" title="Комісія платіжної системи">Комісія</th>
            <th scope="col" className="text-right" title="Послуги сервісу">Послуги</th>
            <th scope="col" className="text-right">Сума</th>
            {hasAction && <th scope="col"></th>}
        </tr>
        </thead>;
    }

    renderRow(item, i, showDateColumn, hasAction) {
        return <tr id={`item-${i}`} key={`item-${i}`}>
            {showDateColumn && <td className="text-left">
                {moment(item.payoutEndDate).format('YYYY-MM-DD HH:mm:ss')}
            </td>}
            <td className="text-left">
                <a href={`/${item.userNickname}`} className="user-name" style={{fontSize: '0.9rem', fontWeight: '700'}}>
                    {item.userNickname}
                </a>
            </td>
            <td>
                <input className="form-control" type="text" disabled="disabled"
                       style={{
                           display: 'inline-block',
                           fontFamily: 'monospace, monospace',
                           height: '25px',
                           padding: '0 10px',
                           fontSize: '0.8rem',
                           textAlign: 'center',
                           width: '180px'
                       }}
                       value={this.formatCard(item.card || '')}/>
            </td>
            {item.clientPayoutId && <td className="text-center">{item.clientPayoutId}</td>}
            <td className="text-right">{item.totalDonatesAmount}</td>
            <td className="text-right">{item.totalTransactionFee}</td>
            <td className="text-right">{item.totalServiceFee}</td>
            <td className="text-right"><strong>{item.totalPayoutAmount}</strong></td>
            {hasAction && <td className="text-right">
                <button className="btn btn-info btn-sm"
                        style={{height: '22px', minWidth: 'auto', fontSize: '0.7rem', lineHeight: '3px'}}
                        onClick={() => this.updatePayout(AdminPayoutAction.start, {userIds: [item.userId]})}>
                    Виконати
                </button>
            </td>}
        </tr>;
    }

    renderTotalRow(item) {
        const {openedTotalPayoutAmount} = this.state;

        return <tr className="total-row" style={{backgroundColor: '#eee'}}>
            <td className="text-left" colSpan="5"><strong>Разом</strong></td>
            <td className="text-right"><strong>{openedTotalPayoutAmount}</strong></td>
            <td></td>
        </tr>;
    }

    renderPendingPayouts() {
        const {pendingPayouts} = this.state;

        return <section className="new-payout">
            <h3 className="alert alert-warning">Виконуються</h3>

            {pendingPayouts && pendingPayouts.length > 0 && pendingPayouts.map((item, i) => this.renderPendingItem(item, i))}
        </section>;
    }

    renderPendingItem(item, i) {
        return <div key={item._id} className="pt-4 mb-5" style={{fontSize: '0.8rem'}}>
            <table className="table table-hover table-responsive-sm">
                {this.renderTableHead(false, false, true)}
                <tbody>
                {this.renderRow(item, i)}
                </tbody>
            </table>
            <div className="row">
                <div className="col-sm-8 d-flex align-items-center justify-content-between">
                    <span className="text-muted pl-3">Коментар авторові:</span>
                    <input className="form-control" type="text"
                           style={{
                               height: '25px',
                               padding: '0 10px',
                               fontSize: '0.8rem',
                               width: '350px',
                               marginLeft: '20px'
                           }}
                           value={item.comment || ''}
                           onChange={(e) => this.onChange(e, i, 'pendingPayouts', 'comment')}/>
                </div>

                <div className="col-sm-4 d-flex align-items-center justify-content-end">
                    <span>Вих. комісія:</span>
                    <input className="form-control" type="text"
                           style={{
                               height: '25px',
                               padding: '0 10px',
                               fontSize: '0.8rem',
                               width: '100px',
                               marginLeft: '20px'
                           }}
                           value={item.totalOutgoingTransactionFee || ''}
                           onChange={(e) => this.onChange(e, i, 'pendingPayouts', 'totalOutgoingTransactionFee')}/>
                </div>
            </div>
            <div className="row mt-2">
                <div className="col-sm-8 d-flex align-items-center justify-content-between">
                    <span className="text-muted pl-3">Нотатки (адмін):</span>
                    <input className="form-control" type="text"
                           style={{
                               height: '25px',
                               padding: '0 10px',
                               fontSize: '0.8rem',
                               width: '350px',
                               marginLeft: '20px'
                           }}
                           value={item.adminComment || ''}
                           onChange={(e) => this.onChange(e, i, 'pendingPayouts', 'adminComment')}/>
                </div>
            </div>
            <div className="row mt-4 mb-5">
                <div className="col-sm-12 ml-auto text-right">
                    <button className="btn btn-light btn-sm mr-3"
                            onClick={() => this.updatePayout(AdminPayoutAction.cancel, item)}>
                        Скасувати
                    </button>

                    <button className="btn btn-info btn-sm mr-3"
                            onClick={() => this.updatePayout(AdminPayoutAction.save, item)}>
                        Зберегти
                    </button>

                    <button className="btn btn-success btn-sm"
                            onClick={() => this.updatePayout(AdminPayoutAction.complete, item)}>
                        Завершити
                    </button>
                </div>
            </div>
        </div>;
    }

    renderCompletedPayouts() {
        const {completedPayouts} = this.state;

        return <section className="payouts payouts-completed">
            <h3 className="alert alert-success">Завершені</h3>

            {completedPayouts && completedPayouts.length > 0 && this.renderTable(completedPayouts, false, true, true)}
        </section>;
    }

    renderCanceledPayouts() {
        const {canceledPayouts} = this.state;

        return <section className="payouts payouts-canceled">
            <h3 className="alert alert-secondary">Скасовані</h3>

            {canceledPayouts && canceledPayouts.length > 0 && this.renderTable(canceledPayouts, false, true, true)}
        </section>;
    }

    render() {
        return <div className="admin-payouts">
            <h3>Перекази - Адмінка</h3>

            {this.renderOpenedPayouts()}

            {this.renderPendingPayouts()}

            {this.renderCompletedPayouts()}

            {this.renderCanceledPayouts()}
        </div>;
    }
}


export default AdminPayouts;
