import React from 'react';
import ReactQuill from 'react-quill';

const CreateWelcomeMessageModal = ({ useMainForAll, tier, templates, onTextEditorChanged, onSave, isMessageEdit }) => {
	return (
		<div className="modal fade" id={`createWelcomeMessage_${!useMainForAll ? tier._id : 'useMainForAll'}`} tabIndex="-1" role="dialog" aria-labelledby="myModalLabel">
			<div className="modal-dialog create-mailing-modal" role="document">
				<div className="modal-content">
					<div className="modal-body">
						<h4 className="mb-lg-4 text-center">
							{isMessageEdit ? 'Редагувати' : 'Створити вітальне'} повідомлення
						</h4>

						<i className="fa-solid fa-xmark icon-close-modal create-welcome-message-icon" data-dismiss="modal"></i>

						<div className="create-mailing-description">
							{!useMainForAll ? <span>Рівень підписки: {tier.tierName}</span> : <span>Всі рівні підписок</span>}
						</div>

						<div className='lable'>Повідомлення</div>
						<ReactQuill
							theme="snow"
							value={!useMainForAll ? templates[tier._id] : templates.generalEmailText}
							onChange={(e, delta, source) => onTextEditorChanged(e, !useMainForAll ? tier._id : 'generalEmailText', source)}
						/>

						<div className="d-flex justify-content-between send-message-button-wrapper">
							<button
								className="btn btn-outline-dark mr-3 mr-sm-0"
								data-dismiss="modal"
							>
								Скасувати
							</button>
							<button
								className="btn btn-dark"
								data-dismiss="modal"
								disabled={!useMainForAll ? !templates[tier._id]?.trim() : !templates.generalEmailText?.trim()}
								onClick={onSave}
							>
								{isMessageEdit ? 'Зберегти' : 'Створити'}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CreateWelcomeMessageModal;
