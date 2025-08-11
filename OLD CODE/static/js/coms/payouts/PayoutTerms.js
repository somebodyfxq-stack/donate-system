import React, {useState} from 'react';
import ReactModal from 'react-modal';

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
ReactModal.setAppElement('#root');
const customStyles = {
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		padding: '32px 40px',
		borderRadius: '30px',
		transform: 'translate(-50%, -50%)',
		height: 'auto',
		width: '100%',
		maxWidth: '630px',
		zIndex: '99',
		overflowX: 'hidden'
	}
};

const PayoutTerms = ({terms, fees, feesArgs}) => {
	const [showPayoutTermsModal, togglePayoutTermsModal] = useState(false);

	return <>
		<div className="payment-terms" onClick={() => togglePayoutTermsModal(true)}>
			<span className="mr-1">Умови виплат</span> <i className="fa-solid fa-info"></i>
		</div>

		<ReactModal isOpen={showPayoutTermsModal}
					onAfterOpen={null}
					onRequestClose={() => togglePayoutTermsModal(false)}
					style={customStyles}
					contentLabel="Terms Modal">
			<div className="close-confirm-modal" onClick={() => togglePayoutTermsModal(false)}>
				<i className="fa-solid fa-xmark"></i>
			</div>

			<div className="h-100 d-flex flex-column justify-content-between confirm-modal-content">
				<h4>Умови виплат</h4>

				<h5>Умови</h5>

				<div className="d-flex flex-column text-disclaimer mb-3">
					{terms.map(term => (
						<div key={term.title} className="d-flex mb-1">
								<span className="light-gray-50 text-disclaimer-header" style={{minWidth: '90px'}}>
									{term.title}
								</span>
							<span>{term.description}</span>
						</div>
					))}
				</div>

				<h5>Комісія</h5>

				<div className="d-flex flex-column text-disclaimer mb-2">
					{fees.map(fee => <div key={fee.title} className="d-flex mb-1">
						<span className="light-gray-50 text-disclaimer-header"
							  style={{minWidth: '150px'}}>{fee.title}</span>
						<span>
							{typeof fee.description === 'function' ? fee.description(feesArgs) : fee.description}
						</span>
					</div>)}
				</div>
			</div>
		</ReactModal>
	</>;
};

export default PayoutTerms;
