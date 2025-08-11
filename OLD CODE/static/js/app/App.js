import React, {Component} from 'react';
import ReactModal from 'react-modal';
import {connect} from 'react-redux';
import BillingTermsModal from '../coms/billing/BillingTermsModal';
import DisclaimerUserBlocked from '../coms/disclaimer/DisclaimerUserBlocked';
import {BillingTerms} from '../enums/BillingEnums';
import {UserStatus} from '../enums/UserStatus';
import WhatsNewEnum from '../enums/WhatsNewEnum';
import WhatsNew from '../pages/profile/WhatsNew';
import {messageActions} from '../services/messageActions';

import {history} from '../utils';
import helpers from '../utils/helpers';
import Page from './Page';

export const AppModalStyles = {
	content: {
		borderRadius: '15px',
		bottom: 'auto',
		left: '50%',
		marginRight: '-50%',
		maxWidth: '700px',
		padding: '30px',
		right: 'auto',
		top: '100px',
		transform: 'translate(-50%, 0%)',
		width: '50%',
		zIndex: '99'
	}
};

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
ReactModal.setAppElement('#root');


class App extends Component {

	constructor(props) {
		super(props);

		const {dispatch} = this.props;

		history.listen((location, action) => {
			// clear alert on location change
			dispatch(messageActions.clear());
		});

		helpers.toggleDarkTheme();

		this.state = {
			showWhatsNewModal: false,
			showBillingTerms: true
		};
	}

	componentDidMount() {
		this.toggleWhatsNewModal();
	}

	toggleWhatsNewModal = () => {
		let showWhatsNewModal = true;
		let counter = localStorage.getItem('whatsNewCounter') || '0';

		if (WhatsNewEnum.length === parseInt(counter)) {
			showWhatsNewModal = false;
		}

		this.setState({showWhatsNewModal});
	};

	render() {
		const {isUserAllowed, showBillingTerms} = this.props;

		return <div className="content">
			<div className="main-container">
				<div className="main-column">
					{isUserAllowed && <Page/>}
					{!isUserAllowed && <DisclaimerUserBlocked/>}
				</div>

				<ReactModal
					isOpen={this.state.showWhatsNewModal}
					onRequestClose={() => this.setState({showWhatsNewModal: false})}
					style={AppModalStyles}
					contentLabel="Що нового">
					<WhatsNew modal={true} onCloseModal={() => this.setState({showWhatsNewModal: false})}/>
				</ReactModal>

				<ReactModal
					isOpen={this.state.showBillingTerms && showBillingTerms}
					onRequestClose={null}
					style={{content: {...AppModalStyles.content, padding: '40px', width: '60%', maxWidth: '800px', maxHeight: '80vh'}}}
					contentLabel="Платні повідомлення">
					<BillingTermsModal onCloseModal={() => this.setState({showBillingTerms: false})}/>
				</ReactModal>
			</div>
		</div>;
	}
}

function mapStateToProps(state) {
	return {
		message: state.message,
		isUserAllowed: state.config.status !== UserStatus.blocked,
		showBillingTerms: state.config?.billing?.billingTerms === BillingTerms.pending
	};
}

export default connect(mapStateToProps)(App);
