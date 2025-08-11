import 'rc-slider/assets/index.css';
import React from 'react';
import '../../css/payouts.css';
import Spinner from '../../coms/misc/Spinner';
import PayoutTerms from '../../coms/payouts/PayoutTerms';
import {CurrencyDisplay, PaymentSystem} from '../../enums/PaymentEnums';
import {formatNumber} from '../../utils/utils';
import PayoutAllowedTerms from './PayoutAllowedTerms';

function PayoutBalance(props) {
	const {
		loading, system, terms, fees, feesArgs, totalPayoutAmount, payoutMinAmount, payoutMaxAmount, payoutAllowedTerms
	} = props;

	const isCryptoSystem = [PaymentSystem.trustyeu.name, PaymentSystem.whitepay.name].includes(system);
	const currency = isCryptoSystem ? CurrencyDisplay.USDT.sign : CurrencyDisplay.UAH.sign;

	return <div className="section-wrapper section-wrapper-top">
		<div className="d-flex justify-content-between">
			<span className="light-gray-50">Баланс</span>
			<PayoutTerms terms={terms} fees={fees} feesArgs={feesArgs}/>
		</div>

		{loading && <Spinner/>}

		{!loading && <>
			<div className="balance-count">
				{totalPayoutAmount && <span>{totalPayoutAmount} <span className="currency">
					{isCryptoSystem ? CurrencyDisplay.USDT.label : CurrencyDisplay.UAH.sign}
				</span></span>}
			</div>
			<div className="light-gray-50">
				Виплата доступна від {formatNumber(payoutMinAmount)} {currency} до {formatNumber(payoutMaxAmount)} {currency}
			</div>
			{!loading && !payoutAllowedTerms?.isPayoutAllowed &&
				<PayoutAllowedTerms system={system} payoutAllowedTerms={payoutAllowedTerms}/>
			}
		</>}
	</div>;
}

export default PayoutBalance;
