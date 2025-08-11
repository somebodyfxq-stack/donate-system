import moment from 'moment';
import 'moment/locale/uk';

import '../../css/messages.css';
import React, {useCallback, useEffect, useState} from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {connect} from 'react-redux';
import Switch from 'react-switch';
import PageNavigationTabs from '../../coms/misc/PageNavigationTabs';
import CreateWelcomeMessageModal from '../../coms/modal/CreateWelcomeMessageModal';
import {getAmountInUAH} from '../../enums/PaymentEnums';
import {api} from '../../services/api';
import {messageService} from '../../services/messageService';
import {confirmRemoveModal} from '../../utils/confirmRemoveModal';
import helpers from '../../utils/helpers';
import Chats from './Chats';
import '../../css/textEditor.css';

const tabs = [
	{
		id: 1,
		route: 'chats',
		title: 'Чати'
	}, {
		id: 2,
		route: 'mailing',
		title: 'Розсилка'
	},
	{
		id: 3,
		route: 'welcome-messages',
		title: 'Вітальні повідомлення'
	}
];

const Messages = ({userId, photo}) => {
	const [activeTab, setActiveTab] = useState(tabs[0].id);
	const [useMainForAll, onUseMainForAll] = useState(true);
	const [allTiers, setAllTier] = useState([]);
	const [allActiveTiers, setAllActiveTier] = useState([]);
	const [tierMessages, setTierMessages] = useState([]);
	const [selectedSubscription, setSelectedSubscription] = useState('');
	const [tierMessage, setTierMessage] = useState('');
	const [alreadyCalled, setAlreadyCalled] = useState({1: false, 2: false, 3:false});
	const [isModalOpen, toggleModalOpen] = useState(false);
	const [messageToRemove, setMessageToRemove] = useState();
	const [isMessageEdit, setMessageEdit] = useState(false);

	const [templates, onChangeTemplates] = useState({generalEmailText: ''});

	const getData = useCallback(async () => {
		const tierData = await api.getAllUserTiers();

    tierData.tierRecords = tierData.tierRecords.sort((a, b) => getAmountInUAH(b.price, b.currency) - getAmountInUAH(a.price, a.currency));
		setAllTier([...tierData.tierRecords]);

		const filteredTiers = tierData.tierRecords.filter(tier => tier.activeMembers);
		setAllActiveTier([...filteredTiers]);

		const filteredId = filteredTiers[0]?._id || '';
		setSelectedSubscription(filteredId);
	}, []);

	const getMailingMessages = useCallback(async () => {
		const resp = await api.getTierMessages();
		setTierMessages([...resp.tierMessages]);
	}, [])

	const getWelcomeMessages = useCallback(async () => {
		const welcomeEmail = await api.getWelcomeEmails();

		onChangeTemplates({...welcomeEmail.templates});
		onUseMainForAll(welcomeEmail.useMainForAll);
	}, [])

	const removeWelcomeMessages = useCallback(async (id) => {
		const resp = await api.removeWelcomeEmail(id);

		if (resp.success) {
			messageService.success(resp.message);
		}

		const welcomeEmail = await api.getWelcomeEmails();

		onChangeTemplates({...welcomeEmail.templates});
		onUseMainForAll(welcomeEmail.useMainForAll);
		toggleModalOpen(false);
	}, []);

	useEffect(() => {
		if (!alreadyCalled[activeTab]) {
			setAlreadyCalled({...alreadyCalled, [activeTab]: true})

			if (activeTab === 1) {
				getData();
			}
			if (activeTab === 2) {
				getMailingMessages();
			}
			if (activeTab === 3) {
				getWelcomeMessages();
			}
		}
	}, [activeTab, alreadyCalled, getData, getMailingMessages, getWelcomeMessages]);

	const onTextEditorChanged = useCallback((description, field, source) => {
		if (source !== 'user') return;

		const newTemplates = {...templates};

		newTemplates[field] = description;

		onChangeTemplates({...newTemplates});
	}, [templates]);

	const onMessageEditorChanged = useCallback((description, source) => {
		if (source !== 'user') return;

		setTierMessage(description);
	}, []);

	const onOptionChange = useCallback(async (e) => {
		const value = e.target.value;
		setSelectedSubscription(value);
	}, []);

	const sendMessage = useCallback(async () => {
		const tier = allActiveTiers.find(item => item._id === selectedSubscription);

		const resp = await api.saveTierMessage({message: tierMessage, tierId: selectedSubscription, tierName: tier?.tierName, mailingMessage: true});

		setTierMessages([resp.tierMessages, ...tierMessages]);
		setTierMessage('');

	}, [tierMessage, tierMessages, selectedSubscription, allActiveTiers]);

	const onSave = useCallback(async () => {
		const resp = await api.saveWelcomeEmails({useMainForAll, templates});

		if (resp.success) {
			messageService.success(resp.message);
		}
	}, [templates, useMainForAll]);

	const onRemoveIconClick = useCallback((key) => {
		setMessageToRemove(key);
		toggleModalOpen(true);
	}, []);

	const renderNoMailing = useCallback(() => (
		<div className='d-flex flex-column align-items-center justify-content-center no-mailing messages-item'>
			<i className='fa-regular fa-envelope'></i>
			<h5 className='text-center my-3'><strong>Створіть розсилку для ваших підписників</strong></h5>
			<span>Ви можете створювати різні розсилки для різних рівнів підписок</span>
			<button className='btn btn-dark' data-toggle="modal" data-target="#createMailingModal">Створити розсилку</button>
		</div>
	), []);

	return (
		<>
		<PageNavigationTabs
			tabs={tabs}
			activeTab={activeTab}
			setActiveTab={setActiveTab}
			urlPath='messages'
		/>

		<div className="messages">
			{activeTab === 1 && (
				<Chats userId={userId} photo={photo} />
			)}

			{activeTab === 2 && (
				<section className='messages-section'>
				{tierMessages.length === 0 ? renderNoMailing() : (
					<>
						<div className='messages-item row m-0 align-items-start align-items-md-center'>
							<div className='col-2 col-md-1 p-0'>
								<i className='fa-regular fa-envelope'></i>
							</div>
							<div className='col-10 col-md-7'>
								<div className='title'>Створіть розсилку для ваших підписників</div>
								<span>Ви можете створювати різні розсилки для різних рівнів підписок</span>
							</div>
							<div className='col-12 col-md-4 text-center text-md-right mt-3 mt-md-0 p-0'>
								<button className='btn btn-primary' data-toggle="modal"
										data-target="#createMailingModal">Створити розсилку</button>
							</div>
						</div>

						<div className='messages-item'>
							<h5 className='mb-3'><strong>Ваші розсилки</strong></h5>
							{tierMessages.map((message) =>
								<div key={message._id} className='row message-item align-items-center'>
									<div className='col-12 col-md-3 mb-3 mb-md-0'>
										<div className='mailing-title'>Дата</div>
										<div className='mailing-date'>{moment(message.createdAt).format('DD MMMM YYYY, HH:mm')}</div>
									</div>
									<div className='col-12 col-md-3 mb-3 mb-md-0'>
										<div className='mailing-title'>Рівень</div>
										<div className='mailing-level'>{message.tierName || ''}</div>
									</div>
									<div className='col-12 col-md-6'>
										<div className='mailing-text'
											dangerouslySetInnerHTML={{ __html: message.message }}>
										</div>
									</div>
								</div>
							)}
						</div>
					</>
				)}
				</section>
			)}

			{activeTab === 3 && (
				<section className='messages-section'>
					<div className='messages-item row m-0 align-items-start align-items-md-center'>
						<div className='col-2 col-md-1 p-0'>
							<i className='fa-regular fa-envelope'></i>
						</div>
						<div className='col-10 col-md-11'>
							<div className='title'>Створіть вітальні повідомлення для ваших рівнів підписки</div>
							<span>Вітальне повідомлення буде автоматично відправлятися новим підписникам залежно від рівня підписки</span>
						</div>
					</div>

					<div className='messages-item'>
						<div className='row message-item align-items-center'>
							<div className='col-9 col-md-3'>
								<div className='mailing-level'>Однакове повідомлення для усіх рівнів</div>
							</div>
							<div className='col-3 col-md-9'>
								<Switch id="sameEmailForAll"
									onChange={(checked) => onUseMainForAll(checked)}
									checked={useMainForAll}
									height={24}
									width={45}
									onColor="#3579F6"
								/>
							</div>
						</div>
					</div>

					{useMainForAll && (
						<div className='messages-item'>
							<div className='row message-item align-items-center'>
								<div className='col-12 col-sm-6 col-md-3 mb-3 mb-md-0'>
									<div className='mailing-level'>Всі рівні</div>
								</div>
								{!templates.generalEmailText || templates.generalEmailText === "<p><br /></p>"  ? (
									<div className='col-12 col-sm-6 col-md-9 mb-3 mb-md-0'>
										<button className='btn btn-primary' data-toggle="modal"
											data-target="#createWelcomeMessage_useMainForAll" onClick={() => setMessageEdit(false)}>
											Створити повідомлення
										</button>
									</div>
								) : (
									<>
										<div className='col-10 col-sm-5 col-md-8'>
											<div className='mailing-text' dangerouslySetInnerHTML={{ __html: templates.generalEmailText }}></div>
										</div>
										<div className='col-1 col-sm-1 col-md-1 d-flex flex-column pl-0'>
											<div className='create-welcome-message-icons mb-2'>
												<i className="fa-solid fa-pencil create-welcome-message-icon"
													title="Редагувати" data-toggle="modal" data-target="#createWelcomeMessage_useMainForAll"
													onClick={() => setMessageEdit(true)}></i>
											</div>
											<div className='create-welcome-message-icons'>
												<i className="fa-regular fa-trash-can create-welcome-message-icon"
													title="Видалити" onClick={() => onRemoveIconClick('generalEmailText')}></i>
											</div>
										</div>
									</>
								)}

								<CreateWelcomeMessageModal
									useMainForAll={useMainForAll}
									templates={templates}
									onTextEditorChanged={onTextEditorChanged}
									onSave={onSave}
									isMessageEdit={isMessageEdit}
								/>
							</div>
						</div>
					)}

					{!useMainForAll && (
						<div className='messages-item'>
							{allTiers.map((tier) => (
								<div key={tier._id} className='row message-item align-items-center'>
									<div className='col-12 col-sm-6 col-md-3 mb-3 mb-md-0'>
										<div className='mailing-level'>{tier.tierName}</div>
										<span className='mailing-date'>{tier.price} {helpers.getCurrencySign(tier.currency)}</span>
										<span className='mailing-title'> на місяць</span>
									</div>
									{!templates[tier._id] || templates[tier._id] === "<p><br /></p>" ? (
										<div className='col-12 col-sm-6 col-md-9 mb-3 mb-md-0'>
											<button className='btn btn-primary' data-toggle="modal"
												data-target={`#createWelcomeMessage_${tier._id}`} onClick={() => setMessageEdit(false)}>
												Створити повідомлення
											</button>
										</div>
									) : (
										<>
											<div className='col-10 col-sm-5 col-md-8'>
												<div className='mailing-text' dangerouslySetInnerHTML={{ __html: templates[tier._id] }}></div>
											</div>
											<div className='col-1 col-sm-1 col-md-1 d-flex flex-column pl-0'>
												<div className='create-welcome-message-icons mb-2'>
													<i className="fa-solid fa-pencil create-welcome-message-icon"
														title="Редагувати" data-toggle="modal" data-target={`#createWelcomeMessage_${tier._id}`}
														onClick={() => setMessageEdit(true)}></i>
												</div>
												<div className='create-welcome-message-icons'>
													<i className="fa-regular fa-trash-can create-welcome-message-icon"
														title="Видалити" onClick={() => onRemoveIconClick(tier._id)}></i>
												</div>
											</div>
										</>
									)}

									<CreateWelcomeMessageModal
										useMainForAll={useMainForAll}
										tier={tier}
										templates={templates}
										onTextEditorChanged={onTextEditorChanged}
										onSave={onSave}
										isMessageEdit={isMessageEdit}
									/>
								</div>
							))}
						</div>
					)}

					{confirmRemoveModal({
						confirm: () => removeWelcomeMessages(messageToRemove),
						cancel: () => toggleModalOpen(false),
						isModalOpen
					})}
				</section>
			)}

			<div className="modal fade" id="createMailingModal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel">
				<div className="modal-dialog create-mailing-modal" role="document">
					<div className="modal-content">
						<div className="modal-body">
							<h4 className="mb-lg-4 text-center">Створити розсилку</h4>
							<i className="fa-solid fa-xmark icon-close-modal" data-dismiss="modal"></i>

							<div className="create-mailing-description">
								<span>Після того як ви натиснете кнопку <strong>"Відправити"</strong> ваші підписники відразу отримають розсилку в чаті з вами.</span>
							</div>

							<div className='lable'>Оберіть рівень підписки</div>
							<select id="selectedSubscription" type="text" className="form-control"
								value={selectedSubscription} onChange={onOptionChange}
							>
								{allActiveTiers.map((tier) =>
									<option key={tier._id} value={tier._id}>{tier.tierName} - {helpers.getCurrencySign(tier.currency)}{tier.price}</option>
								)}
							</select>

							<div className='lable'>Повідомлення</div>
							<ReactQuill theme="snow" value={tierMessage}
								onChange={(e, delta, source) => onMessageEditorChanged(e, source)}/>

							<div className="d-flex justify-content-center justify-content-md-end send-message-button-wrapper">
								<button	className="btn btn-dark" data-dismiss="modal"
										disabled={!tierMessage.trim()} onClick={sendMessage}
								>
									Відправити
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

		</div>
		</>
	);
};

function mapStateToProps(state) {
  const { userId, photo } = state.config;

  return { userId, photo };
}

export default connect(mapStateToProps)(Messages);
