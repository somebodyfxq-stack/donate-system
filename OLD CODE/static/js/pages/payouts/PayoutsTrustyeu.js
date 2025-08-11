import Slider, {createSliderWithTooltip} from 'rc-slider';
import 'rc-slider/assets/index.css';
import React, {Component} from 'react';
import {ConfettiCanvas} from 'react-raining-confetti';
import {connect} from 'react-redux';
import DisclaimerCryptoWalletNotes from '../../coms/disclaimer/DisclaimerCryptoWalletNotes';
import '../../css/payouts.css';
import DisclaimerPayoutOnHold from '../../coms/disclaimer/DisclaimerPayoutOnHold';
import DisclaimerUserPending from '../../coms/disclaimer/DisclaimerUserPending';
import NoDataContainer from '../../coms/misc/NoDataContainer';
import Spinner from '../../coms/misc/Spinner';
import OpenedPayout from '../../coms/payouts/OpenedPayout';
import PayoutBalance from '../../coms/payouts/PayoutBalance';
import PayoutItems from '../../coms/payouts/PayoutItems';
import {CurrencyDisplay, PaymentSystem} from '../../enums/PaymentEnums';
import {DefaultPayoutStatus, PayoutStatus} from '../../enums/PayoutEnums';
import {UserStatus} from '../../enums/UserStatus';
import {api} from '../../services/api';
import {currencyToNumber, formatCurrency, formatNumber, formatPercent} from '../../utils/utils';


const TrustyeuPayoutTerms = [
	{title: 'Розрахунок', description: 'Конвертація з EUR в USDT за курсом криптобіржі'},
	{title: 'Гаманець', description: 'Створений у мережі TRC20, повинен приймати USDT'},
	{title: 'Ліміт', description: 'Одна виплата на день'},
	{title: 'Термін', description: '1-2 робочих дні'},
	{title: `Зв'язок`, description: 'У разі труднощів ми сконтактуємо з тобою через ел. пошту'}
];

const TrustyeuPayoutFees = [
	{title: 'Комісія мережі', description: `1 USDT`},
	{title: 'Комісія п.с.', description: formatPercent(PaymentSystem.trustyeu.transactionFee)},
	{title: 'Послуги сервісу', description: formatPercent(PaymentSystem.trustyeu.serviceFee)}
];

const SliderWithTooltip = createSliderWithTooltip(Slider);

class PayoutsTrustyeu extends Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			editCard: false,
			prevCard: '',
			currentAccordionCard: 'payout-terms',
			hasRequestedPayout: false,
			showPayoutStatusModal: false,
			payoutSlider: {},
			payoutMin: null,
			payoutMax: null,
			selectedPayoutAmount: null,

			// Fetched data
			card: '',
			cardMask: '',
			fullName: '',
			ipn: '',
			isCardValid: true,
			isNoServiceFee: false,
			payoutAllowedTerms: {
				isPayoutAllowed: true,
				isCardValid: true,
				isDailyLimit: false,
				isPreviousPayoutInProgress: false,
				walletType: 'tron',
				nextHours: null
			},
			openedPayout: {
				totalPayoutAmount: '',
				totalPayoutAmountNumber: 0,
				donates: [],
				systemId: ''
			},
			lastPayout: null
		};
	}

	componentDidMount() {
		this.fetchData();
	}

	fetchData() {
		this.setState({loading: true}, () => {
			api.getPayouts({system: PaymentSystem.trustyeu.name}).then(data => {
				if (data) {
					const prevCard = data.card;
					this.setState({loading: false, prevCard, ...data});
					this.buildPayoutSlider(data.openedPayout?.donates);

					if (data.lastPayout?.status === PayoutStatus.hold.type) {
						this.setState({showPayoutStatusModal: true});
					}
				}
			});
		});
	}

	buildPayoutSlider = (payoutDonates) => {
		if (!payoutDonates.length) {
			return;
		}

		let donates = [...payoutDonates].reverse();

		const minAmount = PaymentSystem.trustyeu.payoutMinAmount;
		const maxAmount = PaymentSystem.trustyeu.payoutMaxAmount;
		const payoutSlider = {};
		let payoutAmount = 0;

		for (const donate of donates) {
			const amount = payoutAmount + currencyToNumber(donate.payoutAmount);

			if (amount < minAmount) { // skip donates less than minimal amount
				payoutAmount = amount; // still sum total payout amount
				continue;
			}

			if (amount > maxAmount) { // skip donates greater than maximal amount
				break;
			}

			payoutAmount = amount;
			const payoutAmountInt = Math.floor(payoutAmount - PaymentSystem.trustyeu.networkFee); // subtract network fee
			payoutSlider[payoutAmountInt] = {payoutAmount: payoutAmountInt, pubOrderId: donate.pubOrderId};
		}

		const first = Object.keys(payoutSlider).map(v => Number(v)).sort((a, b) => a - b)[0];
		const payoutMin = payoutSlider[first] ? payoutSlider[first].payoutAmount : null;
		const payoutMax = Math.floor(payoutAmount - PaymentSystem.trustyeu.networkFee); // subtract network fee
		const selectedPayoutAmount = payoutMax;

		this.setState({payoutSlider, payoutMin, payoutMax, selectedPayoutAmount});
	};

	onPayoutSliderChange = (selectedPayoutAmount) => {
		this.setState({selectedPayoutAmount});
	};

	onCardChange = (e) => {
		this.setState({card: e.target.value});
	};

	onEditCard = () => {
		const {editCard} = this.state;

		this.setState({editCard: !editCard}, () => {
			const {card, prevCard, editCard} = this.state;

			if (editCard) {
				this.cardInput.focus();
			}

			if (!editCard && card !== prevCard) {
				api.updateSettings({wallet: card}).then((resp) => { // Save wallet
					if (resp.success) {
						this.fetchData();
					} else {
						this.setState({card: prevCard});
					}

					// if (resp.success && isUserVerifiedStatus(status)) {
					//     messageService.success('Ви можете достроково підтвердити криптогаманець через імейл');
					// }
				});
			} else {
				this.setState({card: prevCard}); // Cancel: revert previous saved wallet
			}
		});
	};

	toggleAccordionCard = (card) => {
		let {currentAccordionCard} = this.state;

		currentAccordionCard = currentAccordionCard === card ? currentAccordionCard + '-same-card' : card;

		this.setState({currentAccordionCard});
	};

	getStatusTitle(st) {
		const status = PayoutStatus[st] ? PayoutStatus[st] : DefaultPayoutStatus;

		return status.title;
	}

	requestPayout = () => {
		const {card, payoutAllowedTerms} = this.state;

		if (!payoutAllowedTerms?.isPayoutAllowed || !card) {
			console.log(`Skip request payout - isPayoutAllowed: ${payoutAllowedTerms.isPayoutAllowed}, card: ${card}`);
			return;
		}

		const {payoutSlider, selectedPayoutAmount} = this.state;
		const donate = payoutSlider[selectedPayoutAmount];

		if (!donate) {
			return;
		}

		const params = {pubOrderId: donate.pubOrderId, system: PaymentSystem.trustyeu.name};

		this.setState({loading: true, isPayoutAllowed: false}, () => {
			api.requestPayout(params).then(() => {
				this.setState({hasRequestedPayout: true});
				this.fetchData();
			});
		});
	};

	renderRunPayout() {
		const {openedPayout, card, payoutSlider, payoutMin, payoutMax, selectedPayoutAmount} = this.state;
		const isPayoutAllowed = this.state.payoutAllowedTerms?.isPayoutAllowed === true;

		return <div className="run-payout">
			{isPayoutAllowed && card && (
				<div className="d-flex">
					<span className="light-gray-50 mr-2">Сума:</span>
					<span>{formatCurrency(selectedPayoutAmount)} {CurrencyDisplay.USDT.sign}</span>
				</div>
			)}

			<div className="d-flex flex-column flex-md-row align-items-center justify-content-between">
				<div className="w-100">
					{payoutMin && openedPayout?.donates?.length > 0 &&
						<SliderWithTooltip
							className="my-3 my-md-0"
							min={payoutMin}
							max={payoutMax}
							defaultValue={selectedPayoutAmount}
							marks={payoutSlider}
							step={null}
							onChange={this.onPayoutSliderChange}
							tipFormatter={(value) => `${value.toLocaleString('uk-UA')} $T`}
							tipProps={{placement: 'bottom', overlayClassName: 'rc-slider-custom-tooltip'}}
						/>
					}
				</div>

				<button className="btn btn-primary ml-md-3"
						disabled={!isPayoutAllowed || !card}
						onClick={() => this.requestPayout()}>
					Виконати
				</button>
			</div>
		</div>;
	}

	renderOpenedPayout() {
		const {status} = this.props;
		const {loading, openedPayout, payoutSlider, selectedPayoutAmount, payoutAllowedTerms} = this.state;
		const payoutMinAmount = PaymentSystem.trustyeu.payoutMinAmount;

		return <div className="section-wrapper">
			{loading && <Spinner/>}

			{!loading && <>
				{openedPayout?.donates?.length === 0 &&
					<NoDataContainer title="У тебе ще немає нових донатів"
									 icon="fa-regular fa-heart"/>
				}

				{openedPayout?.donates?.length > 0 && <div>
					<h5 className="mb-4">Заявка на виплату</h5>

					{payoutAllowedTerms?.hasAmount &&
						<div className="text-disclaimer mb-3">
							<strong>Зі слайдером</strong> виплачуй усю суму або розділи її на частини і
							переводь на різні гаманці. Одна виплата на добу.
						</div>
					}

					{!payoutAllowedTerms?.hasAmount &&
						<div className="text-disclaimer mb-3">
							Ти зможеш подати заявку на виплату, коли на рахунку буде
							від {formatNumber(payoutMinAmount)} {CurrencyDisplay.USDT.sign}.
						</div>
					}

					{this.renderRunPayout()}

					<OpenedPayout
						payoutSystem={PaymentSystem.trustyeu.name}
						openedPayout={openedPayout}
						status={status}
						payoutSlider={payoutSlider}
						selectedPayoutAmount={selectedPayoutAmount}
					/>
				</div>}
			</>}
		</div>;
	}

	renderDetails() {
		const {loading, openedPayout, editCard, card, payoutsHistory, payoutAllowedTerms} = this.state;
		const lastPayout = payoutsHistory?.payouts[0] || {};

		return <div className="row">
			<div className="col-12 col-md-5">
				{<PayoutBalance
					system={PaymentSystem.trustyeu.name}
					loading={loading}
					terms={TrustyeuPayoutTerms}
					fees={TrustyeuPayoutFees}
					totalPayoutAmount={openedPayout.totalPayoutAmount}
					payoutMinAmount={PaymentSystem.trustyeu.payoutMinAmount}
					payoutMaxAmount={PaymentSystem.trustyeu.payoutMaxAmount}
					payoutAllowedTerms={payoutAllowedTerms}
				/>}
			</div>

			<div className="col-12 col-md-7">
				<div className="section-wrapper section-wrapper-top">
					<div className="d-flex flex-column flex-md-row">
						<div className="mr-2 mb-2 mb-md-0">
							<div className="light-gray-50">
								Мережа
							</div>
							<div className="card-info justify-content-start justify-content-md-center">
								<div className="input-group" style={{maxWidth: '102px'}}>
									<div className="input-group-prepend">
										<span className="input-group-text pr-0">
											<i className="icon fas fa-share-nodes" style={{fontSize: '14px'}}/>
										</span>
									</div>
									<input id="network" className="form-control pl-0" type="text"
										   disabled="disabled" value="TRC20"
										   style={{fontFamily: 'monospace', fontSize: '13px'}}/>
								</div>
							</div>
						</div>
						<div className="w-100">
							<div className="light-gray-50">
								Криптогаманець
							</div>
							<div className="card-info">
								<div className="input-group" onDoubleClick={this.onEditCard}>
									<div className="input-group-prepend">
										<span className="input-group-text">
											<i className="fa-solid fa-wallet"
											   style={{fontSize: '14px'}}/>
										</span>
									</div>
									<input id="wallet" className="form-control wallet pl-1" type="text" required
										   style={{fontFamily: 'monospace', fontSize: '13px'}}
										   ref={inputEl => (this.cardInput = inputEl)}
										   disabled={!editCard}
										   value={card}
										   onChange={this.onCardChange}
										   onBlur={this.onEditCard}
										   onKeyDown={(e) => {
											   if (e.key === 'Enter') {
												   this.onEditCard();
											   }

											   if (e.key === 'Escape') {
												   this.onEditCard();
											   }
										   }}
									/>
								</div>

								{editCard &&
									<i className={'control-icon fas fa-check-circle'}
									   data-toggle="tooltip" data-placement="top"
									   title={'Зберегти'}
									   onClick={this.onEditCard}/>}
								{!editCard &&
									<i className={'control-icon icon-primary fas fa-edit'}
									   data-toggle="tooltip" data-placement="top"
									   title={'Редагувати'}
									   onClick={this.onEditCard}/>}
							</div>
						</div>
					</div>


					{lastPayout.status === PayoutStatus.canceled.type &&
						lastPayout.comment === 'Технічна помилка транзакції' &&
						<div id="cardHelp" className="d-flex flex-column alert alert-warning mt-3 mb-0">
							<div>
								Останню виплату скасовано через технічну помилку. Повторіть виплату пізніше.
							</div>
						</div>}

					{editCard && <div id="cardHelp" className="d-flex flex-column alert alert-warning mt-3 mb-0">
						<div className="text-alert mt-1" style={{fontWeight: '400'}}>
							Переконайся, що гаманець належить до мережі <strong>TRC20</strong>
						</div>
					</div>}

					<DisclaimerCryptoWalletNotes/>
				</div>
			</div>
		</div>;
	}

	render() {
		const {status} = this.props;
		const {lastPayout, hasRequestedPayout, showPayoutStatusModal, currentAccordionCard} = this.state;
		const isUserPending = status === UserStatus.pending;

		return <div>
			{isUserPending && <DisclaimerUserPending/>}

			<DisclaimerPayoutOnHold show={showPayoutStatusModal}/>

			<div className="payouts payouts-whitepay">
				{!isUserPending && <section className="new-payout" style={{marginTop: '0px'}}>
					{this.renderDetails()}
					{this.renderOpenedPayout()}
				</section>}

				{lastPayout && <div className="section-wrapper">
					<h5 className="mb-4">Остання виплата</h5>

					<PayoutItems payoutSystem={PaymentSystem.trustyeu.name}
								 payouts={[lastPayout]}
								 currentAccordionCard={currentAccordionCard}
								 toggleAccordionCard={this.toggleAccordionCard}
					/>
				</div>}
			</div>

			{hasRequestedPayout === true && <ConfettiCanvas active={true} fadingMode="LIGHT" stopAfterMs={5000}/>}
		</div>;
	}
}

function mapStateToProps(state) {
	const {system, serviceFee, status} = state.config;

	return {system, serviceFee, status};
}

export default connect(mapStateToProps)(PayoutsTrustyeu);
