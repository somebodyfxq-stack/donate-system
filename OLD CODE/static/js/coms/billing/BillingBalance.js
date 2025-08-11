import 'rc-slider/assets/index.css';
import React, {useState} from 'react';
import '../../css/payouts.css';
import ReactModal from 'react-modal';
import {connect} from 'react-redux';
import {AppModalStyles} from '../../app/App';
import Spinner from '../../coms/misc/Spinner';
import {BillingMaxCreditAmount} from '../../enums/BillingEnums';
import {CurrencyDisplay} from '../../enums/PaymentEnums';
import {api} from '../../services/api';
import {currencyToNumber} from '../../utils/utils';
import {BillingCardAction, ManageBillingCard} from './BillingCardButton';
import BillingTermsModal from './BillingTermsModal';
import BillingTopupBalance from './BillingTopupBalance';


function BillingBalance(props) {
	const {loading, balance, billing, hasBillingCard, onUpdate} = props;
	const [showBillingTerms, setShowBillingTerms] = useState(false);
	const [showTopupBalance, setShowTopupBalance] = useState(false);
	const [showAddConfirm, setShowAddConfirm] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const addBillingCard = async () => {
		setShowAddConfirm(true);
	};

	const handleAddConfirm = async () => {
		ManageBillingCard(BillingCardAction.add, onUpdate, () => {});
	};

	const deleteBillingCard = async () => {
		setShowDeleteConfirm(true);
	};

	const handleDeleteConfirm = async () => {
		await api.deleteBillingCard();
		setShowDeleteConfirm(false);
		onUpdate();
	};

	const showBalanceAlert = currencyToNumber(balance, true) <= (BillingMaxCreditAmount * -1);

	return <div className="section-wrapper section-wrapper-top">
		<div className="d-flex justify-content-between">
			<span className="light-gray-50">Баланс</span>

			<div className="payment-terms"
				 onClick={() => setShowBillingTerms(true)}>
				<span className="mr-1">Умови</span> <i className="fa-solid fa-info"></i>
			</div>
		</div>

		{loading && <Spinner/>}

		{!loading && <>
			<div className="balance-count mb-3">
				{balance !== 'undefined' && <span>{balance} <span className="currency">{CurrencyDisplay.UAH.sign}</span></span>}
			</div>

			{showBalanceAlert && <div className="alert alert-warning mb-3" style={{fontSize: '0.85rem'}}>
				<i className="fa-solid fa-triangle-exclamation mr-2"/> <span>Потрібно оплатити послуги</span>
			</div>}

			<div className="d-flex justify-content-between" style={{marginTop: (showBalanceAlert ? '0' : '50px')}}>
				<div className="dropdown">
					<button className="btn btn-sm btn-outline-light" style={{minWidth: '45px'}}
							type="button" id="balanceDropdown" data-toggle="dropdown"
							aria-haspopup="true" aria-expanded="false">
						<i className="fa-solid fa-bars"></i>
					</button>
					<div className="dropdown-menu" aria-labelledby="balanceDropdown" style={{padding: '25px', boxShadow: '0 4px 10px 0 rgba(235, 235, 235, 0.80)'}}>
						<div>
							<h3 style={{margin: '0 0 15px 0'}}>Автоматичне поповнення балансу</h3>
							<p className="text-mute mb-3" style={{fontSize: '0.85rem'}}>
								Оплата при балансі менше -{BillingMaxCreditAmount} ₴
							</p>
							<span className={`badge badge-pill mb-4 ` + (hasBillingCard ? `badge-completed` : `badge-cancel`)}>
								{hasBillingCard ? `Активовано` : `Не активовано`}
							</span>
						</div>
						{!hasBillingCard &&
							<button className="btn btn-sm btn-primary pr-3" onClick={addBillingCard}>
								<i className="fas fa-link mr-2"/> Приєднати картку
							</button>
						}
						{hasBillingCard &&
							<button className="btn btn-sm btn-outline-dark pr-3" onClick={deleteBillingCard}>
								<i className="fas fa-link-slash mr-2"></i> Від'єднати картку
							</button>
						}
					</div>
				</div>

				<button className="btn btn-sm btn-primary" style={{padding: '0 20px'}}
						onClick={() => setShowTopupBalance(true)}>
					Поповнити баланс
				</button>
			</div>
		</>
		}

		<ReactModal
			isOpen={showBillingTerms}
			onRequestClose={null}
			style={{
				content: {
					...AppModalStyles.content,
					padding: '40px',
					width: '60%',
					maxWidth: '800px',
					maxHeight: '80vh'
				}
			}}
			contentLabel="Платні повідомлення">
			<BillingTermsModal
				billingPlan={billing?.billingPlan}
				billingAcceptedAt={billing?.billingAcceptedAt}
				onCloseModal={() => setShowBillingTerms(false)}/>
		</ReactModal>

		<ReactModal
			isOpen={showAddConfirm}
			onRequestClose={() => setShowAddConfirm(false)}
			style={{
				content: {
					...AppModalStyles.content,
					padding: '35px',
					maxWidth: '500px',
					maxHeight: '80vh'
				}
			}}
			contentLabel="Підтвердження">
			<div className="text-left">
				<h5>Приєднати картку</h5>
				<p>Бажаєш приєднати картку для автоматичних оплат послуг?</p>
				<div className="d-flex justify-content-between mt-4">
					<button className="btn btn-outline-light mr-2" style={{padding: '5px 20px'}}
							onClick={() => setShowAddConfirm(false)}>
						Скасувати
					</button>
					<button className="btn btn-primary" style={{padding: '5px 20px'}}
							onClick={handleAddConfirm}>
						Приєднати
					</button>
				</div>
			</div>
		</ReactModal>

		<ReactModal
			isOpen={showDeleteConfirm}
			onRequestClose={() => setShowDeleteConfirm(false)}
			style={{
				content: {
					...AppModalStyles.content,
					padding: '35px',
					maxWidth: '500px',
					maxHeight: '80vh'
				}
			}}
			contentLabel="Підтвердження">
			<div className="text-left">
				<h5>Від'єднати картку</h5>
				<p>Бажаєш від'єднати картку і самостійно поповнювати баланс?</p>
				<div className="d-flex justify-content-between mt-4">
					<button className="btn btn-outline-light mr-2" style={{padding: '5px 20px'}}
							onClick={() => setShowDeleteConfirm(false)}>
						Скасувати
					</button>
					<button className="btn btn-primary" style={{padding: '5px 20px'}}
							onClick={handleDeleteConfirm}>
						Від'єднати
					</button>
				</div>
			</div>
		</ReactModal>

		<ReactModal
			isOpen={showTopupBalance}
			onRequestClose={null}
			style={{
				content: {
					...AppModalStyles.content,
					padding: '45px',
					width: '70%',
					maxWidth: '520px',
					maxHeight: '80vh'
				}
			}}
			contentLabel="Поповнити баланс">
			<BillingTopupBalance balance={balance}
								 onCloseModal={() => setShowTopupBalance(false)}/>
		</ReactModal>
	</div>;
}

function mapStateToProps(state) {
	return {
		billing: state.config.billing,
		isNoServiceFee: state.config.isNoServiceFee
	};
}

export default connect(mapStateToProps)(BillingBalance);
