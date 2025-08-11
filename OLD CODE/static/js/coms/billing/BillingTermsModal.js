import moment from 'moment';
import React, {useState} from 'react';
import {connect} from 'react-redux';
import {BillingPlans, BillingPlansDisplay, BillingTerms, DefaultBillingPlan} from '../../enums/BillingEnums';
import {api} from '../../services/api';
import {messageService} from '../../services/messageService';
import {BillingCardAction, ManageBillingCard} from './BillingCardButton';


const BillingTermsModal = ({billing, onCloseModal}) => {
	const [plan, setPlan] = useState(DefaultBillingPlan);
	const [isBillingOfferAccepted, setBillingOfferAccepted] = useState(true);
	const [isAddBillingCard, setAddBillingCard] = useState(true);

	const choosePlan = (selectedPlan) => {
		if (isBillingOfferAccepted) {
			messageService.error(`Тариф уже вибрано`);
			return;
		}
		setPlan(selectedPlan);
	}

	const saveAction = async (action) => {
		if (action === BillingTerms.cancel) {
			onCloseModal();
			return;
		}

		await api.saveBillingTerms({action, plan}).then((resp) => {
			if (!resp.success) {
				messageService.error(resp.message);
				return;
			}

			onCloseModal();

			if (action === BillingTerms.accept && isAddBillingCard) {
				messageService.success(`Приєднуємо картку...`);

				setTimeout(() => {
					ManageBillingCard(BillingCardAction.add, () => {}, () => {});
				}, 2000);
			}
		}).catch((err) => {
			console.log(err.message);
			onCloseModal();
		});
	};

	return <div className="panel panel-modal">
		<h3 className="mb-4">Платні повідомлення</h3>
		<p className="mt-2">
			<strong>Повідомлення про донати</strong> з платіжних інтеграцій (Банка, Конверт, Манібокс, вхідне API)
			стали платними. Усі кошти спрямовуються на стабільну роботу та розвиток платформи.
		</p>
		<p>
			Враховуються усі повідомлення. Тому створи окрему банку/конверт для інтеграції з Донателло.
			Сума, отримана при приєднанні картки, додається на баланс.
		</p>
		<p>
			<strong>Відповідальність</strong> за призначення платежів та сплату податків несе <strong>автор,
			який отримує кошти</strong>. Донателло не є стороною у фінансових переказах, не бере участі у зборах і
			не володіє інформацією про їх цільове призначення.
		</p>
		<p>
			<strong>Платформа не надає підтверджуючих документів</strong> щодо отриманих коштів або їх походження,
			оскільки не є платіжною стороною та не здійснює обробку переказів.
		</p>
		<p>
			<strong>Проводиш збори на ЗСУ</strong>? Напиши нам і ми скасуємо рахунки за платні повідомлення.
		</p>

		<div className="gap-4 mt-3 mb-3">
			<div
				className={`card payment-item p-3 mr-2 ${plan === BillingPlans.fixed ? 'border-primary' : ''}`}
				style={{cursor: 'pointer', flex: 1, width: '50%'}}
				onClick={() => choosePlan(BillingPlans.fixed)}
			>
				<h5 className="card-title">{BillingPlansDisplay.fixed.title}</h5>
				<p className="card-text"><strong>3 ₴</strong> за повідомлення</p>
			</div>
		</div>

		<div className="form-check mt-4 text-muted">
			<input
				type="checkbox"
				className="form-check-input mr-2"
				id="acceptBillingOffer"
				checked={isBillingOfferAccepted}
				onChange={(e) => setBillingOfferAccepted(e.target.checked)}
			/>
			<label className="form-check-label" htmlFor="acceptBillingOffer">
				Приймаю <a href="/terms/offer-plan" target="_blank">Публічну оферту (платні повідомлення)</a>
			</label>
		</div>

		<div className="form-check mt-2 text-muted">
			<input
				type="checkbox"
				className="form-check-input mr-2"
				id="addBillingCard"
				checked={isAddBillingCard}
				onChange={(e) => setAddBillingCard(e.target.checked)}
			/>
			<label className="form-check-label" htmlFor="addBillingCard">
				Приєдную картку для автоматичних оплат послуг
			</label>
		</div>

		{billing?.billingAcceptedAt && billing?.billingTerms !== BillingTerms.reject && <p className="text-muted mt-3">
			<em>Ти прийняв умови {moment(billing?.billingAcceptedAt).format('DD.MM.YYYY')}</em>.
		</p>}

		<div className="d-flex flex-column flex-md-row gap-2 justify-content-between mt-5">
			<button className="btn btn-outline-dark" style={{padding: '10px 25px'}}
					onClick={() => saveAction(BillingTerms.cancel)}>
				Скасувати
			</button>
			<button className="btn btn-outline-dark mt-3 mt-md-0 ml-md-auto mr-md-3" style={{padding: '10px 25px'}}
					disabled={billing?.billingAcceptedAt}
					onClick={() => saveAction(BillingTerms.reject)}>
				Не погоджуюся
			</button>
			<button className="btn btn-primary confirm-button mt-3 mt-md-0" style={{padding: '10px 25px'}}
					disabled={billing?.billingAcceptedAt && billing?.billingTerms === BillingTerms.accept}
					onClick={() => {
						if (plan === BillingPlans.flex) {
							messageService.error('Гнучкий тариф недоступний');
							return;
						}
						return saveAction(BillingTerms.accept);
					}}>
				Погоджуюся
			</button>
		</div>
	</div>;
};

function mapStateToProps(state) {
	return {
		billing: state.config?.billing
	};
}

export default connect(mapStateToProps)(BillingTermsModal);
