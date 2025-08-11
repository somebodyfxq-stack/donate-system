import 'rc-slider/assets/index.css';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {CurrencyDisplay, PaymentSystem} from '../../enums/PaymentEnums';
import {UserStatus} from '../../enums/UserStatus';
import {api} from '../../services/api';
import DisclaimerUserPending from '../disclaimer/DisclaimerUserPending';
import '../../css/payouts.css';
import PayoutItems from './PayoutItems';
import PayoutsPlaceholder from './PayoutsPlaceholder';


class PayoutsHistory extends Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: true,

			totalPayoutHistoryAmount: '',
			payouts: []
		};
	}

	componentDidMount() {
		this.fetchData();
	}

	fetchData() {
		const {payoutSystem} = this.props;

		this.setState({loading: true}, () => {
			api.getPayoutsHistory({system: payoutSystem}).then(data => {
				const {totalPayoutHistoryAmount, payouts} = data;
				this.setState({totalPayoutHistoryAmount, payouts, loading: false});
			});
		});
	}

	toggleAccordionCard = (card) => {
		let {currentAccordionCard} = this.state;

		currentAccordionCard = currentAccordionCard === card ? currentAccordionCard + '-same-card' : card;

		this.setState({currentAccordionCard});
	};

	renderPayoutsControls() {
		const {payoutSystem} = this.props;

		return (
			<div className='d-flex align-items-center justify-content-between mt-4 mb-4'>
				<div className="control-header">
					{payoutSystem && <div className="control-item">
						<i className="icon fa-regular fa-credit-card"></i>
						<span>{PaymentSystem[payoutSystem].title}</span>
					</div>}
				</div>
				<div className="control-header">
					<span className="light-gray-50 mr-2">Разом: </span>
					<span>
						{this.state.totalPayoutHistoryAmount} {payoutSystem === PaymentSystem.whitepay.name ? CurrencyDisplay.USDT.sign : CurrencyDisplay.UAH.sign}
					</span>
				</div>
			</div>
		)
	}

	render() {
		const {status} = this.props;
		const {loading, payouts} = this.state;
		const isUserPending = status === UserStatus.pending;

		return <div>
			{isUserPending && <DisclaimerUserPending/>}

			<div className={`payouts payouts-history payouts-${this.props.payoutSystem}`}>
				{loading === false && payouts?.length > 0 &&
					<section className="section-wrapper">
						<h5 className="mt-2 pb-2">Історія виплат</h5>

						{this.renderPayoutsControls()}

						<PayoutItems payoutSystem={this.props.payoutSystem}
									 payouts={payouts}
									 currentAccordionCard={this.state.currentAccordionCard}
									 toggleAccordionCard={this.toggleAccordionCard}/>
					</section>
				}

				{loading === false && payouts?.length === 0 &&
					<section className="section-wrapper">
						<PayoutsPlaceholder/>
					</section>
				}
			</div>
		</div>;
	}
}

function mapStateToProps(state) {
	const {system, serviceFee, status} = state.config;

	return {system, serviceFee, status};
}

export default connect(mapStateToProps)(PayoutsHistory);
