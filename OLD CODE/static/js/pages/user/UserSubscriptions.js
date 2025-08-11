import moment from 'moment';
import 'moment/locale/uk';
import React, {useCallback, useEffect, useState} from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
// import ChangeTierModal from '../../components/ChangeTierModal';
import Tooltip from 'react-bootstrap/Tooltip';
import ReactModal from 'react-modal';
import PageNavigationTabs from '../../coms/misc/PageNavigationTabs';

import {api} from '../../services/api';

import '../../css/subscriptions.css';
import {messageService} from '../../services/messageService';
import helpers from '../../utils/helpers';

const customStyles = {
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		padding: '32px',
		borderRadius: '20px',
		transform: 'translate(-50%, -50%)',
		height: '90%',
		width: '1300px',
		maxWidth: '90%',
		zIndex: '99',
		overflowX: 'hidden',
	},
	'@media (max-width: 576px)': {
		padding: '0!important',
		maxWidth: '100%!important',
	}

};

const tabs = [{
	id: 1,
	route: 'main',
	title: 'Підписки'
}, {
	id: 2,
	route: 'history',
	title: 'Історія оплат'
}];

const PaymentStatusMap = {
	Refunded: 'Повернення',
	refunded: 'Повернення',
	Expired: 'Неоплачений',
	expired: 'Неоплачений',
	Declined: 'Відміна',
	declined: 'Відміна',
	Approved: 'Оплата успішна',
	approved: 'Оплата успішна',
	Paid: 'Оплата успішна',
	paid: 'Оплата успішна'
};

const replaceImage = '/img/userpic-placeholder-02.png';

const UserSubscriptions = () => {
	const [allSubscriptions, setAllSubscriptions] = useState([]);
	const [subStatusData, setSubStatusData] = useState({});
	const [activeTab, setActiveTab] = useState(tabs[0].id);
	const [showModal, setShowModal] = useState(false);
	// const [subscriptionTiers, setSubscriptionTiers] = useState([]);
	const [payouts, setPayouts] = useState([]);

	const activeSubscriptions = allSubscriptions.filter(subscription => subscription.subscriptionStatus !== "deactivated");
	const pausedSubscriptions = allSubscriptions.filter(subscription => subscription.subscriptionStatus === "deactivated");

	const getAllSubscriptions = useCallback(async () => {
		const resp = await api.getAllUserSubscriptions();

		if (resp.success) {
			setAllSubscriptions([...resp.allSubscriptions]);
		}
	}, []);

	const onChangeSubscriptionStatus = useCallback(async (subData) => {
		const resp = await api.changeUserSubscription(subData);

		if (resp.success) {
			const newSubscriptions = [...allSubscriptions];
			newSubscriptions.forEach(sub => {
				if (sub.subscriptionId === subData.subscriptionId) {
					sub.subscriptionStatus = subData.status;
				}
				return sub;
			});

			setSubStatusData({});
			messageService.success('Статус підписки змінено');

			setAllSubscriptions([...newSubscriptions]);
		}
	}, [allSubscriptions]);

	const prolongSubscription = (subscriptionId) => {
		api.checkSubscriptionsEnabled({subscriptionId}).then((resp) => {
			if (resp.success) {
				window.location.href = `/user/subscription/update/${subscriptionId}?renew=1`;
				return;
			}

			const message = resp.message || `Ой! Щось пішло не так`;
			messageService.error(message);
		})
	}

	const getSubscriptionPayments = useCallback(async () => {
		const data = await api.getSubscriptionPayments();

		if (data.success) {
			setPayouts(data.orders);
		}
	}, []);

	useEffect(() => {
		getAllSubscriptions();
		getSubscriptionPayments();
	}, [getAllSubscriptions, getSubscriptionPayments]);

	// const getAllTiers = useCallback(async (id) => {
	// 	const data = await api.getAllUserTiers(id);
	// 	setSubscriptionTiers(data.tierRecords);
	// }, []);

	const onSubscribeAgain = useCallback(async (item) => {
		const {authorData} = item;

		window.location.href = `/${authorData.nickName}/tiers`;
		// TODO add verification if tier is is still active
		// if (tierId) {
			// goTo = `/user/subscription/build/${tierId}`;
		// }
	}, []);

	// const changeSubscription = useCallback((authorUserId) => {
	// 	getAllTiers(authorUserId);
	// 	setShowModal(true);
	// }, [getAllTiers]);

	const renderSubs = useCallback((item) => (
		<div className={`row mx-0 sub-item ${item.subscriptionStatus}`}>
			<div className='col-xl-3 col-lg-3 col-md-3 author-data pl-0 pr-2 d-flex flex-column flex-xl-row align-items-start align-items-md-center mb-3 mb-md-0'>
				<img alt="user-avatar" src={item.authorData.photo || replaceImage} onError={() => replaceImage} />

				<div className="author-nickname">
					<a href={`${window.location.hash}/${item.authorData.nickName}/news`} target="_blank" rel="noopener noreferrer">
						{item.authorData.nickName}
					</a>
				</div>
			</div>

			<div className="col-xl-2 col-lg-3 col-md-3 pl-0 pr-2 title-wrapper d-flex align-items-center justify-content-start flex-column mb-3 mb-md-0">
				<div className="title">{item.tierName}</div>
				<div className="price">{item.amount}<span className="currency">{helpers.getCurrencySign(item.currency)}</span> <span className="month">на місяць</span></div>
			</div>

			<div className='col-xl-2 col-lg-3 col-md-3 pl-0 pr-2 mb-3 mb-md-0 d-flex align-items-center subscriptions-status-info'>
				{item.subscriptionStatus === 'active' || item.subscriptionStatus === 'paused' ?
					item.failedAttempts !== 0 ?
						<div className='subscription-bage-pending'>
							<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
								<circle cx="3" cy="3" r="3" fill="#E2A417" />
							</svg>
							<span className='title'>Очікується</span>
						</div>
						:
						<div className='subscription-bage-active'>
							<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
								<circle cx="3" cy="3" r="3" fill="#5EA782" />
							</svg>
							<span className='title'>Активна</span>
						</div>
					:
					<div className='subscription-bage-not-active'>
						<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
							<circle cx="3" cy="3" r="3" fill="#8D939C" />
						</svg>
						<span className='title'>Не активна</span>
					</div>
				}
				{(item.isActive && item.subscriptionStatus === 'paused') || (item.subscriptionStatus !== 'deactivated' && item.failedAttempts !== 0) ?
					<OverlayTrigger
						placement="top"
						overlay={
							<Tooltip id="tooltip">
								Платежі за вашою підпискою призупинено. Але ваша підписка все ще активна до&nbsp;
								<strong>{moment(item.nextPaymentDate).format('L')}</strong>
								&nbsp;і до цього часу ви маєте доступ до контенту.
							</Tooltip>
						}
					>
						<div className='info-icon-wrapper'>
							<i className="fa-solid fa-info"></i>
						</div>
					</OverlayTrigger>
					: ''
				}
			</div>

			<div className="col-xl-2 col-lg-3 col-md-3 p-0 details d-flex flex-row flex-md-column mb-3 mb-lg-0">
				<span className='subscription-status mr-2'>{
					item.subscriptionStatus === 'active' ?
						'Наступний платіж'
					:
						item.subscriptionStatus === 'deactivated' ?
							'Останній платіж'
						:
							'Активна до'
				}</span>
				<span className="next-payment-date">{moment(item.nextPaymentDate).format('DD MMMM, HH:mm')}</span>
			</div>

			<div className="col-xl-3 col-lg-12 d-flex align-items-center flex-column">
				{/* {item.subscriptionStatus === 'active' && item.failedAttempts === 0 &&
					<button
						className='btn action-button action-button-black mb-1 mt-3 mt-xl-0'
						onClick={() => changeSubscription(item.authorData.authorUserId)}
					>
						Змінити підписку
					</button>
				} */}

				{item.subscriptionStatus !== 'deactivated' && item.failedAttempts !== 0 &&
					<button
						title="Продовжити"
						className="btn action-button action-button-black mb-1 mt-3 mt-xl-0"
						onClick={() => prolongSubscription(item.subscriptionId)}>
						Продовжити
					</button>
				}

				{item.subscriptionStatus === 'active' &&
					<button
						className='btn action-button action-button-white'
						onClick={() => setSubStatusData({ subscriptionId: item.subscriptionId, status: 'paused' })}
					>
						Призупинити
					</button>
				}

				{item.isActive && item.subscriptionStatus === 'paused' &&
					<button
						className='btn btn-primary action-button mt-3 mt-xl-0'
						onClick={() => onChangeSubscriptionStatus({ subscriptionId: item.subscriptionId, status: 'active' })}
					>
						Поновити
					</button>
				}

				{item.subscriptionStatus === 'deactivated' &&
					<button
						className='btn btn-primary action-button mt-3 mt-md-0'
						onClick={() => onSubscribeAgain(item)}
					>
						Підписатися знову
					</button>
				}
			</div>
		</div>
	), [onSubscribeAgain, onChangeSubscriptionStatus]);

	const renderConfirm = useCallback((item) => (
		<div className={`alert sub-item ${item.subscriptionStatus}`}>
			<span className="confirm">
				<div className="mb-2">Ви дійсно бажаєте призупинити вашу підписку? Якщо ви не активуєте її раніше ніж</div>
				<strong className="mb-2">{moment(item.nextPaymentDate).format('DD MMMM, HH:mm')}</strong>
				<div>вона буде автоматично скасована та всі привілеї даного рівня будуть зупинені</div>
			</span>
			<div className="col-xl-3 col-lg-12 button-container">
				<button
					className='btn action-button action-button-white'
					onClick={() => onChangeSubscriptionStatus(subStatusData)}
				>
					так
				</button>

				<button
					className='btn btn-primary action-button mt-3 mt-md-0'
					onClick={() => setSubStatusData({})}
				>
					ні
				</button>
			</div>
		</div>
	), [onChangeSubscriptionStatus, subStatusData]);

	const renderPayoutsHistory = useCallback((payouts) => (
		<div className='user-payouts-history animate__animated animate__fadeIn'>

			<div className='row payout-table-head mx-0'>
				<div className='col-md-2 px-0'>Дата</div>
				<div className='col-md-3 pl-0'>Деталі</div>
				<div className='col-md-3 pl-0'>Статус</div>
				<div className='col-md-2 pl-0'>Номер картки</div>
				<div className='col-md-2 text-right pl-0'>Сума</div>
			</div>

			{payouts.map((payout) => (
				<div key={payout.createdAt} className='row payout-table mx-0'>
					<div className='col-12 col-md-2 payout-created-at px-0'>
						{moment(payout.createdAt).format('LL')}
						<br />
						<span>{moment(payout.createdAt).format('LT')}</span>
					</div>

					<div className='col-6 col-md-3 payout-client-name pl-0'>
						{payout.clientName}<br /><span>{payout.tierName}</span>
					</div>

					<div className='col-6 col-md-3 payout-status pl-0'>
						{['approved', 'paid'].includes(payout.status.toLowerCase()) ?
							<span className='success'>{PaymentStatusMap.Approved}</span>
							:
							<span className='fail'>Помилка ({PaymentStatusMap[payout.status] || PaymentStatusMap.Declined})</span>
						}
					</div>

					<div className='col-6 col-md-2 payout-card pl-0'>
						{payout.card}
					</div>

					<div className='col-6 col-md-2 payout-amount text-right pl-0'>
						{payout.amount} {helpers.getCurrencySign(payout.currency)}
					</div>
				</div>
			))}
		</div>
	), []);

	return (
		<div className="my-subscriptions">
			<PageNavigationTabs
				tabs={tabs}
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				urlPath='my-subscriptions'
			/>
			{activeTab === 1 &&
				<div className="row animate__animated animate__fadeIn">
					{activeSubscriptions.length !== 0 && <div className='col-12 active-subscriptions'>Активні</div>}
					{activeSubscriptions.map((item, i) => (
						<div key={i} className="col-12">
							{subStatusData.subscriptionId && subStatusData.subscriptionId === item.subscriptionId ?
								renderConfirm(item)
								:
								renderSubs(item)
							}
						</div>
					))}

					{pausedSubscriptions.length !== 0 && <div className='col-12 active-subscriptions'>Не активні</div>}
					{pausedSubscriptions.map((item, i) => (
						<div key={i} className="col-12">
							{subStatusData.subscriptionId && subStatusData.subscriptionId === item.subscriptionId ?
								renderConfirm(item)
								:
								renderSubs(item)
							}
						</div>
					))}

					<ReactModal
						isOpen={showModal}
						onAfterOpen={null}
						onRequestClose={() => setShowModal(false)}
						style={customStyles}
						contentLabel="Example Modal"
					>
						<div className='row justify-content-md-start justify-content-center m-0'>
							<div className='col-12 tier-modal-title'>Змінити підписку</div>
							{/* {subscriptionTiers.map((tier) => (
								<div key={tier._id} className='tier-card-wrapper col-xl-4 col-lg-6 col-md-6'>
									<ChangeTierModal tier={tier} activeSubscriptions={activeSubscriptions} />
								</div>
							))} */}
						</div>
					</ReactModal>

				</div>
			}

			{activeTab === 2 && renderPayoutsHistory(payouts)}

		</div>
	);
};

export default UserSubscriptions;
