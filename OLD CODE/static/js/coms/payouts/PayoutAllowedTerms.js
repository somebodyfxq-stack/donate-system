import 'rc-slider/assets/index.css';
import React from 'react';
import '../../css/payouts.css';
import {Link} from 'react-router-dom';
import {PaymentSystem} from '../../enums/PaymentEnums';


function PayoutAllowedTerms(props) {
	const {system, payoutAllowedTerms} = props;
	const {
		isCardValid, isCardChanged, hasAmount, isDailyLimit, isPreviousPayoutInProgress, nextHours,
		isSignContractRequired
	} = payoutAllowedTerms || {};
	const isCryptoSystem = [PaymentSystem.trustyeu.name, PaymentSystem.whitepay.name].includes(system);

	return <div className="alert alert-warning mt-3 mb-0">
		<i className="fa-solid fa-triangle-exclamation mr-2"/>
		{system === PaymentSystem.cardpay.name && !isCardValid &&
			<span>Заповни <a href="/panel/settings?tab=paymentOptions">дані для виплат</a>. </span>
		}
		{![PaymentSystem.donatello.name, PaymentSystem.cardpay.name].includes(system) && !isCardValid &&
			<span>Вкажи {isCryptoSystem ? `криптогаманець` : `номер картки`}. </span>
		}
		{isCardChanged && <span>Картку для виплат нещодавно змінено. </span>}
		{!hasAmount && <span>Недостатній баланс. </span>}
		{isPreviousPayoutInProgress && <span>Виконується попередня виплата. </span>}
		{isDailyLimit && <span>Ліміт переказів. </span>}
		{isSignContractRequired &&
			<span>Потрібно <Link to="/panel/settings?tab=paymentOptions">підписати договір</Link>. </span>}
		{nextHours > 0 &&
			<span>Наступну виплату дозволено через <strong>{nextHours}</strong> {system === PaymentSystem.fondy.name ? `днів` : `годин`}.</span>
		}
	</div>;
}

export default PayoutAllowedTerms;
