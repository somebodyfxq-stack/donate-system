import moment from 'moment';
import 'moment/locale/uk';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CSVDownload } from 'react-csv';
import { ConfirmModal } from '../../coms/modal/ConfirmModal';
import SelectComponent from '../../coms/misc/CustomSelect';
import AuthorsToModerateContainer from '../../coms/misc/AuthorsToModerateContainer';

import { api } from '../../services/api';
import { messageService } from '../../services/messageService';
import { history } from '../../utils';
import { confirmRemoveModal } from '../../utils/confirmRemoveModal';
import helpers from '../../utils/helpers';
import '../../css/subscriptions.css';

const TierStatus = { active: 'active', deactivated: 'deactivated', paused: 'paused' };

const subscriptionStatus = [
	{
		id: 'all',
		label: 'Всі статуси'
	},
	{
		id: 'active',
		label: 'Активна'
	},
	{
		id: 'paused',
		label: 'Призупинена'
	},
	{
		id: 'deactivated',
		label: 'Деактивована'
	}
];

const defaultColumns = {
	socialNamesColumn: true,
	subscriptionColumn: true,
	dateOfSubscriptionColumn: true,
	dateOfCancellationColumn: false,
	statusColumn: true
};

const columns = [
	{
		id: 'socialNamesColumn',
		label: 'Discord/Twitch'
	},
	{
		id: 'subscriptionColumn',
		label: 'Підписка'
	},
	{
		id: 'dateOfSubscriptionColumn',
		label: 'Дата підписки'
	},
	{
		id: 'dateOfCancellationColumn',
		label: 'Дата скасування'
	},
	{
		id: 'statusColumn',
		label: 'Статус'
	}
];

const PaymentStatusMap = {
	Refunded: 'Повернення',
	Declined: 'Відміна',
	Approved: 'Оплата успішна'
}

const moderationType = 'subscribers';

const INITIAL_LIMIT = 20;

const Subscribers = () => {
	const queryParams = new URLSearchParams(history.location.search);
	const initialSelectedItem = queryParams.get('selectedSubscription') || '1';
	const initialSubStatus = queryParams.get('subStatus') || 'all';
	const initialSearch = queryParams.get('search') || '';

	const [subscriptionTiers, setSubscriptionTiers] = useState([]);
	const [authors, setAuthors] = useState([]);
	const [activeAuthor, setActiveAuthor] = useState('');
	const [isLoading, setIsLoading] = useState(true);

	const [allUsers, setAllUsers] = useState([]);
	const [selectedItem, setSelectedItem] = useState(initialSelectedItem);
	const [subStatus, setSubStatus] = useState(initialSubStatus);
	const [search, setSearch] = useState(initialSearch);
	const [downloadCSV, setDownloadCsv] = useState(false);
	const [tierMap, setTierMap] = useState({});
	const [exportData, setExportData] = useState([]);
	const [isModalOpen, toggleModalOpen] = useState(false);
	const [subscriptionToPause, setSubscriptionPaused] = useState(null);
	const [isEditNameModalOpen, toggleEditNameModalOpen] = useState(false);
	const [newClientName, setNewClientName] = useState('');
	const [subscriptionToChangeName, setSubscriptionToChangeName] = useState(null);
	const [sortOrderActive, setSortOrderActive] = useState(false);
	const [sortOrderNotActive, setSortOrderNotActive] = useState(false);
	const [expandedRow, setExpandedRow] = useState(null);
	const [prevSubscriptionId, setPrevSubscriptionId] = useState(null);
	const [orders, setOrders] = useState([]);
	const [currentLimit, setCurrentLimit] = useState(INITIAL_LIMIT);

	const [subscribersColumns, setSubscribersColumns] = useState(() => {
		const savedColumns = localStorage.getItem('subscribersColumns');
		return savedColumns ? JSON.parse(savedColumns) : defaultColumns;
	});

	const replaceImage = 'https://donatello.to/img/userpic-placeholder-02.png';

	const noSubscribers = allUsers.length === 0;

	const getAuthorsToModerate = useCallback(async () => {
		const resp = await api.getAuthorsToModerate(moderationType);

		setAuthors([...resp.data]);
	}, [])

	const getAllTiers = useCallback(async (authorId) => {
		const resp = await api.getAllSubscribers(authorId, moderationType);
		const { allSubscribers, tierRecords } = resp.data;

		const data = [{
			id: '1',
			label: 'Всі підписки'
		}];
		const newTierMap = {};

		tierRecords.forEach((item) => {
			data.push({
				id: item._id,
				label: item.tierName
			});

			newTierMap[item._id] = item.tierName;
		});

		setTierMap({ ...newTierMap });
		setAllUsers([...allSubscribers]);
		setSubscriptionTiers([...data]);
		setIsLoading(false);
	}, []);

	const getUserPayments = useCallback(async (subscriptionId, limit) => {
		const resp = await api.getUserPayments(subscriptionId, limit);
		const { orders } = resp;

		setOrders(orders);
	}, []);

	useEffect(() => {
		getAllTiers();
	}, [getAllTiers]);

	useEffect(() => {
		getAuthorsToModerate();
	}, [getAuthorsToModerate]);

	useEffect(() => {
		const newParams = new URLSearchParams();
		newParams.set('selectedSubscription', selectedItem);
		newParams.set('subStatus', subStatus);
		newParams.set('search', search);
		history.push({ search: newParams.toString() });
	}, [selectedItem, subStatus, search]);

	useEffect(() => {
		localStorage.setItem('subscribersColumns', JSON.stringify(subscribersColumns));
	}, [subscribersColumns]);

	const getSubscriptionStatus = useCallback((isActive, subscriptionStatus) => {
		if (!isActive) return (
			<div className='subscription-bage-not-active mr-0'>
				<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
					<circle cx="3" cy="3" r="3" fill="#8D939C" />
				</svg>
				<span className='title'>Не активна</span>
			</div>
		);

		if (['pending', 'paused'].includes(subscriptionStatus)) return (
			<div className='subscription-bage-pending mr-0'>
				<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
					<circle cx="3" cy="3" r="3" fill="#E2A417" />
				</svg>
				<span className='title'>Очікується</span>
			</div>
		);

		return (
			<div className="subscription-bage-active mr-0">
				<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
					<circle cx="3" cy="3" r="3" fill="#5EA782"></circle>
				</svg>
				<span className="title ml-1">Активна</span>
			</div>
		);
	}, []);

	const sortByCreatedAt = useCallback((items, order) => {
		return order === 'asc'
			? [...items].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
			: [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
	}, []);

	const sortByPausedAt = useCallback((items, order) => {
		return [...items].sort((a, b) => {
			const dateA = a.pausedAt || a.deactivatedAt || 0;
			const dateB = b.pausedAt || b.deactivatedAt || 0;
			return order === 'asc' ? new Date(dateA) - new Date(dateB) : new Date(dateB) - new Date(dateA);
		});
	}, []);

	const toggleSortOrder = useCallback((type) => {
		if (type === 'active') {
			setSortOrderNotActive(false);
			setSortOrderActive(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
		}

		if (type === 'notActive') {
			setSortOrderActive(false);
			setSortOrderNotActive(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
		}
	}, [setSortOrderActive, setSortOrderNotActive]);

	const allFilteredUsers = useMemo(() => {
		let items = [...allUsers];

		if (selectedItem !== '1') {
			items = items.filter(sub => sub.tierId === selectedItem);
		}

		if (subStatus !== 'all') {
			items = items.filter(sub => sub.subscriptionStatus === subStatus);
		}

		if (search.trim() !== '') {
			items = items.filter(sub => sub.clientName.toLowerCase().includes(search.trim().toLowerCase()));
		}

		if (subStatus === TierStatus.paused || subStatus === TierStatus.deactivated) {
			items = sortByPausedAt(items, sortOrderNotActive || 'desc');
		}

		if (sortOrderActive) {
			items = sortByCreatedAt(items, sortOrderActive);
		}

		if (sortOrderNotActive) {
			items = sortByPausedAt(items, sortOrderNotActive);
		}

		return items;
	}, [allUsers, selectedItem, subStatus, search, sortOrderActive, sortOrderNotActive, sortByCreatedAt, sortByPausedAt]);

	const onDownloadCsvClick = useCallback(() => {
		const newExportData = [[
			'Назва підписки',
			'Ім\'я',
			'Дата',
			'Статус',
			'Сума'
		]];

		const addNewExport = (donate) => {
			newExportData.push([
				tierMap[donate.tierId],
				donate.clientName,
				moment(donate.createdAt).format('DD MMMM, HH:mm'),
				donate.isActive ? 'Активна' : 'Деактивована',
				donate.amount
			]);
		};

		allFilteredUsers.forEach(donate => addNewExport(donate));

		setExportData([...newExportData]);
		setTimeout(() => {
			setDownloadCsv(true);
		}, 500);

		setTimeout(() => {
			setDownloadCsv(false);
		}, 1000);
	}, [tierMap, allFilteredUsers]);

	const onPauseSubscription = useCallback(async () => {
		if (subscriptionToPause) {
			const { subscriptionId } = subscriptionToPause;
			const resp = await api.changeUserSubscription({
				subscriptionId,
				status: "paused"
			});
			const pausedDate = new Date();

			messageService.success(resp.message);
			toggleModalOpen(false);

			if (resp.success) {
				allUsers.forEach(user => {
					if (user.subscriptionId === subscriptionId) {
						user.subscriptionStatus = 'paused';
						user.pausedAt = pausedDate;
					}

					return user;
				})

				setAllUsers([...allUsers]);
			}
		}
	}, [subscriptionToPause, allUsers]);

	const provideDiscordRoles = useCallback(async () => {
		const data = await api.provideDiscordRoles(activeAuthor, moderationType)
			.catch(e => {
				messageService.error('Ой, щось пішло не так, можливо, забагато спроб');
			});

		data?.message && messageService.success(data.message);
	}, [activeAuthor]);

	const provideTgInviteLink = useCallback(async () => {
		const data = await api.provideTgInviteLink(activeAuthor, moderationType)
			.catch(e => {
				messageService.error('Ой, щось пішло не так, можливо, забагато спроб');
			});

		data?.message && messageService.success(data.message);
	}, [activeAuthor]);

	const editClientName = useCallback(async () => {
		if (!subscriptionToChangeName) {
			return;
		}

		const { subscriptionId } = subscriptionToChangeName;
		const resp = await api.changeSubscriptionsClientName({
			subscriptionId,
			clientName: newClientName
		});

		if (resp.success) {
			setAllUsers(prevUsers => prevUsers.map(user => {
				if (user.subscriptionId === subscriptionId) {
					return { ...user, clientName: newClientName };
				}
				return user;
			}));
		}

		toggleEditNameModalOpen(false);
		messageService.success(resp.message);
	}, [subscriptionToChangeName, newClientName]);

	const onChange = useCallback((e) => {
		const id = e.target.id;
		const checked = e.target.checked;

		setSubscribersColumns((prevState) => ({
			...prevState,
			[id]: checked
		}));
	}, []);

	const NoSubscribersContainer = useMemo(() => {
		return (
			<div className="d-flex flex-column align-items-center no-subscribers">
				<i className="fa-solid fa-user-group"></i>
				<h5 className="text-center my-3"><strong>У вас ще немає підписників</strong></h5>
				<span>Тут будуть відображатись деталі по ваших підписниках та інформація про транзакції</span>
			</div>
		)
	}, []);

	const IsLoadingContainer = useMemo(() => {
		return (
			<div className="d-flex flex-column align-items-center no-subscribers">
				<i className="fa-regular fa-hourglass-half"></i>
				<h5 className="text-center my-3"><strong>Отримуємо дані</strong></h5>
			</div>
		)
	}, []);

	const TotalContainer = useMemo(() => {
		return <div className="filter-row form-group d-flex">
			<div className="row justify-content-between w-100">
				<div className="col-12 col-md-6 col-xl-3 search-field pr-0 ">
					<div className="input-group">
						<div className="input-group-prepend">
							<span className="input-group-text">
								<img src="/img/home-assets/search.svg" alt="search" />
							</span>
						</div>

						<input id="search" type="text" className="form-control"
							placeholder='Пошук' value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</div>

				<div className='row col-12 col-md-12 col-xl-9 mx-0 px-0 px-xl-2'>
					<div className="col-6 col-md-4 col-lg-4 mt-3 mt-xl-0 pr-0 ">
						{subscriptionTiers.length > 0 && (
							<SelectComponent
								options={subscriptionTiers}
								value={subscriptionTiers.find((item) => item.id === selectedItem)}
								setSelectItem={setSelectedItem}
							/>
						)}
					</div>
					<div className="col-6 col-md-4 col-lg-4 mt-3 mt-xl-0 pr-0">
						<SelectComponent
							options={subscriptionStatus}
							value={subscriptionStatus.find((item) => item.id === subStatus)}
							setSelectItem={setSubStatus}
						/>
					</div>
					<div className="col-12 col-md-4 col-lg-4 mt-3 mt-xl-0 d-flex pr-0">
						<button type="button" className="btn btn-outline-secondary"
							disabled={allUsers.length === 0}
							title="завантажити CSV"
							onClick={onDownloadCsvClick}>
							<i className="fa-solid fa-cloud-arrow-down mr-2"></i>
							<span className="d-inline-block">CSV</span>
						</button>

						<div className="dropdown ml-3">
							<div className="dropdown-toggle settings-btn pointer" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								<i className="fa-solid fa-gear"></i>
							</div>
							<div className="dropdown-menu dropdown-menu-right column-settings">
								{columns.map((column, i) => (
									<div key={i} className='form-check d-flex align-items-center column-settings-item'>
										<input
											type="checkbox"
											className="form-check-input column-settings-checkbox"
											id={column.id}
											checked={subscribersColumns[column.id]}
											onChange={onChange}
										/>
										<label className="column-settings-label mb-0 ml-3 mt-1" htmlFor={column.id}>
											{column.label}
										</label>
									</div>
								))}
							</div>
						</div>

						<div className="dropdown ml-3">
							<div className="dropdown-toggle settings-btn pointer" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								<i className="fa-solid fa-ellipsis"></i>
							</div>
							<div className="dropdown-menu dropdown-menu-right action-buttons">
								<div className="dropdown-item" onClick={provideDiscordRoles}>
									<div className='icon'><i className='fa-brands fa-discord'></i></div>
									Видати Діскорд ролі
								</div>
								<div className="dropdown-item" onClick={provideTgInviteLink}>
									<div className='icon'><i className='fa-brands fa-telegram'></i></div>
									Надіслати запрошення до Тг каналу
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>;
	}, [selectedItem, subscriptionTiers, onDownloadCsvClick,
		subStatus, search, allUsers.length, subscribersColumns, onChange,
		provideDiscordRoles, provideTgInviteLink
	]);

	const toggleRow = useCallback((mainPubOrderId, subscriptionId) => {
		setExpandedRow(expandedRow === mainPubOrderId ? null : mainPubOrderId);

		if (subscriptionId !== prevSubscriptionId) {
			getUserPayments(subscriptionId, 0);
			setPrevSubscriptionId(subscriptionId);
		}

		setCurrentLimit(INITIAL_LIMIT);
	}, [expandedRow, prevSubscriptionId, getUserPayments]);

	const loadMore = useCallback((subscriptionId) => {
		const newLimit = currentLimit + 20;

		setCurrentLimit(newLimit);
		getUserPayments(subscriptionId, newLimit);
	}, [currentLimit, getUserPayments]);

	const tableBody = useCallback((user, i) => {
		const isExpanded = expandedRow === user.mainPubOrderId;

		return (
			<React.Fragment key={user.mainPubOrderId || (user.createdAt + i)}>
				<tr id={user.mainPubOrderId} onClick={() => toggleRow(user.mainPubOrderId, user.subscriptionId)}>
					<th scope="row" className='number-column'>{i + 1}</th>
					<td className="text-left">
						<div className="d-flex align-items-center">
							<img className="subscriber-image" alt="user-avatar"
								src={user.photo || replaceImage}
								onError={() => replaceImage}></img>
							<div className='subscriber-info'>
								<span>{user.clientName}</span>
								<span className='email'>{user.clientEmail}</span>
							</div>
						</div>
					</td>
					<td className="text-center px-0">
						<div className='d-flex align-items-center subscriber-icons'>
							<i className="fa-solid fa-user-pen mr-2" title="Змінити ім'я"
								onClick={(e) => {
									e.stopPropagation();
									setSubscriptionToChangeName(user);
									setNewClientName(user.clientName);
									toggleEditNameModalOpen(true);
								}}>
							</i>
							<a href={`/panel/messages?id=${user.clientUserId}`} target="_blank"
								rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
							>
								<i className="fa-regular fa-envelope" title="Надіслати повідомлення"></i>
							</a>
						</div>
					</td>
					{subscribersColumns.socialNamesColumn && <td className="text-left social-names-column">
						<div className='subscriber-info'>
							{user.discordName && (
								<div className='d-flex align-items-center'>
									<i className="fa-brands fa-discord mr-2"></i>
									<span className='social-names'>{user.discordName}</span>
								</div>
							)}
							{user.twitchName && (
								<div className='d-flex align-items-center'>
									<i className="fa-brands fa-twitch mr-2"></i>
									<span className='social-names'>{user.twitchName}</span>
								</div>
							)}
							{!user.discordName && !user.twitchName && (
								<div className='d-flex align-items-center'>
									<span>-</span>
								</div>
							)}
						</div>
					</td>}
					{subscribersColumns.subscriptionColumn && <td className="text-left subscription-column">
						{tierMap[user.tierId]}
						<div className="badge subscription-new">
							{user.successPayments === 1 ? 'Нова!' : `x${user.successPayments}`}
						</div>
					</td>}
					{subscribersColumns.dateOfSubscriptionColumn && <td className="text-left date-of-subscription-column">
						<div className='subscription-date'>
							<span>{moment(user.createdAt).format('L')}</span>
							<span className='time'>{moment(user.createdAt).format('HH:mm')}</span>
						</div>
					</td>}
					{subscribersColumns.dateOfCancellationColumn && <td className="text-left date-of-cancellation-column">
						{user.pausedAt
							? (
								<div className='subscription-date'>
									<span>{moment(user.pausedAt).format('L')}</span>
									<span className='time'>{moment(user.pausedAt).format('HH:mm')}</span>
								</div>
							) : user.deactivatedAt
								? (
									<div className='subscription-date'>
										<span>{moment(user.deactivatedAt).format('L')}</span>
										<span className='time'>{moment(user.deactivatedAt).format('HH:mm')}</span>
									</div>
								) : '-'}
					</td>}
					{subscribersColumns.statusColumn && <td className="text-center status-column">
						{getSubscriptionStatus(user.isActive, user.subscriptionStatus)}
					</td>}
					<td className="text-right amount-column"><strong>{user.amount} {helpers.getCurrencySign(user.currency)}</strong></td>
					<td className="text-right subscriber-icons action-column">
						<div className="dropdown">
							<div className="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								<i className="fa-solid fa-ellipsis" onClick={(e) => e.stopPropagation()}></i>
							</div>
							<div className="dropdown-menu action">
								<div className={`dropdown-item ${!user.isActive || user.subscriptionStatus === "paused" ? 'disabled' : ''}`}
									onClick={(e) => {
										e.stopPropagation();
										setSubscriptionPaused(user);
										toggleModalOpen(true);
									}}
								>
									Призупинити
								</div>
								<div className='dropdown-item' onClick={() => toggleRow(user.mainPubOrderId, user.subscriptionId)}>Всі транзакції</div>
							</div>
						</div>
					</td>
				</tr>
				{isExpanded && (
					<tr>
						<td colSpan="5">
							<table className="table transactions mt-0">
								<thead>
									<tr>
										<th className="text-left">Підписка</th>
										<th className="text-left">Дата списання</th>
										<th className="text-left">Статус оплати</th>
										<th className="text-right">Сума</th>
									</tr>
								</thead>
								<tbody>
									{orders.length === 0 ? (
										<tr>
											<td colSpan="5" className='text-center'>Завантаження...</td>
										</tr>
									) : (
										orders.map((order, i) => (
											<tr key={i}>
												<td>{tierMap[user.tierId] || '-'}</td>
												<td>
													<div className='subscription-date flex-row'>
														<span>{moment(order.createdAt).format('L')},</span>
														<span className='time ml-2'>{moment(order.createdAt).format('HH:mm')}</span>
													</div>
												</td>
												<td>
													<span className="subscription-bage-success">{PaymentStatusMap.Approved}</span>
												</td>
												<td className='text-right'>{order.amount} {helpers.getCurrencySign(order.currency)}</td>
											</tr>
										))
									)}
									{orders.length >= 20 && (
										<tr>
											<td colSpan="5" className='text-center'>
												<button type='button' className='btn btn-outline-dark'
													onClick={() => loadMore(user.subscriptionId)}>
													Завантажити більше
												</button>
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</td>
					</tr>
				)}
			</React.Fragment>
		);
	}, [expandedRow, tierMap, orders, subscribersColumns, toggleRow, getSubscriptionStatus, loadMore]);

	const UserContainer = useMemo(() => {
		return <section>
			<table className="table table-responsive">
				<thead>
					<tr>
						<th scope="col" className='number-column'>№</th>
						<th scope="col" className="text-left">Ім'я</th>
						<th scope="col"></th>
						{subscribersColumns.socialNamesColumn && <th scope="col" className="text-left social-names-column">Discord/Twitch</th>}
						{subscribersColumns.subscriptionColumn && <th scope="col" className="text-left subscription-column">Підписка</th>}
						{subscribersColumns.dateOfSubscriptionColumn && (
							<th scope="col" className="text-left date-of-subscription-column" onClick={() => toggleSortOrder("active")}>
								<span>Дата підписки </span>
								{sortOrderActive === 'asc' && <i className="fa-solid fa-caret-up"></i>}
								{sortOrderActive === 'desc' && <i className="fa-solid fa-caret-down"></i>}
							</th>
						)}
						{subscribersColumns.dateOfCancellationColumn && (
							<th scope="col" className="text-center date-of-cancellation-column" onClick={() => toggleSortOrder("notActive")}>
								<span>Дата скасування </span>
								{sortOrderNotActive === 'asc' && <i className="fa-solid fa-caret-up"></i>}
								{sortOrderNotActive === 'desc' && <i className="fa-solid fa-caret-down"></i>}
							</th>
						)}
						{subscribersColumns.statusColumn && <th scope="col" className="text-left status-column">Статус</th>}
						<th scope="col" className="text-right amount-column">Сума</th>
						<th scope="col" className="text-right action-column">Дія</th>
					</tr>
				</thead>
				<tbody>
					{allFilteredUsers.map((user, i) => tableBody(user, i))}
					{/* {this.renderTotalRow(item)} */}
				</tbody>
			</table>
		</section>;
	}, [allFilteredUsers, tableBody, toggleSortOrder, sortOrderActive, sortOrderNotActive, subscribersColumns]);

	const DownloadCSVContainer = useMemo(() => {
		return (
			downloadCSV && (
				<div className="col-sm-1" aria-describedby="downloadCSV">
					<CSVDownload data={exportData} target="_blank" />
				</div>
			)
		);
	}, [downloadCSV, exportData]);

	const editClientNameModal = useCallback(() => {
		return (
			<ConfirmModal isModalOpen={isEditNameModalOpen} toggleModal={toggleEditNameModalOpen}>
				<h4 className='text-center'><strong>Змінити ім’я підписника</strong></h4>
				<div className='text-disclaimer mt-3'>Зміна імені буде тільки для цієї підписки. Зміна імені буде відображатись лише вам.</div>

				<input id="setNewClientName" type="text" className="form-control my-4"
					placeholder="Введіть нове ім'я" value={newClientName}
					onChange={(e) => setNewClientName(e.target.value)}
				/>

				<div className="d-flex justify-content-between">
					<button type="button" className="btn secondary-button"
						onClick={() => toggleEditNameModalOpen(false)}
					>
						Скасувати
					</button>
					<button type="button" className="btn add-widget btn-dark"
						onClick={editClientName}
					>
						Зберегти
					</button>
				</div>
			</ConfirmModal>
		)
	}, [isEditNameModalOpen, newClientName, editClientName]);

	if (isLoading) {
		return (
			<div className="subscription">
				{IsLoadingContainer}
			</div>
		)
	}

	return (
		<div className="subscription">
			{authors.length !== 0 && (
				<AuthorsToModerateContainer
					authors={authors}
					activeAuthor={activeAuthor}
					setActiveAuthor={setActiveAuthor}
					getData={getAllTiers}
				/>
			)}
			{noSubscribers ? (
				NoSubscribersContainer
			) : (
				<>
					{TotalContainer}
					{UserContainer}
				</>
			)}
			{DownloadCSVContainer}
			{confirmRemoveModal({
				confirm: () => onPauseSubscription(),
				cancel: () => toggleModalOpen(false),
				isModalOpen,
				title: 'Ви дійсно бажаєте відмінити цю підписку?',
				text: 'Ви не зможете поновити її згодом!'
			})}
			{editClientNameModal()}
		</div>
	);
};

export default Subscribers;
