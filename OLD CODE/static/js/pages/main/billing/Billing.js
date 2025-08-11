import React, {Component} from 'react';
import {connect} from 'react-redux';
import '../../../css/settings.css';
import PageTabs from '../../../coms/misc/PageTabs';
import {history} from '../../../utils';
import BillingBusiness from './BillingBusiness';
import BillingPlan from './BillingPlan';


const BillingMode = {
	main: 'main',
	history: 'history'
};

const BillingTabsList = [{
	route: `plan`,
	title: `Платні повідомлення`,
	render: () => <BillingPlan/>
}, {
	route: `business`,
	title: `Бізнес мерчант`,
	render: () => <BillingBusiness/>
}];


class Billing extends Component {

	constructor(props) {
		super(props);

		this.state = {
			activeTab: BillingTabsList[0].route,
			billingTabs: BillingTabsList,
			mode: BillingMode.main
		};
	}

	componentDidMount() {
		const urlParams = new URLSearchParams(window.location.search);
		const mode = urlParams.get('mode') || BillingMode.main;

		this.setState({mode});
	}

	setActiveTab = (tabRoute) => {
		const urlParams = new URLSearchParams(window.location.search);
		const tab = this.state.billingTabs.find(tab => tab.route === tabRoute).route;
		const mode = urlParams.get('mode') || this.state.mode || BillingMode.main;

		history.push({
			pathname: '/panel/billing',
			search: `?${new URLSearchParams({tab, mode})}`
		});

		this.setState({activeTab: tabRoute});
	};

	toggleMode = () => {
		const urlParams = new URLSearchParams(window.location.search);
		const tab = urlParams.get('tab') || this.state.billingTabs[0].route;
		const mode = this.state.mode === BillingMode.main ? BillingMode.history : BillingMode.main;

		history.push({
			pathname: `/panel/billing`,
			search: `?${new URLSearchParams({tab, mode})}`
		});

		this.setState({mode});
	};

	render() {
		const {activeTab, mode} = this.state;

		return <div className="payouts-wrapper billing-wrapper">
			<div className="d-flex justify-content-between flex-column flex-md-row">
				<PageTabs
					tabs={this.state.billingTabs}
					activeTab={this.state.activeTab}
					setActiveTab={this.setActiveTab}
					urlPath="billing"/>
			</div>

			{BillingTabsList.map((tab) => <div key={tab.route}>
				{activeTab === tab?.route && mode === BillingMode.main && tab?.render()}
				{activeTab === tab?.route && mode === BillingMode.history && tab?.renderHistory()}
			</div>)}
		</div>;
	}
}

function mapStateToProps(state) {
	const {status, features} = state.config;

	return {status, features};
}

export default connect(mapStateToProps)(Billing);
