import React, {useState} from 'react';
import {BillType} from '../../enums/BillingEnums';
import {PaymentSystem} from '../../enums/PaymentEnums';
import {messageService} from '../../services/messageService';


export const BillingCardAction = {add: 'add', delete: 'delete'};

export const BillingCardUrl = `/panel-api/billing/card`;

export const BuildFormAndSubmit = (params) => {
	const form = document.createElement('form');
	form.id = `billing-card-form`;
	form.method = 'POST';
	form.action = params.action || '';
	form.style.display = 'none';

	Object.keys(params.data || {}).forEach((key) => {
		const input = document.createElement('input');
		input.type = 'hidden';
		input.name = key;
		input.value = params.data[key];
		form.appendChild(input);
	});

	document.body.appendChild(form);
	form.submit();
	document.body.removeChild(form);
};

export const ManageBillingCard = (action, onBillingCardUpdate, setLoading) => {
	setLoading(true);

	if (action === 'delete') {
		fetch(BillingCardUrl, {
			method: 'DELETE'
		})
			.then((response) => response.json())
			.then((resp) => {
				setLoading(false);

				if (!resp.success) {
					console.error(`Delete billing card failed. ${resp.message}`);
					messageService.error(resp.message || 'Ой! Щось пішло не так');
					return;
				}

				messageService.success(resp.message || `Картку від'єднано`);
				onBillingCardUpdate(action);
			})
			.catch((error) => {
				setLoading(false);
				console.error('Error:', error);
				messageService.error('Ой! Щось пішло не так');
			});

		return;
	}

	if (action === 'add') {
		fetch(BillingCardUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				type: BillType.card
			})
		})
			.then((response) => response.json())
			.then((resp) => {
				setLoading(false);

				if (!resp.success) {
					console.error(`Add billing card failed. ${resp.message}`);
					messageService.error(resp.message || 'Ой! Щось пішло не так');
					return;
				}

				const system = resp.options?.system || PaymentSystem.wfpb.system;

				if ([PaymentSystem.wfpb.system].includes(system)) {
					BuildFormAndSubmit(resp.data);
				} else {
					console.error('Add billing card failed. Unknown payment system');
					messageService.error('Невірні налаштування');
				}
			})
			.catch((error) => {
				setLoading(false);
				console.error('Error:', error);
				messageService.error('Ой! Щось пішло не так');
			});

		return;
	}

	console.log(`Unknown action: ${action}`);
};

const BillingCardButton = ({hasBillingCard, enabled, onBillingCardUpdate}) => {
	const [loading, setLoading] = useState(false);

	return <div>
		<button className="btn btn-outline-dark btn-sm btn-action mr-3"
				title={hasBillingCard ? `Від'єднати картку можна після відключення способу оплати` : `Приєднати картку для оплати послуг`}
				disabled={loading || (hasBillingCard && enabled)}
				onClick={() => {
					const action = hasBillingCard ? BillingCardAction.delete: BillingCardAction.add;
					ManageBillingCard(action, onBillingCardUpdate, setLoading);
				}}>
			{(hasBillingCard ? `Від'єднати` : `Приєднати`) + ` картку для оплати послуг`}
		</button>
	</div>;
};

export default BillingCardButton;
