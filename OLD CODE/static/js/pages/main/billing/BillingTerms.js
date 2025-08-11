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

const BillingTerms = ({terms, termsArgs, termsHeader}) => {
	const [showTermsModal, toggleTermsModal] = useState(false);

	return (
		<>
			<div className="payment-terms justify-content-end" onClick={() => toggleTermsModal(true)}>
				<i className="fa-solid fa-info mr-1"></i>
				<span>{termsHeader}</span>
			</div>

			<ReactModal
				isOpen={showTermsModal}
				onAfterOpen={null}
				onRequestClose={() => toggleTermsModal(false)}
				style={customStyles}
				contentLabel="Terms Modal"
			>
				<div className="close-confirm-modal" onClick={() => toggleTermsModal(false)}>
					<i className="fa-solid fa-xmark"></i>
				</div>

				<div className="h-100 d-flex flex-column justify-content-between confirm-modal-content">
					<h4>{termsHeader}</h4>

					<div className="d-flex flex-column text-disclaimer mb-3">
						{terms.map(term => (
							<div key={term.title} className="d-flex mb-1">
								<span className="light-gray-50 text-disclaimer-header" style={{minWidth: '80px'}}>{term.title}</span>
								{typeof term.description === 'function' ? term.description(termsArgs) : term.description}
							</div>
						))}
					</div>
				</div>
			</ReactModal>
		</>
	);
};

export default BillingTerms;
