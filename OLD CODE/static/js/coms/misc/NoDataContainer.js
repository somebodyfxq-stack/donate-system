import React from 'react';

const NoDataContainer = ({ title, text, icon }) => {
	return (
		<div className='d-flex flex-column align-items-center no-data-container'>
			<i className={icon + ' mb-2'}></i>
			<h5 className="text-center mt-4">{title}</h5>
			{text && <span>{text}</span>}
		</div>
	)
};

export default NoDataContainer;
