import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import Switch from 'react-switch';
import TierCardContent from '../../coms/tier/TierCardContent';
import TierItem from '../../coms/tier/TierItem';

import WidgetItemAdd from '../../coms/widget/WidgetItemAdd';
import {getAmountInUAH} from '../../enums/PaymentEnums';
import widgetEnum from '../../enums/widgetEnum';
import {useWindowDimensions} from '../../hooks/useWindowDimensions';
import {api} from '../../services/api';
import {messageService} from '../../services/messageService';
import {confirmRemoveModal} from '../../utils/confirmRemoveModal';

import '../../css/subscriptions.css';

const LARGE_SCREEN = 1200;
const PHONE_SCREEN = 767;

const Subscriptions = () => {
  const [subscriptionTiers, setSubscriptionTiers] = useState([]);
  const [currentTier, setCurrentTier] = useState({});
  const [isModalOpen, toggleModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [onCreate, setOnCreate] = useState(false);
  const [pageSettings, setPageSettings] = useState({});
  const [subscriptionWithAnyAmount, setSubscriptionWithAnyAmount] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const width = useWindowDimensions().width;

  const sortTiers = useCallback((tierRecords) => {
    // sort by price
    tierRecords = tierRecords.sort((a, b) => getAmountInUAH(b.price, b.currency) - getAmountInUAH(a.price, a.currency));

    // sort by status
    tierRecords.sort((a, b) => {
      if (a.tierStatus === widgetEnum.WidgetStatus.active) {
        return -1;
      }

      return 1;
    });

    setSubscriptionTiers([...tierRecords]);
  }, []);

  const getAllTiers = useCallback(async () => {
    const data = await api.getAllUserTiers();

    sortTiers(data.tierRecords);
	setIsLoading(false);
  }, [sortTiers]);

  const getPageSettings = useCallback(async () => {
    const data = await api.getPage();
	const { showSubscriptionWithAnyAmount } = data;

	setPageSettings(data);
	setSubscriptionWithAnyAmount(showSubscriptionWithAnyAmount);
  }, []);

  useEffect(() => {
    getAllTiers();
	getPageSettings();
  }, [getAllTiers, getPageSettings])

  useEffect(() => {
	if (width > PHONE_SCREEN) {
		const tiers = document.querySelectorAll('.subscription-tier');
		const  tiersInColumn = width > LARGE_SCREEN ? 3 : 2;

		for (let i = 0; i < tiers.length; i += tiersInColumn) {
			const groupOfTiers = Array.from(tiers).slice(i, i + tiersInColumn);
			let maxHeight = 0;

			groupOfTiers.forEach((tier) => {
				const tierHeight = tier.offsetHeight;
				if (tierHeight > maxHeight) {
					maxHeight = tierHeight;
				}
			});

			groupOfTiers.forEach((tier) => {
				tier.style.height = `${maxHeight}px`;
			});
		}
	}
  }, [subscriptionTiers, currentTier, width, isLoading]);

  const onSwitch = useCallback(async (checked) => {
	const updatedSettings = { ...pageSettings, showSubscriptionWithAnyAmount: checked };

	setSubscriptionWithAnyAmount(checked);
	setPageSettings(updatedSettings);
	await api.savePage(updatedSettings);
  }, [pageSettings]);

  const onAdd = useCallback(() => {
    setCurrentTier({});
    setOnCreate(true);
  }, []);

  const onCancel = useCallback(() => {
    setCurrentTier({});
    setOnCreate(false);
  }, []);

  const onTierSave = useCallback(async (e, tierData) => {
    e && e.preventDefault();

    const data = await api.saveUserTier(tierData);

    if (!data.success) {
      messageService.success(data.message || 'Ой, щось пішло не так');
      return;
    }

    setOnCreate(false);
    sortTiers(data.tierRecords);

    messageService.success('Збережено');
    data.discordErrorMessage && messageService.error(data.discordErrorMessage);
  }, [sortTiers]);

  const onEdit = useCallback((item) => {
    setCurrentTier({ ...item });
    setOnCreate(true);
  }, []);

  const onClone = useCallback((item) => {
    const {
      description,
      image,
      tierStatus,
      price,
      tierName,
      userId
    } = item;

    const data = {
      description,
      image,
      tierStatus,
      price,
      tierName,
      userId
    };

    onTierSave(null, data);
  }, [onTierSave]);

  const itemDelete = useCallback(async (tierId) => {
    const data = await api.removeUserTier(tierId);
    sortTiers(data.tierRecords);

    messageService.success('Видалено');
  }, [sortTiers]);

  const onDelete = useCallback(async (item) => {
    if (item.activeMembers > 0) {
      return
    }

    itemDelete(item._id);
    toggleModalOpen(false);
  }, [itemDelete]);

  const onStatusChange = useCallback((item) => {
	const { tierStatus } = item;

	const newStatus = tierStatus === widgetEnum.WidgetStatus.active
		? widgetEnum.WidgetStatus.paused
		: widgetEnum.WidgetStatus.active;

	const data = { ...item, tierStatus: newStatus };

	onTierSave(null, data);
  }, [onTierSave]);

	const IsLoadingContainer = useMemo(() => {
		return (
			<div className="d-flex flex-column align-items-center no-subscriptions">
				<i className="fa-regular fa-hourglass-half"></i>
				<h5 className="text-center my-3"><strong>Отримуємо дані</strong></h5>
			</div>
		)
	}, []);

	const noSubscriptionsContainer = useMemo(() => {
		return (
			<div className="d-flex flex-column align-items-center no-subscriptions">
				<i className="fa-regular fa-star"></i>
				<h5 className="text-center my-3"><strong>У вас ще немає рівнів підписки</strong></h5>
				<span className='mb-3'>Додайте платні підписки і отримуйте кошти за свою творчість</span>
				<WidgetItemAdd onAdd={onAdd} label="Додати рівень" isDisabled={false} />
			</div>
		)
	}, [onAdd]);

	const tierCardWithAnyAmount = useMemo(() => {
		return (
			<div className="col-md-6 col-xl-4">
				<div className='subscription-tier'>
					<div className='tier-header'>
						<span className="status-active">Опубліковано</span>
					</div>
					<div className="tier-card-content">
						<span className="name">Довільна підписка</span>
						<div className='text-disclaimer mb-3'>
							Ви можете вказати власну суму підписки, яка буде списуватись щомісяця
						</div>
						<div className="grey-text text-left w-100 mb-2">
							Вкажіть суму на місяць
						</div>
						<div className="input-group mb-3 price-and-currency">
							<input id="price" type="number" className="form-control" placeholder='50' />
							<select id="currency"
								className="form-control custom-select input-group-append"
							>
								<option value='UAH'>₴ UAH</option>
							</select>
						</div>
						<div className="grey-text text-left w-100 mb-2">
							Залиште коментар
						</div>
						<div className="mb-4 w-100">
							<textarea className="form-control h-100" rows="5" placeholder='Залиште коментар для автора' />
						</div>
						<button className="btn preview-button btn-primary">Підписатись</button>
					</div>
				</div>
			</div>
		)
	}, []);

	if (isLoading) {
		return (
			<div className="subscription">
				{IsLoadingContainer}
			</div>
		)
	}

	return (
    <div className="subscription">
		{!onCreate && subscriptionTiers.length !== 0 && (
		<>
			<div className="add-subscription-btn">
				<WidgetItemAdd onAdd={onAdd} label="Додати рівень" isDisabled={subscriptionTiers?.length > 8} />
			</div>

			<div className='text-disclaimer mb-3'>
				<div className='row'>
					<div className='col-12 col-md-4 mb-2 mb-md-0'><strong>Підписка з будь-якою сумою</strong></div>
					<div className='col-12 col-md-8'>
						<div className='d-flex justify-content-between form-text'>
							<span className='mr-3'>Показувати підписку з будь-якою сумою на донат сторінці</span>
							<Switch id="showSubscriptionWithAnyAmount"
								onChange={(checked) => onSwitch(checked)}
								checked={subscriptionWithAnyAmount}
								height={24}
								width={45}
								onColor={'#3579F6'}
							/>
						</div>
					</div>
				</div>
			</div>
			<div className='text-disclaimer mb-4'>
				<div className='row'>
					<div className='col-12 col-md-4 mb-2 mb-md-0'><strong>Вітальні повідомлення</strong></div>
					<div className='col-12 col-md-8'>
						<span>Додайте вітальні повідомлення для ваших рівнів підписки:</span>
						<div className="mt-2">
							<Link to="/panel/messages?tab=welcome-messages">
								Створити вітальне повідомлення
								<i className="fa-solid fa-arrow-up-right-from-square ml-2"></i>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</>
		)}

		<div className="row">
			{!onCreate && subscriptionTiers.length !== 0 && subscriptionTiers.map((item, index) => (
			<div key={item._id} className="col-md-6 col-xl-4">
				<div className='subscription-tier'>
					<div className='tier-header'>
						<span className={`status-${item.tierStatus}`}>
							{item.tierStatus === widgetEnum.WidgetStatus.active ? 'Опубліковано' : 'Деактивовано'}
						</span>
						<div className='dropdown'>
							<div className="dropdown-toggle pointer" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								<i className="fa-solid fa-ellipsis"></i>
							</div>
							<div className="dropdown-menu dropdown-menu-right">
								<div className="dropdown-item" onClick={() => onEdit(item)}>
									<div className='icon'>
										<i className='fas fa-edit'></i>
									</div>
									Редагувати
								</div>
								<div className="dropdown-item" onClick={() => onStatusChange(item)}>
									<div className='icon'>
										<i className={`fa-regular fa-eye${item.tierStatus === widgetEnum.WidgetStatus.active ? '-slash' : ''}`}></i>
									</div>
									{item.tierStatus === widgetEnum.WidgetStatus.active ? 'Деактивувати' : 'Активувати'}
								</div>
								<div className="dropdown-item" onClick={() => onClone(item, index)}>
									<div className='icon'>
										<i className='fa-regular fa-clone'></i>
									</div>
									Продублювати рівень
								</div>
								<div
									className={`dropdown-item ${item.activeMembers > 0 && "text-muted"}`}
									onClick={() => {
										if (item.activeMembers === 0) {
											toggleModalOpen(true);
											setItemToRemove(item);
										}
									}}
								>
									<div className='icon'>
										<i className='fas fa-trash-alt'></i>
									</div>
									Видалити
								</div>
							</div>
						</div>
					</div>

					<TierCardContent tier={item} />
				</div>
			</div>
			))}

			{!onCreate && subscriptionTiers.length !== 0 && subscriptionWithAnyAmount && tierCardWithAnyAmount}
		</div>

		{!onCreate && subscriptionTiers.length === 0 && noSubscriptionsContainer}

		{confirmRemoveModal({
			confirm: () => onDelete(itemToRemove),
			cancel: () => toggleModalOpen(false),
			isModalOpen
		})}

		{onCreate && (
			<TierItem
				tier={currentTier}
				onTierSave={onTierSave}
				onCancel={onCancel}
			/>
		)}
    </div>
	)
}

export default Subscriptions;
