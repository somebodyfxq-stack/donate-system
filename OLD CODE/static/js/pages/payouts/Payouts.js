import React, {Component} from 'react';
import {connect} from 'react-redux';
import '../../css/settings.css';
import PageTabs from '../../coms/misc/PageTabs';
import PayoutsHistory from '../../coms/payouts/PayoutsHistory';
import {PaymentSystem} from '../../enums/PaymentEnums';
import {history} from '../../utils';
import PayoutsCardpay from './PayoutsCardpay';
import PayoutsDonatello from './PayoutsDonatello';
import PayoutsFondy from './PayoutsFondy';
import PayoutsTrusty from './PayoutsTrusty';
import PayoutsTrustyeu from './PayoutsTrustyeu';
import PayoutsWhitepay from './PayoutsWhitepay';


const PayoutsMode = {
	main: 'main',
	history: 'history'
};

const PayoutsTabsList = [{
	route: PaymentSystem.donatello.name,
	title: PaymentSystem.donatello.title,
	system: PaymentSystem.donatello.name,
	render: () => <PayoutsDonatello/>,
	renderHistory: () => <PayoutsHistory payoutSystem={PaymentSystem.donatello.name}/>
}, {
	route: PaymentSystem.cardpay.name,
	title: PaymentSystem.cardpay.title,
	system: PaymentSystem.cardpay.name,
	render: () => <PayoutsCardpay/>,
	renderHistory: () => <PayoutsHistory payoutSystem={PaymentSystem.cardpay.name}/>
}, {
	route: PaymentSystem.trustyeu.name,
	title: `Trustypay EU`,
	system: PaymentSystem.trustyeu.name,
	render: () => <PayoutsTrustyeu/>,
	renderHistory: () => <PayoutsHistory payoutSystem={PaymentSystem.trustyeu.name}/>
}, {
	route: PaymentSystem.whitepay.name,
	title: PaymentSystem.whitepay.title,
	system: PaymentSystem.whitepay.name,
	render: () => <PayoutsWhitepay/>,
	renderHistory: () => <PayoutsHistory payoutSystem={PaymentSystem.whitepay.name}/>
}, {
	route: PaymentSystem.trusty.name,
	title: `Trustypay`,
	system: PaymentSystem.trusty.name,
	render: () => <PayoutsTrusty/>,
	renderHistory: () => <PayoutsHistory payoutSystem={PaymentSystem.trusty.name}/>
}, {
	route: PaymentSystem.fondy.name,
	title: PaymentSystem.fondy.title,
	system: PaymentSystem.fondy.name,
	render: () => <PayoutsFondy/>,
	renderHistory: () => <PayoutsHistory payoutSystem={PaymentSystem.fondy.name}/>
}];


class Payouts extends Component {

	constructor(props) {
		super(props);

		this.state = {
			activeTab: PaymentSystem.trusty.name,
			payoutsTabs: PayoutsTabsList,
			mode: PayoutsMode.main
		};
	}

	componentDidMount() {
		const urlParams = new URLSearchParams(window.location.search);
		const mode = urlParams.get('mode') || PayoutsMode.main;

		this.setState({mode});
	}

	setActiveTab = (tabRoute) => {
		const urlParams = new URLSearchParams(window.location.search);
		const tab = this.state.payoutsTabs.find(tab => tab.route === tabRoute).route;
		const mode = urlParams.get('mode') || this.state.mode || PayoutsMode.main;

		history.push({
			pathname: '/panel/payouts',
			search: `?${new URLSearchParams({tab, mode})}`
		});

		this.setState({activeTab: tabRoute});
	};

	toggleMode = () => {
		const urlParams = new URLSearchParams(window.location.search);
		const tab = urlParams.get('tab') || this.state.payoutsTabs[0].route;
		const mode = this.state.mode === PayoutsMode.main ? PayoutsMode.history : PayoutsMode.main;

		history.push({
			pathname: `/panel/payouts`,
			search: `?${new URLSearchParams({tab, mode})}`
		});

		this.setState({mode});
	};

	render() {
		const {activeTab, mode} = this.state;

		return <div className="payouts-wrapper">
			<div className="d-flex justify-content-between flex-column flex-md-row">
				<PageTabs
					tabs={this.state.payoutsTabs}
					activeTab={this.state.activeTab}
					setActiveTab={this.setActiveTab}
					urlPath="payouts"/>

				<div className="d-flex justify-content-center align-items-baseline mode-buttons">
					<button className={`btn btn-no-outline mr-2 ${mode === PayoutsMode.main ? 'active' : ''}`}
							onClick={() => this.toggleMode()}>
						Заявка на виплату
					</button>
					<button className={`btn btn-no-outline ${mode === PayoutsMode.history ? 'active' : ''}`}
							onClick={() => this.toggleMode()}>
						Історія виплат
					</button>
				</div>
			</div>

			{PayoutsTabsList.map((tab) => <div key={tab.system}>
				{activeTab === tab?.system && mode === PayoutsMode.main && tab?.render()}
				{activeTab === tab?.system && mode === PayoutsMode.history && tab?.renderHistory()}
			</div>)}
		</div>;
	}
}

function mapStateToProps(state) {
	const {status, features} = state.config;

	return {status, features};
}

export default connect(mapStateToProps)(Payouts);
