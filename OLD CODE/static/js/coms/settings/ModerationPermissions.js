import React, {useCallback, useEffect, useState} from 'react';
import Switch from 'react-switch';
import {api} from '../../services/api';
import {messageService} from '../../services/messageService';
import {confirmRemoveModal} from '../../utils/confirmRemoveModal';

const ModerationSections = [{
		element: 'subscribers',
		toggle: 'subscribersToggle',
		pageName: 'Підписники'
	},{
		element: 'messages',
		toggle: 'messagesToggle',
		pageName: 'Повідомлення'
}];

const ModerationPermissions = () => {
	const [formData, setFormData] = useState({
		subscribers: [],
		messages: [],
	});

	const [toggle, setToggleData] = useState({
		subscribersToggle: false,
		messagesToggle: false,
	});

	const [modalData, setModalData] = useState({
		indexToRemove: -1,
		isModalOpen: false,
		element: ''
	});

	const toggleSwitch = useCallback(async (item, value, permission) => {
		setToggleData(prev => ({ ...prev, [item]: value }));

		await api.setToggleModerationSettings({value, permission});
	}, []);

	const onChange = useCallback((e, item, element) => {
		const { value } = e.target;
		const newFormData = { ...formData };
		newFormData[element][item] = {
			...newFormData[element][item],
			moderatorNickname: value,
		};

		setFormData({ ...newFormData });
	}, [formData]);

	const onRemoveElement = useCallback(async (item, element) => {
		const newFormData = { ...formData };

		if (newFormData[element][item]?.moderatorUserId) {
			const moderator = newFormData[element][item];

			await api.removeModerationSettings({
				moderationType: moderator.moderationType,
				moderatorUserId: moderator.moderatorUserId,
				authorId: moderator.userId
			});
		}

		newFormData[element].splice(item, 1);

		setFormData({ ...newFormData });
		setModalData({ ...modalData, isModalOpen: false });
	}, [formData, modalData]);

	const onAddElement = useCallback((e, element) => {
		e.preventDefault();

		const newFormData = { ...formData };
		newFormData[element].push({ moderatorNickname: '', moderatorUserId: '' });

		setFormData({ ...newFormData });
	}, [formData]);

	const onSave = useCallback(async (e, value, i, element, elementToggle) => {
		e && e.preventDefault();

		if (!value) return;

		const newFormData = { ...formData };

		const data = {
			nickname: value,
			permission: element,
			toggle: toggle[elementToggle]
		}

		const resp = await api.setModerationSettings(data);

		if (!resp.success) {
			return messageService.error(resp.message)
		}

		newFormData[element][i] = resp.data;

		setFormData({ ...newFormData });
	}, [formData, toggle]);

	const getModerationSettings = useCallback(async () => {
		const resp = await api.getModerationSettings();

		const {data, subscribersToggle, messagesToggle} = resp;

		setFormData({ ...data });
		setToggleData({
			subscribersToggle,
			messagesToggle,
		});
	}, []);

	useEffect(() => {
		getModerationSettings();
	}, [getModerationSettings]);

	const renderModerationSection = useCallback((items, element, elementToggle, pageName) => {
		return (
			<>
			<div className='d-flex justify-content-between align-items-center mb-3'>
				<div className="misc-item-description pr-0 pr-sm-5 mb-3 mb-sm-0">
					<div className='misc-item-title mb-2'>Сторінка "{pageName}"</div>
				</div>

				<Switch
					id={elementToggle}
					onChange={(checked) => toggleSwitch(elementToggle, checked, element)}
					checked={toggle[elementToggle]}
					height={24}
					width={45}
					onColor='#3579F6'
				/>
			</div>
			{toggle[elementToggle] && (
				<div className="row page-view-item border-0">
					<div className="col-12 col-md-4 mb-3">
						<span className='page-view-item-name'>Модератори</span>
					</div>
					<div className="col col-md-8 col-lg-7">
						{items.map((item, i) =>
							<div key={item.moderatorUserId || i} className="page-view-item-description form-group mt-3 mt-sm-0 mb-4">
								<div className="row">
									<div className="col-md-10 col-sm-12">
										<div className="row">
											<div className="col-8">
												<input type="text" className="form-control" disabled={item.moderatorUserId}
													value={item.moderatorNickname}
													onChange={(e) => onChange(e, i, element)}
													onBlur={() => onSave(null, item.moderatorNickname, i, element, elementToggle)}
													onKeyDown={(e) => {
														if (e.key === 'Enter') {
															onSave(e, item.moderatorNickname, i, element, elementToggle);
														}
													}}
												/>
											</div>
											<div className="col-1 d-flex align-items-center">
												{item.moderatorUserId && (
													<i className="fas fa-check-circle" style={{ color: "green", fontSize: "18px" }}></i>
												)}
											</div>
											<div className="col-3">
												<div className="input-tools">
													<i
														className="fa-regular pointer fa-trash-can"
														title="Видалити"
														onClick={() => setModalData({ ...modalData, indexToRemove: i, isModalOpen: true, element })}
													/>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}
						{items.length < 5 &&
							<div className="d-flex">
								<button
									className="btn btn-outline-dark add-button-donate-amount justify-content-between"
									title="Додати модератора"
									onClick={(e) => onAddElement(e, element)}
								>
									<span>Додати модератора</span>
									<i className="fa-solid fa-plus"></i>
								</button>
							</div>
						}
					</div>
				</div>
			)}
			</>
		)
	}, [modalData, toggle, toggleSwitch, onAddElement, onChange, onSave]);

	return (
		<section>
			<h3>Модерація</h3>
			<div className="misc-item d-block">
				<div className="text-disclaimer mb-4">
					<span>Ви можете додати модераторів до кожної секції індивідуально.</span>
				</div>

				{ModerationSections.map(({element, toggle, pageName}) => {
					const data = formData[element];

					if (!data) return null;

					return(
						<React.Fragment key={element}>
							{renderModerationSection(data, element, toggle, pageName)}
						</React.Fragment>
					);
				})}
			</div>
			{confirmRemoveModal({
				confirm: () => onRemoveElement(modalData.indexToRemove, modalData.element),
				cancel: () => setModalData({ ...modalData, isModalOpen: false }),
				isModalOpen: modalData.isModalOpen
			})}
		</section>
	);
}

export default ModerationPermissions;
