import React, {useCallback, useEffect, useState} from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Switch from 'react-switch';
import widgetEnum from '../../enums/widgetEnum';
import TierModel from '../../models/TierModel';
import {api} from '../../services/api';
import {messageService} from '../../services/messageService';
import Badge from '../misc/Badge';
import '../../css/tier.css';
import MultiSelect from '../misc/MultiSelect';
import {Modal} from '../modal/Modal';

const widgetCurrencies = widgetEnum.CURRENCIES;

const TierItem = ({ tier, onTierSave, onCancel }) => {
	const [formData, setFormData] = useState(new TierModel());
	const [visible, setModalVisible] = useState(false);
	const [discordRoles, setDiscordRoles] = useState([]);
	const [tgChats, setTgChats] = useState([]);

	const getDiscordGuildRoles = async () => {
		const data = await api.getDiscordGuildRoles();
		const { roles } = data;

		const discordRoles = roles
			.filter(r => r.roleName !== "@everyone")
			.map(r => ({
				id: r.roleId,
				title: r.roleName,
				color: r.roleColor
			}));

		setDiscordRoles(discordRoles);
	};

	const getTgSecretChats = async () => {
		const data = await api.getTgSecretChats();
		const { chats } = data;

		setTgChats(chats);
	};

	useEffect(() => {
		if (tier._id) {
			setFormData({ ...tier });
		}

		getDiscordGuildRoles();
		getTgSecretChats();
	}, [tier]);

	const initialSelectedDiscordRoles = useCallback(() => {
		const discordRoles = formData.selectedDiscordRoles.map(r => ({
			id: r.roleId,
			title: r.roleName,
			color: r.roleColor
		}));

		return discordRoles;
	}, [formData]);

	const handleRoleChange = useCallback((selectedRoles) => {
		setFormData({
			...formData,
			selectedDiscordRoles: selectedRoles.map(role => ({
				roleId: role.id,
				roleName: role.title,
				roleColor: role.color
			}))
		});
	}, [formData]);

	const handleTgChatsChange = useCallback((selectedtgChats) => {
		setFormData({ ...formData, tgChats: selectedtgChats });
	}, [formData]);

	const setSelected = useCallback((e, items) => {
		const { fileType, gcName, name, url, id, _id, path } = items.images?.find(el => el.selected);
		const image = { fileType, gcName, name, url: url || path, id: _id || id };

		setFormData({ ...formData, image });
	}, [formData]);

	const onRemoveElement = useCallback(() => {
		const newFormData = { ...formData };

		newFormData.image = {};

		setFormData({ ...newFormData });
	}, [formData]);

	const addDiscordRolesToMe = useCallback(async () => {
		const rolesInfo = {
			discordRole: true,
			selectedDiscordRoles: formData.selectedDiscordRoles,
			tierName: formData.tierName
		}

		const data = await api.addDiscordRolesToMe(rolesInfo);

		if (data.discordErrorMessage) {
			messageService.error(data.discordErrorMessage);
		} else {
			messageService.success(`Рол${formData.selectedDiscordRoles.length > 1 ? 'і' : 'ь'} видано`);
		}
	}, [formData]);

	return (
		<div className="tier">
			<form onSubmit={(e) => onTierSave(e, formData)}>
				<div className="form-group row mb-lg-4">
					<label htmlFor="tierName" className="col-sm-3 col-form-label">Назва підписки</label>
					<div className="col-sm-9">
						<input id="tierName" type="text" className="form-control"
							onChange={(e) => setFormData({ ...formData, tierName: e.target.value })}
							value={formData.tierName}
							required
						/>
					</div>
				</div>

				<div className="form-group row mb-lg-4">
					<label htmlFor="price" className="col-sm-3 col-form-label">Сума за місяць</label>
					<div className="col-sm-9">
						<div className="input-group mb-3 price-and-currency">
							<input id="price" type="number" min="5" max="29000" className="form-control" required
								value={formData.price}
								onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
							<select id="currency" className="form-control custom-select input-group-append"
								value={formData.currency}
								onChange={(e) => setFormData({ ...formData, currency: e.target.value })}>
								{widgetCurrencies.map((item, i) =>
									<option key={item.label} value={item.label}>{item.sign} {item.label}</option>
								)}
							</select>
						</div>
					</div>
				</div>

				<div className="form-group row mb-lg-4">
					<label htmlFor="buttonName" className="col-sm-3 col-form-label">Кнопка</label>
					<div className='col-sm-9'>
						<div className="input-group">
							<input id="buttonName" className="form-control"
								value={formData.buttonName}
								onChange={(e) => setFormData({ ...formData, buttonName: e.target.value })}
								required />
						</div>
					</div>
				</div>

				<div className="form-group row mb-lg-4">
					<label htmlFor="description" className="col-sm-3 col-form-label">Опис підписки</label>
					<div className="col-sm-9">
						<textarea id="description" className="form-control description"
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							required />
					</div>
				</div>

				<div className="form-group row grey-line-bottom mb-lg-4">
					<label htmlFor="image" className="col-sm-3 col-form-label">
						Картинка
					</label>
					<div className="col-sm-9">
						{formData.image?.url && (
							<>
								<img id="image" alt={formData.image.name} src={formData.image.url} className="preview-image" />
								<div className="container-delete-image">
									<span className='image-name'>{formData.image.name}</span>
									<i className="fas fa-trash-alt" onClick={() => onRemoveElement('image')}></i>
								</div>
							</>
						)}

						<button className='btn btn-dark choose-image-btn' type='button' onClick={() => setModalVisible(true)}>
							{formData.image?.url ? 'Змінити' : 'Обрати'} картинку
						</button>

						{formData.image?.url && (
							<div className="form-group form-check d-flex align-items-end mb-0 mt-4">
								<input
									type="checkbox"
									className="form-check-input"
									id="largeImage"
									checked={formData.largeImage}
									onChange={(e) => setFormData({ ...formData, largeImage: e.target.checked })}
								/>
								<label className="form-check-label grey-text ml-3" htmlFor="largeImage">
									Більше місця для картинки
								</label>
							</div>
						)}
					</div>
				</div>

				<div className="form-group row mb-lg-4">
					<label htmlFor="forSale" className="col-sm-3 col-form-label">
						Pекомендувати
					</label>
					<div className="col-sm-9">
						<div className='d-flex justify-content-between form-text'>
							<div className="grey-text pr-3">
								Рекомендувати як найкращий план підписки
							</div>

							<Switch id="forSale"
								checked={formData.forSale}
								onChange={(forSale) => setFormData({ ...formData, forSale })}
								height={24}
								width={45}
								onColor="#3579F6"
							/>
						</div>
					</div>
				</div>

				<div className="form-group row mb-lg-4">
					<label htmlFor="isLimitedSubscribers" className="col-sm-3 col-form-label">
						Ліміт підписників
					</label>
					<div className="col-sm-9">
						<div className='d-flex justify-content-between form-text mb-2'>
							<div className="grey-text pr-3">
								Ви можете вказати максимальну кількість підписників для цього рівня
							</div>
							<Switch id="isLimitedSubscribers"
								checked={formData.isLimitedSubscribers}
								onChange={(isLimitedSubscribers) => setFormData({ ...formData, isLimitedSubscribers })}
								height={24}
								width={45}
								onColor="#3579F6"
							/>
						</div>
						{formData.isLimitedSubscribers && (
							<div className="input-group">
								<input id="limitedSubscribers" type="number" className="form-control" required
									value={formData.limitedSubscribers}
									onChange={(e) => setFormData({
										...formData,
										limitedSubscribers: e.target.value
									})} />
							</div>
						)}
					</div>
				</div>

				<div className="form-group row mb-lg-4">
					<label htmlFor="discordRole" className="col-sm-3 col-form-label">
						{Badge()}
						Discord ролі
					</label>
					<div className="col-sm-9">
						<div className='d-flex justify-content-between form-text mb-2'>
							<div className="mb-1 pr-3">
								<a href="/help/discord-bot" target="_blank" rel="noopener noreferrer">
									Як додати Donatello Discord Bot на свій сервер
								</a>
							</div>
							<Switch id="discordRole"
								disabled={discordRoles.length === 0}
								checked={formData.discordRole}
								onChange={(discordRole) => setFormData({...formData, discordRole})}
								height={24}
								width={45}
								onColor="#3579F6"
							/>
						</div>
						{formData.discordRole && (
							<div className='form-text mb-3'>
								<div className="grey-text mb-2">
									Discord ролі
								</div>

								<MultiSelect
									items={discordRoles}
									initialSelectedItems={initialSelectedDiscordRoles}
									handleSelectChange={handleRoleChange}
									placeholder='Оберіть Discord ролі'
								/>

								{formData.selectedDiscordRoles.length !== 0 && (
									<div className='d-flex align-items-center mt-3'>
										<button className="btn btn-dark choose-image-btn mr-2" type="button" onClick={addDiscordRolesToMe}>
											Видати мені ц{formData.selectedDiscordRoles.length > 1 ? 'і ролі' : 'ю роль'}
										</button>

										<OverlayTrigger
											placement="top"
											overlay={
												<Tooltip id="tooltip">
													Натисніть кнопку “Видати мені ці ролі” і перейдіть в Discord щоб перевірити чи присвоїлись ролі.
													<br /><br />
													Якщо ролі не присвоїлись перевірте правильність налаштування Discord бота.
												</Tooltip>
											}
										>
											<div className='info-icon-wrapper'>
												<i className="fa-solid fa-info"></i>
											</div>
										</OverlayTrigger>
									</div>
								)}
							</div>
						)}

						{formData.discordRole && formData.selectedDiscordRoles.length !== 0 && (
							<div className='d-flex justify-content-between form-text mb-2'>
								<div className="grey-text pr-3">
									Додати ролі активним підписникам у діскорді
								</div>
								<Switch id="addRolesToCurrentSubscriber"
									checked={formData.addRolesToCurrentSubscriber}
									onChange={(addRolesToCurrentSubscriber) => setFormData({
										...formData,
										addRolesToCurrentSubscriber
									})}
									height={24}
									width={45}
									onColor="#3579F6"
								/>
							</div>
						)}
					</div>
				</div>

				<div className="form-group row grey-line-bottom mb-lg-4">
					<label htmlFor="tgBotInvite" className="col-sm-3 col-form-label">
						{Badge()}
						Телеграм канали
					</label>
					<div className="col-sm-9">
						<div className='d-flex justify-content-between form-text mb-2'>
							<div className="mb-1 pr-3">
								<a href="/help/telegram-bot" target="_blank" rel="noopener noreferrer">
									Як додати Telegram bot до свого каналу
								</a>
							</div>
							<Switch id="tgBotInvite"
								checked={formData.tgBotInvite}
								onChange={(tgBotInvite) => setFormData({...formData, tgBotInvite})}
								height={24}
								width={45}
								onColor="#3579F6"
							/>
						</div>

						{formData.tgBotInvite && (
							<>
								<div className="grey-text mb-2">
									Telegram канали
								</div>

								<MultiSelect
									items={tgChats}
									initialSelectedItems={formData.tgChats}
									handleSelectChange={handleTgChatsChange}
									placeholder='Оберіть Telegram канали'
								/>
							</>
						)}

						{formData.tgBotInvite && formData.tgChats.length !== 0 && (
							<div className='d-flex justify-content-between form-text mb-2 mt-3'>
								<div className="grey-text pr-3">
									Надіслати запрошення всім підписникам ще раз (новим та старим)
								</div>
								<Switch id="inviteUsersToChannel"
									checked={formData.inviteUsersToChannel}
									onChange={(inviteUsersToChannel) => setFormData({
										...formData,
										inviteUsersToChannel
									})}
									height={24}
									width={45}
									onColor="#3579F6"
								/>
							</div>
						)}
					</div>
				</div>

				{visible && (
					<Modal
						isOpen={visible}
						toggleModal={() => setModalVisible(false)}
						multiselect={false}
						rowOpened="images"
						saveSelectedMedia={(e, items) => {
							setSelected(e, items);
							setModalVisible(false);
						}}
						selectedItems={{ images: [formData.image?.id || null] }}
					/>
				)}

				<div className="form-group row mb-0">
					<div className="col-sm-12 d-flex justify-content-between">
						<button className="btn btn-outline-dark cancel-button" onClick={onCancel}>
							Скасувати
						</button>
						<button className="btn btn-primary confirm-button" type="submit">
							Опублікувати
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default TierItem;
