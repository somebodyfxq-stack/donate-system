import 'rc-slider/assets/index.css';
import Slider, {createSliderWithTooltip} from 'rc-slider';
import React, {Component} from 'react';
import {ConfettiCanvas} from 'react-raining-confetti';
import {connect} from 'react-redux';
import DisclaimerPayoutOnHold from '../../coms/disclaimer/DisclaimerPayoutOnHold';
import DisclaimerUserPending from '../../coms/disclaimer/DisclaimerUserPending';
import '../../css/payouts.css';
import NoDataContainer from '../../coms/misc/NoDataContainer';
import Spinner from '../../coms/misc/Spinner';
import OpenedPayout from '../../coms/payouts/OpenedPayout';
import PayoutBalance from '../../coms/payouts/PayoutBalance';
import PayoutItems from '../../coms/payouts/PayoutItems';
import {PaymentSystem} from '../../enums/PaymentEnums';
import {PayoutStatus} from '../../enums/PayoutEnums';
import {UserStatus} from '../../enums/UserStatus';
import {api} from '../../services/api';
import {history} from '../../utils';
import {confirmRemoveModal} from '../../utils/confirmRemoveModal';
import helpers from '../../utils/helpers';
import {currencyToNumber, formatNumber, formatPercent} from '../../utils/utils';


const CardpayPayoutTerms = [
	{title: 'Картка', description: 'Картка фізичної особи у гривні, будь-який банк України'},
	{title: 'Дані', description: `Картку, ім'я та податковий номер одержувача потрібно заповнити у налаштуваннях`},
	{title: 'Ліміт', description: 'Одна виплата на день'},
	{title: 'Термін', description: '1-2 робочих дні'},
	{title: 'Заявки', description: 'Платформа періодично проводить автоматичні виплати, щоб не затримувати кошти на балансі'},
	{title: 'Зв\'язок', description: 'У разі труднощів ми сконтактуємо з тобою через ел. пошту'}
];

const CardpayPayoutFees = [
	{title: 'Комісія п.с.', description: formatPercent(PaymentSystem.cardpay.transactionFee)},
	{title: 'Послуги сервісу', description: formatPercent(PaymentSystem.cardpay.serviceFee)}
];

const SliderWithTooltip = createSliderWithTooltip(Slider);

class PayoutsCardpay extends Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			showCard: false,
			currentAccordionCard: 'payout-terms',
			hasRequestedPayout: false,
			showPayoutStatusModal: false,
			payoutSlider: {},
			payoutMin: null,
			payoutMax: null,
			selectedPayoutAmount: null,
      isModalOpen: false,

			// Fetched data
			card: '',
			cardMask: '',
			fullName: '',
			ipn: '',
			isCardValid: true,
			isNoServiceFee: false,
			payoutAllowedTerms: {
				isPayoutAllowed: true,
				hasAmount: true
			},
			openedPayout: {
				systemId: '',
				totalPayoutAmount: '',
				totalPayoutAmountNumber: 0,
				donates: []
			},
			lastPayout: null
		};
	}

	componentDidMount() {
		this.fetchData();
	}

	fetchData() {
		this.setState({loading: true}, () => {
			api.getPayouts({system: PaymentSystem.cardpay.name}).then(data => {
				if (data) {
					this.setState({loading: false, ...data});
					this.buildPayoutSlider(data.openedPayout?.donates);
					if (data.lastPayout?.status === PayoutStatus.hold.type) {
						this.setState({showPayoutStatusModal: true});
					}
				}
			});
		});
	}

	buildPayoutSlider = (payoutDonates, systemId) => {
		if (!payoutDonates.length) {
			return;
		}

		let donates = [...payoutDonates].reverse();

		const minAmount = PaymentSystem.cardpay.payoutMinAmount;
		const maxAmount = PaymentSystem.cardpay.payoutMaxAmount;
		const payoutSlider = {};
		let payoutAmount = 0;

		for (const donate of donates) {
			const amount = payoutAmount + currencyToNumber(donate.payoutAmount);

			if (Math.floor(amount) < minAmount) { // skip donates less than minimal amount
				payoutAmount = amount; // still sum total payout amount
				continue;
			}

			if (amount > maxAmount) { // skip donates greater than maximal amount
				break;
			}

			payoutAmount = amount;
			const payoutAmountRounded = Math.floor(payoutAmount);
			payoutSlider[payoutAmountRounded] = {payoutAmount: payoutAmountRounded, pubOrderId: donate.pubOrderId};
		}

		const first = Object.keys(payoutSlider)[0];
		const payoutMin = payoutSlider[first] ? payoutSlider[first].payoutAmount : null;
		const payoutMax = Math.floor(payoutAmount);
		const selectedPayoutAmount = payoutMax;

		this.setState({payoutSlider, payoutMin, payoutMax, selectedPayoutAmount});
	};

	onPayoutSliderChange = (selectedPayoutAmount) => {
		this.setState({selectedPayoutAmount});
	};

	onShowCard = () => {
		this.setState({showCard: !this.state.showCard});
	};

	toggleAccordionCard = (card) => {
		let {currentAccordionCard} = this.state;

		currentAccordionCard = currentAccordionCard === card ? currentAccordionCard + '-same-card' : card;

		this.setState({currentAccordionCard});
	};

	requestPayout = () => {
		const {card, payoutAllowedTerms} = this.state;

		if (!payoutAllowedTerms.isPayoutAllowed || !card) {
			console.log(`Skip request payout - isPayoutAllowed: ${payoutAllowedTerms.isPayoutAllowed}, card: ${card}`);
			return;
		}

		const {payoutSlider, selectedPayoutAmount} = this.state;
		const donate = payoutSlider[selectedPayoutAmount];

		if (!donate) {
			return;
		}

		const params = {pubOrderId: donate.pubOrderId, system: PaymentSystem.cardpay.name};

		this.setState({loading: true, isPayoutAllowed: false}, () => {
			api.requestPayout(params).then(resp => {
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
					<span>{selectedPayoutAmount} ₴</span>
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
							tipFormatter={(value) => `${value.toLocaleString('uk-UA')} ₴`}
							tipProps={{placement: 'bottom', overlayClassName: 'rc-slider-custom-tooltip'}}
						/>
					}
				</div>

				<button className="btn btn-primary ml-md-3"
					disabled={!isPayoutAllowed || !card}
					onClick={() => this.setState({ isModalOpen: true })}>
					Виконати
				</button>
			</div>
		</div>;
	}

	renderOpenedPayout() {
		const {status} = this.props;
		const {loading, openedPayout, payoutSlider, selectedPayoutAmount, payoutAllowedTerms} = this.state;

		return <div className="section-wrapper">
			{loading && <Spinner/>}

			{!loading && <>
				{openedPayout?.donates?.length === 0 &&
					<NoDataContainer title="У тебе ще немає нових донатів" icon="fa-regular fa-heart"/>
				}

				{openedPayout?.donates?.length > 0 && <div>
					<h5 className="mb-4">Заявка на виплату</h5>

					{/*<div className="text-disclaimer mb-3">*/}
					{/*	Виплати створюються автоматично, наступного дня після отриманих донатів, коли на*/}
					{/*	балансі буде від {formatNumber(PaymentSystem.cardpay.payoutMinAmount)} ₴.*/}
					{/*</div>*/}

					{payoutAllowedTerms?.hasAmount &&
						<div className="text-disclaimer mb-3">
							<strong>Зі слайдером</strong> виплачуй усю суму або розділи її на частини і
							переводь на різні картки. Одна виплата на добу (ліміт).
						</div>
					}

					{!payoutAllowedTerms?.hasAmount &&
						<div className="text-disclaimer mb-3">
							Ти зможеш подати заявку, коли на балансі буде від {formatNumber(PaymentSystem.cardpay.payoutMinAmount)} ₴.
						</div>
					}

					{this.renderRunPayout()}

					<OpenedPayout
						payoutSystem={PaymentSystem.cardpay.name}
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
		const {loading, payoutAllowedTerms, openedPayout, showCard, payoutsHistory} = this.state;
		const lastPayout = payoutsHistory?.payouts[0] || {};
		const cardValue = showCard ? helpers.formatCard(this.state.card) || `` : this.state.cardMask || ``;

		return <div>
			<div className="row">
				<div className="col-12 col-md-6">
					{<PayoutBalance
						system={PaymentSystem.cardpay.name}
						loading={loading}
						terms={CardpayPayoutTerms}
						fees={CardpayPayoutFees}
						totalPayoutAmount={openedPayout.totalPayoutAmount}
						payoutMinAmount={PaymentSystem.cardpay.payoutMinAmount}
						payoutMaxAmount={PaymentSystem.cardpay.payoutMaxAmount}
						payoutAllowedTerms={payoutAllowedTerms}
					/>}
				</div>

				<div className="col-12 col-md-6">
					<div className="section-wrapper section-wrapper-top">
						<div className="light-gray-50">
							Картка
						</div>
						<div className="card-info mt-3">
							<div className="input-group" onDoubleClick={this.onEditCard}>
								<div className="input-group-prepend">
									<span className="input-group-text">
										<i className="fa-regular fa-credit-card"/>
									</span>
								</div>
								<input id="card" className="form-control card-input" type="text" inputMode="numeric"
									   disabled={true} value={cardValue}/>
							</div>

							<i className={'control-icon icon-primary fas fa-edit'} title={'Редагувати'}
							   onClick={() => {
								   history.push({pathname: '/panel/settings', search: `?tab=paymentOptions`});
							   }}
							/>

							<i className={'control-icon ' + (showCard ? 'fas fa-eye' : 'far fa-eye-slash')}
							   title={!showCard ? 'Показати' : 'Сховати'}
							   onClick={this.onShowCard}
							/>
						</div>

						{lastPayout.status === PayoutStatus.canceled.type &&
							lastPayout.comment === 'Технічна помилка транзакції' &&
							<div id="cardHelp" className="d-flex flex-column alert alert-warning mt-3 mb-0">
								<div>Останню виплату скасовано через технічну помилку. Вкажіть іншу картку і повторіть
									виплату.&nbsp;
									<strong>Не використовуйте попередню картку</strong>.
								</div>
							</div>}
					</div>
				</div>
			</div>
		</div>;
	}

	render() {
		const {status} = this.props;
		const {lastPayout, hasRequestedPayout, showPayoutStatusModal, currentAccordionCard, isModalOpen} = this.state;
		const isUserPending = status === UserStatus.pending;

		return <div>
			{isUserPending && <DisclaimerUserPending/>}

			<DisclaimerPayoutOnHold show={showPayoutStatusModal}/>

			<div className="payouts payouts-cardpay">
				{!isUserPending && <section className="new-payout" style={{marginTop: '0px'}}>
					{this.renderDetails()}
					{this.renderOpenedPayout()}
				</section>}

				{lastPayout && <div className="section-wrapper">
					<h5 className="mb-4">Остання виплата</h5>

					<PayoutItems payoutSystem={PaymentSystem.cardpay.name}
								 payouts={[lastPayout]}
								 currentAccordionCard={currentAccordionCard}
								 toggleAccordionCard={this.toggleAccordionCard}
					/>
				</div>}
			</div>

			{confirmRemoveModal({
				confirm: () => {this.setState({ isModalOpen: false }); this.requestPayout()},
				cancel: () => this.setState({ isModalOpen: false }),
				title: 'Ви дійсно хочете подати заяку на виплату?',
				isModalOpen
			})}

			{hasRequestedPayout === true && <ConfettiCanvas active={true} fadingMode="LIGHT" stopAfterMs={5000}/>}
		</div>;
	}
}

function mapStateToProps(state) {
	const {system, serviceFee, status} = state.config;

	return {system, serviceFee, status};
}

export default connect(mapStateToProps)(PayoutsCardpay);
