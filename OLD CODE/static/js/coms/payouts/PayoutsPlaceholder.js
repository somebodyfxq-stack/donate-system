import React from 'react';

const PayoutsPlaceholder = ({title, text, children}) => {
	const defaultTitle = 'Історія виплат';
	const defaultText = 'Тут буде історія твоїх виплат';

	return (
		<>
			<h3 className='mt-0'>{title || defaultTitle}</h3>
			<div className="d-flex flex-column align-items-center justify-content-center mt-2 mb-5">
				<img src="/img/panel/payouts-placeholder.svg" alt={title || defaultTitle} height="400"/>
				<div className="text-muted mt-3" style={{fontSize: '16px'}}>{text || children || defaultText}</div>
			</div>
		</>
	);
};

export default PayoutsPlaceholder;
