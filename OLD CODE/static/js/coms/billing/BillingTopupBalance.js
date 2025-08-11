import React, {useState} from 'react';
import {BillingMaxCreditAmount, BillType} from '../../enums/BillingEnums';
import {PaymentSystem} from '../../enums/PaymentEnums';
import {messageService} from '../../services/messageService';
import {BuildFormAndSubmit} from './BillingCardButton';


const BillingTopupUrl = `/panel-api/billing/topup`;

const HandleBillingTopup = (amount, saveCard) => {

	fetch(BillingTopupUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			type: BillType.topup,
			amount: amount || `100`,
			saveCard: saveCard || false
		})
	})
		.then((response) => response.json())
		.then((resp) => {
			if (!resp.success) {
				console.error(`Billing topup failed. ${resp.message}`);
				messageService.error(resp.message || 'Ой! Щось пішло не так');
				return;
			}

			const system = resp.options?.system || PaymentSystem.wfpb.system;

			if ([PaymentSystem.wfpb.system].includes(system)) {
				BuildFormAndSubmit(resp.data);
			} else {
				console.error('Billing topup failed. Unknown payment system');
				messageService.error('Невірні налаштування');
			}
		})
		.catch((error) => {
			console.error('Error:', error);
			messageService.error('Ой! Щось пішло не так');
		});
};

const BillingTopupBalance = ({balance, onCloseModal}) => {
	const defaultAmount = balance < 0 ? (balance * -1) : BillingMaxCreditAmount;
	const amountForBalance50 = defaultAmount + BillingMaxCreditAmount;
	const amountForBalance100 = defaultAmount + 100;
	const amountForBalance500 = defaultAmount + 500;
	const [selectedAmount, setSelectedAmount] = useState(defaultAmount);
	const [saveCard, setSaveCard] = useState(true);

	return <div className="panel panel-modal">
		<div className="d-flex justify-content-between align-items-center">
			<div className="d-flex align-items-center flex-column card balance-card mr-2">
				<div className="light-gray-50">Поточний баланс</div>
				<div className="balance-count"><span>{balance} <span className="currency">₴</span></span></div>
			</div>
			<div className="d-flex align-items-center flex-column card balance-card ml-2">
				<div className="light-gray-50">Після оплати</div>
				<div className="balance-count"><span>{balance + selectedAmount} <span
					className="currency">₴</span></span></div>
			</div>
		</div>

		<div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
			<button
				className={`btn rounded-pill btn-amount mt-3 ${selectedAmount === defaultAmount ? 'btn-primary' : 'btn-outline-primary'}`}
				onClick={() => setSelectedAmount(defaultAmount)}
			>
				{defaultAmount} <span className="currency">₴</span>
			</button>
			<button
				className={`btn rounded-pill btn-amount mt-3 ${selectedAmount === amountForBalance50 ? 'btn-primary' : 'btn-outline-primary'}`}
				onClick={() => setSelectedAmount(amountForBalance50)}
			>
				{amountForBalance50} <span className="currency">₴</span>
			</button>
			<button
				className={`btn rounded-pill btn-amount mt-3 ${selectedAmount === amountForBalance100 ? 'btn-primary' : 'btn-outline-primary'}`}
				onClick={() => setSelectedAmount(amountForBalance100)}
			>
				{amountForBalance100} <span className="currency">₴</span>
			</button>
			<button
				className={`btn rounded-pill btn-amount mt-3 ${selectedAmount === amountForBalance500 ? 'btn-primary' : 'btn-outline-primary'}`}
				onClick={() => setSelectedAmount(amountForBalance500)}
			>
				{amountForBalance500} <span className="currency">₴</span>
			</button>
		</div>

		<div className="form-check text-muted ml-3 mt-4">
			<input
				type="checkbox"
				className="form-check-input mr-2"
				id="addBillingCard"
				checked={saveCard}
				onChange={(e) => setSaveCard(e.target.checked)}
			/>
			<label className="form-check-label small" htmlFor="addBillingCard">
				Зберегти картку для автоматичних оплат послуг
			</label>
		</div>

		<div className="d-flex flex-column flex-md-row gap-2 justify-content-between mt-4">
			<button className="btn btn-outline-dark" style={{padding: '10px 25px'}}
					onClick={() => onCloseModal()}>
				Скасувати
			</button>

			<button className="btn btn-primary confirm-button mt-3 mt-md-0" style={{padding: '10px 25px'}}
					onClick={() => HandleBillingTopup(selectedAmount, saveCard)}>
				Оплатити
			</button>
		</div>
	</div>;
};

export default BillingTopupBalance;
