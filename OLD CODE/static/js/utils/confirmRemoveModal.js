import React from 'react';

import {ConfirmModal} from '../coms/modal/ConfirmModal';

export const confirmRemoveModal = ({confirm, cancel, isModalOpen, title, text}) => {

	return <ConfirmModal isModalOpen={isModalOpen} toggleModal={cancel}>
		<div className="h-100 d-flex flex-column justify-content-between">
			<h5 className="text-center mt-3"><strong>{title || 'Підтвердіть дію'}</strong></h5>
			{text && <h6 className="text-center mt-4">{text}</h6>}
			<div className="d-flex justify-content-between mt-5">
				<button type="button" className="btn secondary-button"
						onClick={cancel}>
					Скасувати
				</button>
				<button type="button" className="btn add-widget btn-dark"
						onClick={confirm}>
					Так
				</button>
			</div>
		</div>
	</ConfirmModal>;
};
