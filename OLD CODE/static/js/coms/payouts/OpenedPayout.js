import 'rc-slider/assets/index.css';
import moment from 'moment';
import React, {Component} from 'react';
import '../../css/payouts.css';
import {isForeignCurrency, PaymentSystem} from '../../enums/PaymentEnums';

import {GetServiceFeeBySystemId} from '../../enums/PayoutEnums';
import {ContractType} from '../../models/SystemDonatelloModel';
import helpers from '../../utils/helpers';

class OpenedPayout extends Component {

	isSelectedDonate = (pubOrderId) => {
		const {payoutSlider, selectedPayoutAmount} = this.props;
		const donate = payoutSlider && selectedPayoutAmount ? payoutSlider[selectedPayoutAmount] : {};

		return donate && donate.pubOrderId === pubOrderId;
	}

	hasTaxFee = () => {
		return this.props.payoutSystem === PaymentSystem.donatello.name && this.props.statusOrType === ContractType.individual;
	}

    renderDonateRow(donate, i) {
        const {payoutSystem, status, hasAmount, onCheckboxChange, showCheckbox} = this.props;

        return <tr id={donate.pubOrderId} key={donate.pubOrderId || (donate.createdAt + i)}
                   className={this.isSelectedDonate(donate.pubOrderId) ? 'selected' : ''}>
			{showCheckbox && hasAmount && <th scope="row" className='opened-payuot-checkbox'>
				<input
					type="checkbox"
					id={donate.pubOrderId}
					value={donate.payoutAmount}
					disabled={!hasAmount}
					onChange={onCheckboxChange}
				/>
			</th>}
            <th scope="row">{i + 1}</th>
            <td className="text-left">{moment(donate.createdAt).format('L')}, {moment(donate.createdAt).format('LT')}</td>
            <td className="text-left">{donate.clientName}</td>
            <td className="text-left text-muted">
                <span className="" title={PaymentSystem[donate.source].title}>{donate.pubOrderId}</span>
            </td>
            <td className="text-right">
                {isForeignCurrency(donate.originalCurrency) && payoutSystem !== PaymentSystem.whitepay.name &&
                    <span className="original-amount text-muted">
                        <span className="currency prefix">{helpers.getCurrencySign(donate.originalCurrency)}</span>{donate.originalAmount}
                    </span>}
                {donate.amount}
            </td>
            <td className="text-right text-muted">{donate.transactionFee}</td>
            <td className="text-right text-muted">
                {donate.serviceFee}
				{payoutSystem === PaymentSystem.fondy.name && <span className="service-fee-muted">{GetServiceFeeBySystemId(donate?.systemId, status, donate?.isNoServiceFee)}%</span>}
            </td>
			{this.hasTaxFee() && <td className="text-right text-muted">{donate.taxFee}</td>}
            <td className="text-right">{donate.payoutAmount}</td>
        </tr>;
    }

    renderTotalRow(item) {
		const { hasAmount, showCheckbox } = this.props;

        return <tr className="total-row">
			{showCheckbox && hasAmount && <th scope="row"></th>}
            <th scope="row"></th>
            <td colSpan="2"></td>
			<td className="text-left">Разом</td>
            <td className="text-right">{item.totalDonatesAmount}</td>
            <td className="text-right">{item.totalTransactionFee}</td>
            <td className="text-right">{item.totalServiceFee}</td>
			{this.hasTaxFee() && <td className="text-right">{item.totalTaxFee}</td>}
			<td className="text-right">{item.totalPayoutAmount}</td>
        </tr>;
    }

	render() {
		const { openedPayout, hasAmount, showCheckbox } = this.props;

		return <div>
			{openedPayout?.donates?.length > 0 && <table className="table table-hover table-responsive-md">
				<thead>
				<tr>
					{showCheckbox && hasAmount && <th scope="col"></th>}
					<th scope="col">№</th>
					<th scope="col" className="text-left date">Дата</th>
					<th scope="col" className="text-left client-name">Відправник</th>
					<th scope="col" className="text-left pub-order-id">Код</th>
					<th scope="col" className="text-right">Донат</th>
					<th scope="col" className="text-right" title="Комісія платіжної системи">Комісія</th>
					<th scope="col" className="text-right" title="Послуги сервісу">Послуги</th>
					{this.hasTaxFee() && <th scope="col" className="text-right" title="ПДФО+ВЗ">ПДФО+ВЗ</th>}
					<th scope="col" className="text-right">Сума</th>
				</tr>
				</thead>
				<tbody>
				{openedPayout.donates && openedPayout?.donates?.map((donate, i) => this.renderDonateRow(donate, i))}
				{this.renderTotalRow(openedPayout)}
				</tbody>
			</table>}
		</div>;
	}
}

export default OpenedPayout;
