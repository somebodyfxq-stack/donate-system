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
import {PayoutStatus} from '../../enums/PayoutEnums';
import {isUserVerifiedStatus, UserStatus} from '../../enums/UserStatus';
import {api} from '../../services/api';
import {messageService} from '../../services/messageService';
import {confirmRemoveModal} from '../../utils/confirmRemoveModal';
import helpers from '../../utils/helpers';
import {currencyToNumber, formatNumber, formatPercent} from '../../utils/utils';


const FondPayoutsTerms = [
	{title: 'Картка', description: 'Картка фізичної особи у гривні, будь-який банк України'},
	{title: 'Ліміт', description: 'Одна виплата протягом 20 днів (тимчасовий ліміт)'},
	{title: 'Термін', description: 'Протягом тижня після запиту, у зв’язку з ручним опрацюванням'},
	{title: 'Зв\'язок', description: 'У разі труднощів ми сконтактуємо з тобою через ел. пошту'}
];

const FondyPayoutsFees = [
	{
		title: 'Комісія п.с.',
		description: formatPercent(PaymentSystem.fondy.transactionFee)
	}, {
		title: 'Послуги сервісу',
		description: ([serviceFee]) => {
			return formatPercent(currencyToNumber(serviceFee) / 100 || PaymentSystem.fondy.serviceFee);
		}
	}, {
		title: 'Дод.комісія',
		description: () => {
			return <>Після <a href="https://fondy.ua/uk/blog/official-statement-30-04-24/" target="_blank"
							  rel="noopener noreferrer">скасування ліцензії Fondy</a>, користувачам з
				балансом <strong>від 15К</strong> ми змушені врахувати додаткову комісію <strong>5%</strong>,
				оскільки для виплат залучені підрядники, які зобов'язані оплатити податки.
			</>;
		}
	}
];

const SliderWithTooltip = createSliderWithTooltip(Slider);

class PayoutsFondy extends Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			showCard: false,
			editCard: false,
			cardView: '',
			prevCard: '',
			currentAccordionCard: 'payout-terms',
			hasRequestedPayout: false,
			showPayoutStatusModal: false,
			payoutSlider: {},
			payoutMin: null,
			payoutMax: null,
			selectedPayoutAmount: null,
			isModalOpen: false,
			transferChecked: false,

			// Fetched data
			card: '',
			cardMask: '',
			fullName: '',
			ipn: '',
			isCardValid: true,
			isNoServiceFee: false,
			payoutAllowedTerms: {
				hasAmount: true,
				hasFopFee: false,
				isCardChanged: false,
				isCardValid: true,
				isDailyLimit: false,
				isPayoutAllowed: true,
				isPreviousPayoutInProgress: false,
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
			api.getPayouts({system: PaymentSystem.fondy.name}).then(data => {
				if (data) {
					const prevCard = data.card;
					this.setState({loading: false, prevCard, ...data});
					this.buildCardView();
					this.buildPayoutSlider(data.openedPayout?.donates, data.openedPayout?.systemId);

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

		if (!systemId) {
			systemId = donates[0]?.systemId;
		}

		if (systemId) {
			const index = donates.findIndex(donate => donate.systemId !== systemId);

			if (index !== -1) {
				donates = donates.slice(0, index);
			}
		}

		const minAmount = PaymentSystem.fondy.payoutMinAmount;
		const maxAmount = PaymentSystem.fondy.payoutMaxAmount;
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
			const payoutAmountRounded = Math.ceil(payoutAmount);
			payoutSlider[payoutAmountRounded] = {payoutAmount: payoutAmountRounded, pubOrderId: donate.pubOrderId};
		}

		const first = Object.keys(payoutSlider)[0];
		const payoutMin = payoutSlider[first] ? payoutSlider[first].payoutAmount : null;
		const payoutMax = Math.ceil(payoutAmount);
		const selectedPayoutAmount = payoutMax;

		this.setState({payoutSlider, payoutMin, payoutMax, selectedPayoutAmount});
	};

	onPayoutSliderChange = (selectedPayoutAmount) => {
		this.setState({selectedPayoutAmount});
	};

	buildCardView = () => {
		const {showCard} = this.state;
		const card = this.state.card || '';
		const cardView = showCard ? helpers.formatCard(card)
			: (card ? `${card.slice(0, 4)} **** **** ${card.substring(card.length - 4)}` : '');

		this.setState({cardView});
	};

	onShowCard = () => {
		const {showCard, editCard} = this.state;

		if (editCard) {
			return;
		}

		this.setState({showCard: !showCard}, () => {
			this.buildCardView();
		});
	};

	onCardChange = (e) => {
		const {value} = e.target;
		let {card} = this.state;

		card = value.replace(/\D/g, '');

		if (card.length > 16) {
			card = card.slice(0, 16);
		}

		this.setState({card}, () => {
			this.buildCardView();
		});
	};

	isValidCard = () => {
		const {card} = this.state;

		return helpers.isValidCardNumber(card);
	};

	onEditCard = () => {
		const {editCard} = this.state;
		const {status} = this.props;

		this.setState({showCard: !editCard, editCard: !editCard}, () => {
			let {card, prevCard, editCard} = this.state;

			if (editCard) {
				this.buildCardView();
				this.cardInput.focus();
			}

			if (!editCard && helpers.isValidCardNumber(card) && card !== prevCard) {
				// Save card
				api.updateSettings({card}).then(() => {
					this.fetchData();

					if (isUserVerifiedStatus(status)) {
						messageService.success('Ви можете достроково підтвердити картку через імейл');
					}
				});
			} else {
				// Cancel: revert previous saved card
				card = prevCard;

				this.setState({card}, () => {
					this.buildCardView();
				});
			}
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

		const params = {
			pubOrderId: donate.pubOrderId,
			system: PaymentSystem.fondy.name,
			isTransfer: this.state.transferChecked
		};

		this.setState({loading: true, isPayoutAllowed: false}, () => {
			api.requestPayout(params).then(() => {
				this.setState({hasRequestedPayout: true});
				this.fetchData();
			});
		});
	};

	onCheckboxChange = (e) => { // TODO make logic for checkboxes
		const {checked, value} = e.target;
		let {selectedPayoutAmount} = this.state;

		const numericValue = parseFloat(value);

		if (checked) {
			selectedPayoutAmount += numericValue;
		} else {
			selectedPayoutAmount -= numericValue;
		}

		this.setState({selectedPayoutAmount});
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

			<div className="d-flex flex-column flex-md-row align-items-center">
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

			<div className="d-flex align-items-center mt-3">
				<input type="checkbox" className="mr-2" id="transferPayout"
					checked={this.state.transferChecked}
					onChange={(e) => this.setState({transferChecked: e.target.checked})}
				/>
				<label className="form-check-label" htmlFor="transferPayout">
					Перенести виплату на баланс платних повідомлень
				</label>
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

					{payoutAllowedTerms?.hasAmount &&
						<div className="text-disclaimer mb-3">
							<strong>Зі слайдером</strong> виплачуй усю суму або розділи її на частини і
							переводь
							на різні картки. Одна виплата на 20 днів (тимчасовий ліміт).
						</div>
					}

					{!payoutAllowedTerms?.hasAmount &&
						<div className="text-disclaimer mb-3">
							Ти зможеш подати заявку, коли на балансі буде
							від {formatNumber(PaymentSystem.fondy.payoutMinAmount)} ₴.
						</div>
					}

					{this.renderRunPayout()}

					<OpenedPayout
						openedPayout={openedPayout}
						status={status}
						payoutSlider={payoutSlider}
						selectedPayoutAmount={selectedPayoutAmount}
						hasAmount={payoutAllowedTerms?.hasAmount}
						onCheckboxChange={this.onCheckboxChange}
						showCheckbox={false}
					/>
				</div>}
			</>}
		</div>;
	}

	renderDetails() {
		const {
			loading, openedPayout, showCard, editCard, card, prevCard, cardView, payoutsHistory, payoutAllowedTerms
		} = this.state;
		const lastPayout = payoutsHistory?.payouts[0] || {};

		return (
			<div className="row">
				<div className="col-12 col-md-6">
					{<PayoutBalance
						system={PaymentSystem.fondy.name}
						loading={loading}
						terms={FondPayoutsTerms}
						fees={FondyPayoutsFees}
						feesArgs={[this.props.serviceFee]}
						totalPayoutAmount={openedPayout.totalPayoutAmount}
						payoutMinAmount={PaymentSystem.fondy.payoutMinAmount}
						payoutMaxAmount={PaymentSystem.fondy.payoutMaxAmount}
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
								<input
									id="card"
									className={'form-control card-input ' + (!this.isValidCard() && !loading ? 'card-not-valid' : '')}
									type="text" inputMode="numeric" required
									ref={inputEl => (this.cardInput = inputEl)}
									disabled={!editCard}
									value={cardView}
									onChange={this.onCardChange}
									onBlur={this.onEditCard}
									onKeyDown={(e) => {
										if (e.key === 'Enter' && helpers.isValidCardNumber(card)) {
											this.onEditCard();
										}

										if (e.key === 'Escape') {
											this.onEditCard();
										}
									}}
								/>
							</div>

							{editCard &&
								<i className={'control-icon ' + (this.isValidCard() ? 'fas fa-check-circle' : 'fas fa-cancel')}
								   title={this.isValidCard() ? 'Зберегти' : 'Скасувати'}
								   onClick={this.onEditCard}
								/>
							}

							{!editCard &&
								<i className={'control-icon icon-primary fas fa-edit'}
								   title={'Редагувати'}
								   onClick={this.onEditCard}
								/>
							}

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

						{editCard && <div id="cardHelp" className="d-flex flex-column alert alert-warning mt-3 mb-0">
							<div>Виплати проводяться виключно на <strong>картку у гривні</strong> будь-якого банку
								України.
							</div>
							{prevCard !== '' && card !== prevCard && <div className="text-alert mt-1">
								Після зміни картки, для вашої безпеки, виплати буде <strong>заблоковано на 24
								год.</strong>
							</div>}
						</div>}
					</div>
				</div>
			</div>
		);
	}

	render() {
		const {status} = this.props;
		const {lastPayout, hasRequestedPayout, showPayoutStatusModal, currentAccordionCard, isModalOpen} = this.state;
		const isUserPending = status === UserStatus.pending;

		return <div>
			{isUserPending && <DisclaimerUserPending/>}

			<DisclaimerPayoutOnHold show={showPayoutStatusModal}/>

			<div className="payouts">

				{!isUserPending && <section className="new-payout" style={{marginTop: '0px'}}>
					{this.renderDetails()}
					{this.renderOpenedPayout()}
				</section>}

				{lastPayout && <div className="section-wrapper">
					<h5 className="mb-4">Остання виплата</h5>

					<PayoutItems
						payoutSystem={PaymentSystem.fondy.name}
						payouts={[lastPayout]}
						currentAccordionCard={currentAccordionCard}
						toggleAccordionCard={this.toggleAccordionCard}
					/>
				</div>}
			</div>

			{confirmRemoveModal({
				confirm: () => {this.setState({ isModalOpen: false }); this.requestPayout()},
				cancel: () => this.setState({ isModalOpen: false }),
				title: 'Подати заявку на виплату',
				text: this.state.transferChecked ? 'Виплата буде переведена на баланс платних повідомлень' : '',
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

export default connect(mapStateToProps)(PayoutsFondy);
