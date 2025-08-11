import Slider, {createSliderWithTooltip} from 'rc-slider';

import 'rc-slider/assets/index.css';
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
import {confirmRemoveModal} from '../../utils/confirmRemoveModal';
import {PayoutStatus} from '../../enums/PayoutEnums';
import {UserStatus} from '../../enums/UserStatus';
import {ContractType} from '../../models/SystemDonatelloModel';
import {api} from '../../services/api';
import {currencyToNumber, floatToFixedNumber, formatNumber, formatPercent} from '../../utils/utils';


const DonatelloPayoutTerms = [
	{title: 'Ліміт', description: 'Одна виплата на день'},
	{title: 'Термін', description: '2-3 робочих дні'},
	{title: 'Зв\'язок', description: 'У разі труднощів ми сконтактуємо з тобою через ел. пошту'}
];

const DonatelloPayoutFees = [
	{title: 'Комісія п.с.', description: formatPercent(PaymentSystem.donatello.transactionFee)},
	{
		title: 'Послуги сервісу',
		description: ([statusOrType]) => {
			return formatPercent(statusOrType === ContractType.fop
				? PaymentSystem.donatello.serviceFeeFop
				: PaymentSystem.donatello.serviceFee);
		}
	},
	{
		title: 'Податки',
		description: ([statusOrType]) => {
			return statusOrType === ContractType.fop ? `Сплачуються підприємцем` : `18% ПДФО + 5% ВЗ`;
		}
	}
];

const SliderWithTooltip = createSliderWithTooltip(Slider);

class PayoutsDonatello extends Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			showCard: false,
			cardView: '',
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
				totalPayoutAmount: '',
				totalPayoutAmountNumber: 0,
				donates: [],
				systemId: '',
				statusOrType: ''
			},
			lastPayout: null
		};
	}

	componentDidMount() {
		this.fetchData();
	}

	fetchData() {
		this.setState({loading: true}, () => {
			api.getPayouts({system: PaymentSystem.donatello.name}).then(data => {
				if (data) {
					this.setState({loading: false, ...data});
					this.buildCardView();
					this.buildPayoutSlider(data.openedPayout?.donates, data.openedPayout?.statusOrType);

					if (data.lastPayout?.status === PayoutStatus.hold.type) {
						this.setState({showPayoutStatusModal: true});
					}
				}
			});
		});
	}

	buildPayoutSlider = (payoutDonates, statusOrType) => {
		if (!payoutDonates.length) {
			return;
		}

		const minAmount = PaymentSystem.donatello.payoutMinAmount;
		const maxAmount = statusOrType === ContractType.fop ? PaymentSystem.donatello.payoutMaxAmountFop : PaymentSystem.donatello.payoutMaxAmount;
		const payoutSlider = {};
		let donates = [...payoutDonates].reverse();
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
			const payoutAmountRounded = floatToFixedNumber(payoutAmount);
			payoutSlider[payoutAmountRounded] = {payoutAmount: payoutAmountRounded, pubOrderId: donate.pubOrderId};
		}

		const firstMinAmount = Object.keys(payoutSlider).sort((a, b) => parseFloat(a) - parseFloat(b));
		const first = firstMinAmount[0];
		const payoutMin = payoutSlider[first] ? payoutSlider[first].payoutAmount : null;
		const payoutMax = floatToFixedNumber(payoutAmount);
		const selectedPayoutAmount = payoutMax;

		this.setState({payoutSlider, payoutMin, payoutMax, selectedPayoutAmount});
	};

	onPayoutSliderChange = (selectedPayoutAmount) => {
		this.setState({selectedPayoutAmount});
	};

	buildCardView = () => {
		const {showCard} = this.state;
		const card = this.state.card || '';
		const cardView = showCard ? card
			: (card ? `${card.slice(0, 4)} **** **** **** **** ${card.substring(card.length - 4)}` : '');

		this.setState({cardView});
	};

	onShowCard = () => {
		const {showCard} = this.state;

		this.setState({showCard: !showCard}, () => {
			this.buildCardView();
		});
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

		const params = {pubOrderId: donate.pubOrderId, system: PaymentSystem.donatello.name};

		this.setState({loading: true, isPayoutAllowed: false}, () => {
			api.requestPayout(params).then(() => {
				this.setState({hasRequestedPayout: true});
				this.fetchData();
			});
		});
	};

	renderRunPayout() {
		const {openedPayout, payoutSlider, payoutMin, payoutMax, selectedPayoutAmount} = this.state;
		const isPayoutAllowed = this.state.payoutAllowedTerms?.isPayoutAllowed === true;

		return <div className="run-payout">
			{isPayoutAllowed && (
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
						disabled={!isPayoutAllowed}
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
				{!loading && openedPayout?.donates?.length === 0 &&
					<NoDataContainer title="У тебе ще немає нових донатів" icon="fa-regular fa-heart"/>
				}

				{openedPayout?.donates?.length > 0 && <div>
					<h5 className="mb-4">Заявка на виплату</h5>

					{payoutAllowedTerms?.hasAmount &&
						<div className="text-disclaimer mb-3">
							<strong>Зі слайдером</strong> виплачуй усю суму або розділи її на частини. Одна
							виплата на добу (ліміт).
						</div>
					}

					{!payoutAllowedTerms?.hasAmount &&
						<div className="text-disclaimer mb-3">
							Ти зможеш подати заявку, коли на балансі буде
							від {formatNumber(PaymentSystem.donatello.payoutMinAmount)} ₴.
						</div>
					}

					{this.renderRunPayout()}

					<OpenedPayout
						payoutSystem={PaymentSystem.donatello.name}
						openedPayout={openedPayout}
						status={status}
						statusOrType={openedPayout.statusOrType}
						payoutSlider={payoutSlider}
						selectedPayoutAmount={selectedPayoutAmount}
					/>
				</div>}
			</>}
		</div>;
	}

	renderDetails() {
		const {loading, openedPayout, showCard, cardView, payoutAllowedTerms} = this.state;
		const payoutMaxAmount = openedPayout.statusOrType === ContractType.fop
			? PaymentSystem.donatello.payoutMaxAmountFop
			: PaymentSystem.donatello.payoutMaxAmount;

		return (
			<div className="row">
				<div className="col-12 col-md-5">
					{<PayoutBalance
						system={PaymentSystem.donatello.name}
						loading={loading}
						terms={DonatelloPayoutTerms}
						fees={DonatelloPayoutFees}
						feesArgs={[openedPayout.statusOrType]}
						totalPayoutAmount={openedPayout.totalPayoutAmount}
						payoutMinAmount={PaymentSystem.donatello.payoutMinAmount}
						payoutMaxAmount={payoutMaxAmount}
						payoutAllowedTerms={payoutAllowedTerms}
					/>}
				</div>

				<div className="col-12 col-md-7">
					<div className="section-wrapper section-wrapper-top">
						<div className="light-gray-50">
							Рахунок IBAN
						</div>
						<div className="card-info mt-3">
							<div className="input-group" onDoubleClick={this.onEditCard}>
								<div className="input-group-prepend">
									<span className="input-group-text">
										<i className="fas fa-receipt"/>
									</span>
								</div>
								<input
									id="card"
									className="form-control iban"
									type="text" inputMode="numeric" required
									disabled={true}
									value={cardView}
								/>
							</div>

							<i className={'control-icon ' + (showCard ? 'fas fa-eye' : 'far fa-eye-slash')}
							   data-toggle="tooltip" data-placement="top"
							   title={!showCard ? 'Показати' : 'Сховати'}
							   onClick={this.onShowCard}/>
						</div>
					</div>
				</div>
			</div>
		);
	}

	render() {
		const {status} = this.props;
		const {loading, lastPayout, hasRequestedPayout, showPayoutStatusModal, currentAccordionCard, isModalOpen} = this.state;
		const isUserPending = status === UserStatus.pending;

		return <div>
			{isUserPending && <DisclaimerUserPending/>}

			<DisclaimerPayoutOnHold show={showPayoutStatusModal}/>

			{!loading && <div className="payouts payouts-fondy payouts-donatello">
				{!isUserPending && <section className="new-payout" style={{marginTop: '0px'}}>
					{this.renderDetails()}
					{this.renderOpenedPayout()}
				</section>}

				{lastPayout &&
					<div className="section-wrapper">
						<h5 className="mb-4">Остання виплата</h5>

						<PayoutItems payoutSystem={PaymentSystem.donatello.name}
									 payouts={[lastPayout]}
									 currentAccordionCard={currentAccordionCard}
									 toggleAccordionCard={this.toggleAccordionCard}/>
					</div>
				}
			</div>}

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

export default connect(mapStateToProps)(PayoutsDonatello);
