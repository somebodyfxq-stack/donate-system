import React from 'react';

const Spinner = () => {
	return (
		<div className="d-flex justify-content-center align-items-center" style={{minHeight: "70px"}}>
			<div className="spinner-border text-primary" role="status">
				<span className="sr-only">Loading...</span>
			</div>
		</div>
	)
};

export default Spinner;
