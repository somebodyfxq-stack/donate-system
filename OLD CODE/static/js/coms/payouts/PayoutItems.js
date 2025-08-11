import 'rc-slider/assets/index.css';
import moment from 'moment';
import React, {Component} from 'react';
import {Accordion, Card} from 'react-bootstrap';
import '../../css/payouts.css';
import {isForeignCurrency, PaymentSystem} from '../../enums/PaymentEnums';
import {DefaultPayoutStatus, PayoutStatus} from '../../enums/PayoutEnums';
import helpers from '../../utils/helpers';


class PayoutItems extends Component {

	getStatusTitle(st) {
		const status = PayoutStatus[st] ? PayoutStatus[st] : DefaultPayoutStatus;

		return status.title;
	}

	renderCard(item, i) {
		const {payoutSystem, currentAccordionCard, toggleAccordionCard} = this.props;
		let cardIconCls = `fa-credit-card`;
		let cardTextCls = 'text-card';
		let cardText = item.cardMask;

		if ([PaymentSystem.whitepay.name, PaymentSystem.trustyeu.name].includes(payoutSystem)) {
			cardIconCls = `fa-wallet`;
			cardTextCls = 'text-wallet';
			cardText = item.card;
		} else if (payoutSystem === PaymentSystem.donatello.name) {
			cardIconCls = `fa-receipt`;
			cardTextCls = 'text-iban';
			cardText = item.card;
		} else if (item.isTransfer) {
			cardIconCls = `fa-exchange-alt`;
			cardTextCls = 'text-transfer';
			cardText = 'Переказ на баланс платних повідомлень';
		}

        return <Card key={item.payoutId || i}>
            <Accordion.Toggle
				as={Card.Header}
				eventKey={i + ''}
				onClick={() => toggleAccordionCard(i + '')}
                className={currentAccordionCard === i + '' ? 'expanded' : ''}
			>
                <div className="card-header-container flex-column flex-md-row">
					<div className='d-flex align-items-center'>
						<span className="toggle"><i className="fa-solid fa-angle-down"></i></span>
						<span className="date">{moment(item.payoutDate).format('L')}, {moment(item.payoutDate).format('LT')}</span>
					</div>
					<span className="payout-id">{item.clientPayoutId}</span>
					<span className={`badge badge-${item.status}`}>
						{this.getStatusTitle(item.status)}
					</span>
                    <span className="amount mb-0">{item.totalPayoutAmount} ₴</span>
                </div>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey={i + ''}>
                <Card.Body>
					<div className="brief-info">
						<div className="d-flex align-items-center text">
							<i className={`icon fas ${cardIconCls}`}/>
							<span className={`${cardTextCls}`}>
								{cardText}
							</span>
						</div>
						{item.comment && <div className="ml-5 d-flex align-items-center">
							<i className="icon far fa-comment"/>
							<span className="text-comment">{item.comment}</span>
						</div>}
					</div>
					{this.renderDonatesTable(item, false)}
				</Card.Body>
			</Accordion.Collapse>
		</Card>
	}

	renderDonatesTable(item, isOpenedPayout) {
		const {donates} = item;
		const isDonatello = this.props.payoutSystem === PaymentSystem.donatello.name;

		return <div>
			{donates && donates.length > 0 && <table className="table table-hover table-responsive-md">
				<thead>
				<tr>
					<th scope="col">№</th>
					<th scope="col" className="text-left">Дата</th>
					<th scope="col" className="text-left">Відправник</th>
					<th scope="col" className="text-left">Код</th>
					<th scope="col" className="text-right">Донат</th>
					<th scope="col" className="text-right" title="Комісія платіжної системи">Комісія</th>
					<th scope="col" className="text-right" title="Послуги сервісу">Послуги</th>
					{isDonatello && <th scope="col" className="text-right" title="Послуги сервісу">ПДФО+ВЗ</th>}
					<th scope="col" className="text-right">Сума</th>
				</tr>
				</thead>
				<tbody>
				{item.donates && donates.map((donate, i) => this.renderDonateRow(donate, i, isOpenedPayout))}
                {this.renderTotalRow(item)}
                </tbody>
            </table>}
        </div>;
    }

    isSelectedDonate = (pubOrderId) => {
        const {payoutSlider, selectedPayoutAmount} = this.state;
        const donate = payoutSlider && selectedPayoutAmount ? payoutSlider[selectedPayoutAmount] : {};

        return donate && donate.pubOrderId === pubOrderId;
    }

    renderDonateRow(donate, i, isOpenedPayout) {
		const isDonatello = this.props.payoutSystem === PaymentSystem.donatello.name;

        return <tr id={donate.pubOrderId} key={donate.pubOrderId || (donate.createdAt + i)}
				   className={isOpenedPayout && this.isSelectedDonate(donate.pubOrderId) ? 'selected' : ''}>
			<th scope="row">{i + 1}</th>
			<td className="text-left">{moment(donate.createdAt).format('L')}, {moment(donate.createdAt).format('LT')}</td>
			<td className="text-left">{donate.clientName}</td>
			<td className="text-left text-muted">
				<span className="" title={PaymentSystem[donate.source].title}>{donate.pubOrderId}</span>
			</td>
			<td className="text-right">
				{isForeignCurrency(donate.originalCurrency) &&
					<span className="original-amount text-muted">
                        <span
							className="currency prefix">{helpers.getCurrencySign(donate.originalCurrency)}</span>{donate.originalAmount}
                    </span>}
				{donate.amount}
			</td>
			<td className="text-right text-muted">{donate.transactionFee}</td>
			<td className="text-right text-muted">{donate.serviceFee}</td>
			{isDonatello && <td className="text-right text-muted">{donate.taxFee}</td>}
			<td className="text-right">{donate.payoutAmount}</td>
		</tr>
	}

	renderTotalRow(item) {
		const isDonatello = this.props.payoutSystem === PaymentSystem.donatello.name;

		return <tr className="total-row">
			<th scope="row"></th>
			<td colSpan="2"></td>
			<td className="text-left">Разом</td>
			<td className="text-right">{item.totalDonatesAmount}</td>
			<td className="text-right">{item.totalTransactionFee}</td>
			<td className="text-right">{item.totalServiceFee}</td>
			{isDonatello && <td className="text-right">{item.totalTaxFee}</td>}
			<td className="text-right">{item.totalPayoutAmount}</td>
		</tr>
	}

	render() {
		return (
			<Accordion>
				{this.props.payouts?.length && this.props.payouts.map((item, i) => this.renderCard(item, i))}
			</Accordion>
		)
	}
}

export default PayoutItems;
