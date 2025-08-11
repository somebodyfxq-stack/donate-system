import uk from 'date-fns/locale/uk';
import moment from 'moment';
import React, {Component} from 'react';
import DatePicker from 'react-datepicker';
import ReactModal from 'react-modal';
import {connect} from 'react-redux';
import Switch from 'react-switch';
import DisclaimerUserPending from '../../coms/disclaimer/DisclaimerUserPending';
import Badge from '../../coms/misc/Badge';
import SelectComponent from '../../coms/misc/CustomSelect';
import PageNavigationTabs from '../../coms/misc/PageNavigationTabs';
import {fileUpload} from '../../coms/misc/UploadComponent';
import '../../css/settings.css';
import ModerationPermissions from '../../coms/settings/ModerationPermissions';
import StatusDescription from '../../coms/settings/StatusDescription';
import UserAuthLink from '../../coms/settings/UserAuthLink';
import {AuthProviders} from '../../enums/AuthProvider';
import {isUserVerifiedStatus, StatusTerms, UserStatus} from '../../enums/UserStatus';
import SettingsModel from '../../models/SettingsModel';
import {api} from '../../services/api';
import {messageService} from '../../services/messageService';
import {history} from '../../utils';
import helpers from '../../utils/helpers';
import IpnUtils from '../../utils/IpnUtils';
import {isValidEmail} from '../../utils/utils';
import Integrations from './Integrations';
import Systems from './systems/Systems';
import 'react-datepicker/dist/react-datepicker.css';

export const UserRole = {
	user: 'user',
	blogger: 'blogger',
	streamer: 'streamer'
};

const SettingTabs = [
	{
		id: 1,
		route: 'main',
		title: 'Основні дані'
	}, {
		id: 2,
		route: 'roles',
		title: 'Ваші ролі'
	},
	{
		id: 3,
		route: 'status',
		title: 'Статус профілю'
	},
	{
		id: 4,
		route: 'paymentOptions',
		title: 'Способи оплати'
	},
	{
		id: 5,
		route: 'integrations',
		title: 'Інтеграції'
	},
	{
		id: 8,
		route: 'bots',
		title: 'Боти'
	},
	{
		id: 6,
		route: 'services',
		title: 'Cервіси'
	},
	{
		id: 9,
		route: 'moderation',
		title: 'Модерація'
	},
	{
		id: 7,
		route: 'other',
		title: 'Різне'
	}
];


const DELETE = 'DELETE';

const whatsNewModalStyles = {
	content: {
		top: '90px',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		borderRadius: '15px',
		transform: 'translate(-50%, 0%)',
		zIndex: '99',
		width: '60%',
		maxWidth: '1000px'
	}
};

class Settings extends Component {

	constructor(props) {
		super(props);

		this.state = {
			settings: new SettingsModel(),
			ipn: '',
			savedIpn: '',
			prevSettings: null,
			loading: false,
			isModalVisible: false,
			clientPhotoData: {},
			userEmails: [],
			removeConfirmation: '',
			isAngleDown: false,
			activeTab: 1,
			tabs: SettingTabs,
			isLogChannelOn: false,
			discordGuildChannels: [],
			logChannelName: '',
		};

		this.state.settings.darkTheme = helpers.isDarkTheme();
		this.delayOptions = [{
			label: 'Відображати одразу',
			id: 1
		}, {
			label: '15 секунд',
			id: 15
		}, {
			label: '30 секунд',
			id: 30
		}, {
			label: '45 секунд',
			id: 45
		}, {
			label: '60 секунд',
			id: 60
		}];
		this.scrollContainerRef = React.createRef();
	}

	componentDidMount() {
		this.setState({ loading: true }, () => {
			api.getSettings().then((settings) => {
				const { userRoles = [] } = this.props;
				const onlyUserRole = userRoles.length === 1 && userRoles[0] === 'user';
				let tabs = [...this.state.tabs];

				if (onlyUserRole) {
					tabs = this.filterTabs(tabs);
				}

				this.setState({
					tabs,
					settings,
					prevSettings: { ...settings },
					isModalVisible: !settings.roleModalShown,
					loading: false
				});
				this.setState({ ipn: settings.ipn, savedIpn: settings.ipn });

				if (settings.userRoles.length === 1 && settings.userRoles?.includes(UserRole.user)) {
					api.getPage().then((data) => {
						this.setState({ clientPhotoData: data.clientPhotoData });
					});
				}

				const isNewlyCreated = moment().diff(moment(settings.createdAt), 'seconds') < 30;

				// Check and process subscription order when existing user has selected tierId before login
				if ((this.state.settings?.nickname || this.state.settings.clientName) && !isNewlyCreated) {
					this.processSubscriptionOrder();
				}

				this.setNicknameForNewUser();
				helpers.toggleDarkTheme(settings.darkTheme);
			});

			api.getDiscordGuildChannels().then((response) => {
				const { channels } = response;
				this.setState({ discordGuildChannels: channels });
			})

			api.getDiscordLogChannelData().then((response) => {
				const { isLogChannelOn, logChannelName } = response;
				this.setState({ isLogChannelOn: isLogChannelOn, logChannelName: logChannelName });
			})

			api.getEmails().then(({ userEmails }) => {
				this.setState({ userEmails });
			});

			this.scrollToSection();
		});

		const urlParams = new URLSearchParams(window.location.search);
		const tabFromRoute = urlParams.get('tab') || 'main';

		this.setState({ activeTab: this.state.tabs.find(tab => tab.route === tabFromRoute)?.id || 1 });
	}

	setNicknameForNewUser = () => {
		const { nickname } = this.state.settings;

		if (!nickname && localStorage) {
			const selectedNickname = localStorage.getItem('DonatelloNickname');

			if (selectedNickname) {
				const { settings } = this.state;
				settings.nickname = selectedNickname;
				this.setState(settings, () => {
					messageService.error('Збережіть ваш нікнейм!');
					localStorage.removeItem('DonatelloNickname');
				});
			}
		}
	};

	scrollToSection = () => {
		setTimeout(() => {
			const { status } = this.props;
			const scroll = StatusTerms[status]?.scroll;

			if (status && scroll) {
				const statusContainer = document.querySelector('#status-row');
				statusContainer && statusContainer.scroll(scroll, 0);
			}

			if (window.location.search.indexOf('status') > 0) {
				window.scroll(0, 1400);
			}

			if (window.location.search.indexOf('integrations') > 0) {
				window.scroll(0, 5100);
			}

			if (window.location.search.indexOf('theme') > 0) {
				window.scroll(0, 4600);
			}
		}, 2000);
	};

	scrollToEnd = () => {
		window.scroll(0, 5100);
	}

	onChange = (e) => {
		const { id, value } = e.target;
		const { settings } = this.state;
		settings[id] = value;

		this.setState({ settings });
	};

	onInputChange = (e) => {
		const { id, value } = e.target;

		this.setState({ [id]: value });
	};

	onEmailChange = async (e) => {
		const { value } = e.target;

		const resp = await api.updateUserEmail(value);

		if (resp.success) {
			const { settings } = this.state;
			settings.email = value;

			messageService.success(resp.message);

			this.setState({ settings });
		}
	}

	processSubscriptionOrder = () => {
		const tierId = localStorage.getItem('desiredTierId');

		if (tierId) {
			const desiredTierData = localStorage.getItem('desiredTierData');
			let additionalData = null;

			localStorage.removeItem('desiredTierId');
			localStorage.removeItem('desiredTierData');

			if (desiredTierData) {
				additionalData = `?tierData=${encodeURIComponent(desiredTierData)}`;
			}

			window.location.href = `/user/subscription/build/${tierId}${additionalData || ''}`;
		}
	};

	updateField = (field, value, updateConfig, isConfirmClientNameModal) => {
		const { prevSettings } = this.state;

		if (field === 'nickname' && !value) {
			messageService.error('Вкажіть нікнейм');

			return;
		}

		// clean up wordsBlackList
		if (field === 'wordsBlackList' || field === 'youtubeBlackList') {
			value = value.replace(/ /g, '');

			if (value.slice(-1) === ',') {
				value = value.slice(0, -1);
			}
		}

		if (prevSettings[field] !== value || isConfirmClientNameModal) {
			api.updateSettings({ [field]: value }).then((resp) => {
				if (resp.data) {
					const savedValue = resp.data[field];
					const { settings, prevSettings } = this.state;
					settings[field] = savedValue;
					prevSettings[field] = savedValue;
					this.setState({ settings, prevSettings });

					if (field === 'clientName' && isConfirmClientNameModal) {
						this.processSubscriptionOrder(field);
					}

					if (updateConfig) {
						this.props.dispatch(api.getConfig());
					}
				}
			}).catch((err) => console.error(err));
		}
	};

	saveIpn = (ipn) => {
		if (!IpnUtils.isValid(ipn)) {
			messageService.error('Невірний формат ІПН');
			return;
		}

		api.savePaymentSystemIpn({ ipn }).then((resp) => {
			const ipn = resp?.data?.ipn;

			if (ipn) {
				this.setState({ ipn, savedIpn: ipn });
				this.props.dispatch(api.getConfig());
			}
		});
	};

	deleteIpn = () => {
		api.deletePaymentSystemIpn().then((resp) => {
			const ipn = resp?.data?.ipn || '';

			this.setState({ ipn });
		});
	};

	onDelayChange = (value, id) => {
		// const {settings} = this.state;
		// const {value} = e.target;
		// settings[id] = value;

		this.setState({ [id]: value });

		api.updateSettings({ [id]: value }).then();
	}

	toggleSwitch(id, checked) {
		const { settings } = this.state;
		settings[id] = checked;
		this.setState({ [id]: checked });

		if (id === 'darkTheme') {
			helpers.toggleDarkTheme(checked);
		}

		api.updateSettings({ [id]: checked }).then();
	}

	filterTabs(tabs) {
		return tabs.filter(tab => tab.id !== 3 && tab.id !== 4 && tab.id !== 8)
	}

	toggleRoleSwitch(role, checked, isModal) {
		const { settings } = this.state;
		let tabs = [...SettingTabs];

		if (!settings.userRoles) {
			settings.userRoles = [];
		}

		if (checked) {
			settings.userRoles.push(role);
		} else {
			settings.userRoles = settings.userRoles.filter(userRole => userRole !== role);
		}

		const onlyUserRole = settings.userRoles.length === 1 && settings.userRoles[0] === 'user';

		if (onlyUserRole) {
			tabs = this.filterTabs(tabs);
		}

		this.setState({ settings, tabs });

		api.updateSettings({ userRoles: settings.userRoles }).then(() => {
			this.props.dispatch(api.getConfig());
		});

		if (isModal) {
			api.updateSettings({ roleModalShown: true });
		}
	}

	resolveUpload = (dataName, imageField, res) => {
		let { clientPhotoData } = this.state;

		if (clientPhotoData?.gcName) {
			api.deleteFile({ gcName: clientPhotoData?.gcName }).then();
		}

		clientPhotoData = res;

		this.setState({ clientPhotoData }, () => {
			api.saveClientAvatar(clientPhotoData);
		});
	};

	removeUser = async () => {
		let { removeConfirmation } = this.state;

		if (removeConfirmation !== DELETE) {
			return;
		}

		await api.deleteUser();

		messageService.success('Ваш профіль видалено! Дякуємо, що були з нами!');

		setTimeout(() => {
			window.location.href = '/logout';
		}, 2000);
	};

	onRefreshTopClients = async () => {
		const resp = await api.onRefreshTopClients();

		if (resp.success) {
			messageService.success(resp.message);
		}
	}

	onAuth = (provider, link) => {
		if (link) {
			window.location.href = `/auth/${provider}`;
		} else {
			api.unlinkUserAuth({ provider }).then(() => {
				const { userAuths } = this.state.settings;
				userAuths[provider].linked = false;
				this.setState({ userAuths });
			});
		}
	};

	toggleLogChannelSwitch = async (id, checked) => {
		this.setState({[id]: checked});
		const resp = await api.saveDiscordLogChannelData({[id]: checked});

		if (resp.success) {
			messageService.success(resp.message);
		}
	};

	saveLogChannelName = async (id, value) => {
		const resp = await api.saveDiscordLogChannelData({[id]: value});

		if (resp.success) {
			messageService.success(resp.message);
		}
	};

	onDateTimeChange = (time) => {
		const { settings } = this.state;
		settings.authorTopDonatorStartDate = time;
		this.setState({ settings });
		api.updateSettings({ authorTopDonatorStartDate: time }).then();
	}

	renderClientName({ label, sm, isConfirmClientNameModal }) {
		const { settings, prevSettings } = this.state;

		return (
			<div className="form-group row align-items-center mb-3 mb-md-5">
				<label className="col-12 col-md-3 col-form-label " htmlFor="clientName"><strong>Імʼя (нікнейм для ролі Глядач)</strong></label>
				<div className="col-12 col-md-6">
					<div className="d-flex align-items-center">
						<input id="clientName" type="text" className="form-control" aria-describedby="clientNameHelp"
							placeholder="Ваше імʼя" required
							value={settings.clientName || ''}
							onChange={this.onChange}
							onKeyDown={(e) => {
								if (e.key === 'Enter' && settings.clientName !== prevSettings.clientName) {
									this.updateField('clientName', settings.clientName, true);
								}
							}} />
					</div>
					{!settings.clientName && (
						<small className="form-text text-muted" style={{ display: 'inline-block' }}>
							<ul style={{ paddingLeft: '20px', listStyle: 'square' }}>
								<i className="fas fa-exclamation-circle text-warning mr-2" />
								Ваше імʼя (нікнейм) як гладача. На сайті Донателло імена глядачів не унікальні та можуть повторюватися.
							</ul>
						</small>
					)}
				</div>
				<div className="col-12 col-md-3 text-align-right mt-2 mt-md-0">
					<button className={`btn btn-dark btn-${sm}`} style={{ margin: 0 }}
						disabled={!settings || !prevSettings || !settings.clientName || (!isConfirmClientNameModal && (settings.clientName === prevSettings.clientName))}
						onClick={() => this.updateField('clientName', settings.clientName, true, isConfirmClientNameModal)}>
						{label}
					</button>
				</div>
			</div>
		);
	}

	renderClientAvatar() {
		const { clientPhotoData } = this.state;

		return (
			<div className="form-group row">
				<label className="col-12 col-md-3 col-form-label" htmlFor="clientPhotoData">
					<strong>Аватарка</strong>
				</label>
				<div className='col-12 col-md-6'>
					<div className="d-flex align-items-baseline">
						{clientPhotoData?.url && (
							<div className="">
								<img src={clientPhotoData?.url} style={{ width: '64px', height: '64px', borderRadius: '50%', marginRight: '16px' }} alt="" />
							</div>
						)}
						<div className='position-relative w-100'>
							<label htmlFor="clientPhotoData" className="upload-button-label">
								<div className='upload-button-settings-page'>Вибрати файл</div>
								{clientPhotoData && clientPhotoData?.name ? (
									<span>{clientPhotoData?.name}</span>
								) : (
									<span>Файл не обрано</span>
								)}
							</label>
							<sup className="text-muted">Максимальний розмір: 5Мб</sup>
							<input
								className="form-control upload-button-page"
								id="clientPhotoData"
								type="file"
								onChange={(e) => fileUpload(e, 'clientPhotoData', null, this.resolveUpload)}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}

	renderUserNameFiled() {
		return (
			<section className='user-name-filed'>
				<h3 style={{ marginTop: '0px' }}>Ваш дані</h3>

				{this.renderClientAvatar()}
				{this.renderClientName({ label: 'Зберегти та перейти до оплати', sm: '', isConfirmClientNameModal: true })}
			</section>
		);
	}

	renderSectionAbout(onlyUserRole, alsoUserRole) {
		const { status } = this.props;
		const { settings, prevSettings, userEmails } = this.state;

		return <section className='section-wrapper section-about'>
			<h3 className='m-0'>Основні дані</h3>

			<div className="form-group row mb-3 mb-md-5">
				<label className="col-12 col-md-3 col-form-label" htmlFor="email"><strong>Електронна пошта</strong></label>
				<div className='col-12 col-md-6'>
					<select id="email" className="form-control"
						value={isValidEmail(settings.email) ? settings.email : ''}
						onChange={this.onEmailChange}>
						{userEmails.map((item) =>
							<option key={item} value={item}> {item} </option>
						)}
					</select>
					<small className="form-text text-muted mt-1">
						Для зміни електронної пошти  &nbsp;
						<span
							className="pointer"
							style={{ color: '#3579F6', borderBottom: '1px solid #3579F6' }}
							onClick={() => this.setActiveTab(6)}
						>
							приєднайте інший сервіс авторизації
						</span>
					</small>
				</div>
			</div>

			{!onlyUserRole && (
				<div className="form-group row align-items-center mb-3 mb-md-5">
					<label className="col-12 col-md-3 col-form-label" htmlFor="nickname"><strong>Сторінка *</strong></label>
					<div className="col-12 col-md-6">
						<div className="d-flex align-items-center">
							<span className="mr-2"><strong>https://donatello.to/</strong></span>
							<input id="nickname" type="text" className="form-control" aria-describedby="nicknameHelp"
								placeholder="ваш-нікнейм" required
								value={settings.nickname || ''}
								onChange={this.onChange}
								onKeyDown={(e) => {
									if (e.key === 'Enter' && settings.nickname !== prevSettings.nickname) {
										this.updateField('nickname', settings.nickname, true);
									}
								}} />
						</div>
						{!settings.nickname && (
							<small className="form-text text-muted mt-3" style={{ display: 'inline-block' }}>
								<ul style={{ paddingLeft: '20px', listStyle: 'square' }}>
									<i className="fas fa-exclamation-circle text-warning mr-3" />
									Створіть нікнейм для початку роботи
								</ul>
							</small>
						)}
						{status === UserStatus.basic &&
							<small className="form-text text-muted mt-3" style={{ display: 'inline-block' }}>
								<ul style={{ paddingLeft: '20px', listStyle: 'square' }}>
									<li>Після зміни нікнейму ваш статус оновиться на "Початківець".
									</li>
								</ul>
							</small>}
					</div>

					<div className='col-12 col-md-3 text-align-right mt-2 mt-md-0'>
						<button className="btn btn-dark btn-sm"
							disabled={!settings || !prevSettings || settings.nickname === prevSettings.nickname}
							onClick={() => this.updateField('nickname', settings.nickname, true)}>
							Зберегти
						</button>
					</div>
				</div>
			)}

			{(alsoUserRole || onlyUserRole) && this.renderClientName({ label: 'Зберегти', sm: 'sm', isConfirmClientNameModal: false })}

			{onlyUserRole && this.renderClientAvatar()}
		</section>;
	}

	renderUserRole(isModal) {
		const { settings } = this.state;
		const { status } = this.props;

		return <section className='section-wrapper'>
			<h3 className='mt-0' style={{ marginBottom: isModal ? '24px' : '0' }}>Ваші ролі</h3>

			<div className="form-group">
				<div className="user-role-section d-flex flex-column">
					<div className="row user-role-item align-items-center">
						<div className="col-9 col-sm-3">
							<i className="fa-solid fa-desktop"></i>
							<span className='user-role-name'>Стрімер</span>
						</div>
						<div className='col-12 col-sm-8 user-role-description mt-3 mt-sm-0'>
							<span id="cardHelp">
								Проводите стріми, бажаєте отримувати донати і працювати з віджетами для стрімінгу
							</span>
						</div>
						<div className="col-3 col-sm-1 d-flex align-items-center justify-content-sm-start justify-content-end pl-0">
							<Switch
								id="streamer"
								disabled={!settings.userRoles?.includes(UserRole.blogger) && !settings.userRoles?.includes(UserRole.user)}
								onChange={(checked) => this.toggleRoleSwitch(UserRole.streamer, checked, isModal)}
								checked={settings.userRoles?.includes(UserRole.streamer) || false}
								height={24}
								width={45}
								onColor={'#3579F6'}
							/>
						</div>
					</div>

					<div className="row user-role-item align-items-center">
						<div className="col-9 col-sm-3">
							<i className="fa-solid fa-video"></i>
							<span className='user-role-name'>Блогер</span>
						</div>
						<div className='col-12 col-sm-8 user-role-description mt-3 mt-sm-0'>
							<span id="cardHelp">
								Публікуєте контент (тексти, відео, ілюстрації) та бажаєте отримувати донати одноразово або за підпискою
							</span>
							<span className="form-text verification mt-2">
								Потрібно <a href="/panel/settings?tab=paymentOptions">активувати спосіб оплати Donatello</a> або <a id="business" href="/business/integration" target="_blank">інтегрувати власний мерчант</a>
							</span>

							{UserStatus.none === status && (
								<span className="form-text verification mt-2">
									Щоб отримати роль “Блогер” пройдіть верифікацію за посиланням: <br />
									<a id="verification" href="/verification" target="_blank">
										Пройти верифікацію
									</a>
								</span>
							)}
						</div>
						<div className="col-3 col-sm-1 d-flex align-items-center justify-content-sm-start justify-content-end pl-0">
							<Switch
								id="blogger"
								disabled={
									(!settings.userRoles?.includes(UserRole.streamer) && !settings.userRoles?.includes(UserRole.user)) ||
									UserStatus.none === status
								}
								onChange={(checked) => this.toggleRoleSwitch(UserRole.blogger, checked, isModal)}
								checked={settings.userRoles?.includes(UserRole.blogger) || false}
								height={24}
								width={45}
								onColor={'#3579F6'}
							/>
						</div>
					</div>

					<div className="row align-items-center">
						<div className="col-9 col-sm-3">
							<i className="fa-regular fa-user"></i>
							<span className='user-role-name'>Глядач</span>
						</div>
						<div className='col-12 col-sm-8 user-role-description mt-3 mt-sm-0'>
							<span id="cardHelp">
								Бажаєте підтримувати українських блогерів і керувати своїми підписками
							</span>
						</div>
						<div className="col-3 col-sm-1 d-flex align-items-center justify-content-sm-start justify-content-end pl-0">
							<Switch
								id="user"
								disabled={!settings.userRoles?.includes(UserRole.streamer) && !settings.userRoles?.includes(UserRole.blogger)}
								onChange={(checked) => this.toggleRoleSwitch(UserRole.user, checked, isModal)}
								checked={settings.userRoles?.includes(UserRole.user) || false}
								height={24}
								width={45}
								onColor='#3579F6'
							/>
						</div>
					</div>

				</div>
			</div>
		</section>;
	}

	renderSectionStatus() {
		const { status, isNoServiceFee } = this.props;
		const { settings, activeTab, isAngleDown } = this.state;
		const statusTerms = StatusTerms[status];

		if (activeTab === 3) {
			this.scrollToActiveElement();
		}

		return (
			<section className="status">
				<h3>Статус профілю</h3>

				<div className='about-status'>
					<div className='d-flex justify-content-between align-items-center'>
						<div className="current-status-wrapper">
							<div className="status-title" htmlFor="email">Ваш статус:</div>
							{status && (
								<div className="current-status">
									<i className={statusTerms.icon} />
									<span>{statusTerms.title}</span>
								</div>
							)}
						</div>

						<div className='change-status-wrapper' onClick={() => this.toggleAngle()}>
							<a
								className='change-status'
								data-toggle="collapse"
								href="#collapseChangeStatus"
								role="button"
								aria-expanded="false"
								aria-controls="collapseChangeStatus"
							>
								<span className='mr-2 mb-0'>Як змінити статус?</span>
								{isAngleDown ? <i className="fas fa-angle-up"></i> : <i className="fas fa-angle-down"></i>}
							</a>
						</div>
					</div>

					<div className="collapse" id="collapseChangeStatus">
						<div className="status-comments mb-0">
							<p>Для зміни статусу необхідно виконати <strong>умови переходу</strong>.</p>
							<p>Досвідчені автори можуть достроково отримати <strong>"Середній"</strong> статус.<br />
								Критерії модерації профілю:</p>
							<ul>
								<li>медіа-канал, активний щонайменше 3 місяці</li>
								<li>актуальний контент і підписники</li>
								<li>історія донатів на нашій платформі як доказ необхідності підвищити ліміт</li>
							</ul>
							<p>
								Надішліть адміністратору у <a
									href="https://discord.gg/hdqXqJwhAF" rel="noopener noreferrer"
									target="_blank">Discord</a> або <a
										href="https://www.facebook.com/donatello.to/" rel="noopener noreferrer"
										target="_blank">Facebook</a>:
							</p>
							<ol className="mt-2">
								<li>Ваша сторінка: <strong>https://donatello.to/{settings.nickname}</strong></li>
								<li>URL-посилання на ваші медіа-канали (youtube, twitch, tiktok чи будь-який інший)</li>
								<li>Розміщене посилання <strong>https://donatello.to/{settings.nickname}</strong> у вас
									на каналі (в описі до відео чи на сторінці про себе)
								</li>
							</ol>
						</div>
					</div>

					{isNoServiceFee && <div className="row mx-0">
						<div className="col-md-12 status-comments mb-0">
							<img src="/img/ukraine.png" width="20" height="20" className="mr-3"
								alt="Україна" title="Підтримую Україну" />
							<span className="text-muted ">
								<strong>Послуги сервісу &mdash; 0%</strong>. Дякуємо за розвиток українського контенту!
							</span>
						</div>
					</div>}

					{/*{status && statusTerms.dailyAmount && <div className="row mx-0">*/}
					{/*	<div className="col-md-8 status-comments">*/}
					{/*		<i className="fas fa-exclamation-circle text-warning mr-3" />*/}
					{/*		<span className="text-muted">*/}
					{/*			<strong>Поточний ліміт:</strong> {statusTerms.dailyAmount} ₴ донатів на добу*/}
					{/*		</span>*/}
					{/*	</div>*/}
					{/*</div>}*/}
				</div>

				<div className='position-relative w-100'>
					<div className="row-status mb-5" id="status-row" ref={this.scrollContainerRef}>
						<div className='d-flex'>
							<StatusDescription
								status={UserStatus.none}
								userStatus={status}
								serviceFee={StatusTerms.none.serviceFee}
								hasDailyLimit={false}
								dailyAmount={StatusTerms.none.dailyAmount}
								isModeratedPayouts={StatusTerms.none.isModeratedPayouts}
								monoIntegration={true}
							/>

							<StatusDescription
								status={UserStatus.basic}
								userStatus={status}
								serviceFee={StatusTerms.basic.serviceFee}
								hasDailyLimit={false}
								dailyAmount={StatusTerms.basic.dailyAmount}
								upgradeAmount={StatusTerms.basic.upgradeAmount}
								isModeratedPayouts={StatusTerms.basic.isModeratedPayouts}
								hasTerms={true}
								monoIntegration={true}
							/>

							<StatusDescription
								status={UserStatus.middle}
								userStatus={status}
								serviceFee={StatusTerms.middle.serviceFee}
								maxAmount={StatusTerms.middle.maxAmount}
								upgradeAmount={StatusTerms.middle.upgradeAmount}
								isOccasionalModeratedPayouts={true}
								hasTerms={true}
								hasSubscription={true}
								monoIntegration={true}
							/>

							<StatusDescription
								status={UserStatus.advanced}
								userStatus={status}
								serviceFee={StatusTerms.advanced.serviceFee}
								maxAmount={StatusTerms.advanced.maxAmount}
								upgradeAmount={StatusTerms.advanced.upgradeAmount}
								isAutomatedPayout={true}
								hasTerms={true}
								hasSupport={true}
								hasSubscription={true}
								monoIntegration={true}
							/>

							<StatusDescription
								status={UserStatus.partner}
								userStatus={status}
								serviceFee={StatusTerms.partner.serviceFee}
								maxAmount={StatusTerms.partner.maxAmount}
								upgradeAmount={StatusTerms.partner.upgradeAmount}
								isAutomatedPayout={true}
								hasTerms={true}
								hasSupport={true}
								hasCustomDevelopment={true}
								hasSubscription={true}
								monoIntegration={true}
							/>
						</div>
					</div>

					<button className="btn scroll-right-button" onClick={this.scrollRight}>
						<span className="right-arrow"></span>
					</button>

					<button className="btn scroll-left-button" onClick={this.scrollLeft}>
						<span className="left-arrow"></span>
					</button>
				</div>

			</section>
		)
	}

	renderSectionMisc(onlyUserRole) {
		const { settings, removeConfirmation } = this.state;
		const { status } = this.props;

		return (
			<section>
				<h3>Різне</h3>

				{!onlyUserRole && (
					<div className="misc-item forbidden-words">
						<div className='d-flex justify-content-between align-items-center mb-3'>
							<div className="misc-item-description pr-0 pr-sm-5 mb-3 mb-sm-0">
								<div className='misc-item-title mb-2'>Заборонені слова</div>
							</div>

							<div className='switch-wrapper'>
								<Switch
									id="forbiddenWordsEnabled"
									onChange={(checked) => this.toggleSwitch('forbiddenWordsEnabled', checked)}
									checked={settings.forbiddenWordsEnabled}
									height={24}
									width={45}
									onColor='#3579F6'
								/>
							</div>
						</div>
						<div className='d-flex justify-content-between align-items-center mb-3'>
							<div className="misc-item-description pr-0 pr-sm-5 mb-3 mb-sm-0">
								<div className='misc-item-title'>Оновити заборонені слова</div>
							</div>

							<button
								type="button"
								className="btn btn-outline-dark btn-sm"
								data-toggle="modal"
								data-target="#wordsBlackListModal"
								disabled={!settings.forbiddenWordsEnabled}
							>
								Додати слова
							</button>
						</div>
						<div className='d-flex justify-content-between align-items-md-center flex-md-row flex-column'>
							<div className="misc-item-description pr-0 pr-sm-5 mb-3 mb-md-0">
								<div className='misc-item-title'>{Badge()} Текст замість заборонених слів</div>
								<span>
									Заборонені слова будуть замінятися на введений текст. <br/> По замовчуванню заборонені слова заміняються на ***.
								</span>
							</div>

							<div className='d-flex align-items-center justify-content-between'>
								<div className='form-group my-0 mr-3'>
									<input id="forbiddenWordReplacement" type="text" className="form-control"
										placeholder='***'
										disabled={!settings.forbiddenWordsEnabled}
										value={settings.forbiddenWordReplacement}
										onChange={(e) => this.onChange(e)} />
								</div>

								<button
									type="button"
									className="btn btn-outline-dark btn-sm"
									disabled={!settings.forbiddenWordsEnabled}
									onClick={() => this.updateField('forbiddenWordReplacement', settings.forbiddenWordReplacement, false)}
								>
									Зберегти
								</button>
							</div>

						</div>
					</div>
				)}

				{!onlyUserRole && (
					<div className="modal fade" id="wordsBlackListModal" tabIndex="-1" role="dialog"
						aria-labelledby="myModalLabel">
						<div className="modal-dialog black-words-list" role="document">
							<div className="modal-content">
								<div className="modal-body">
									<h4 className="mb-lg-4 text-center">Заборонені слова</h4>
									<i className="fa-solid fa-xmark icon-close-modal" data-dismiss="modal"></i>
									<div className="black-words-description">
										<span>
											Вкажіть заборонені слова через кому. Наприклад: <strong>“редиска,картопля,морква,помідор”</strong>.<br />
											Щоб видалити ціле слово навіть зі співпадінням кількох букв, додайте до букв "***" через кому: сло***,стал***,сра***.
											Працює навіть, якщо співпадають букви в середині слова.
										</span>
									</div>

									<div className='textarea-title'>Вкажіть заборонені слова</div>
									<textarea
										className="black-list"
										id="wordsBlackList"
										value={settings.wordsBlackList || ''}
										onChange={(e) => this.onChange(e)}
									/>

									<div className="d-flex justify-content-between align-items-center">
										<button
											className="btn btn-outline-dark"
											data-dismiss="modal"
										>
											Скасувати
										</button>

										<button
											className="btn btn-dark"
											data-dismiss="modal"
											onClick={() => {
												this.updateField('wordsBlackList', settings.wordsBlackList, false);
											}}
										>
											Зберегти
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{!onlyUserRole && (
					<div className="misc-item">
						<div className="misc-item-description">
							<div className='misc-item-title mb-2'>Сховати посилання</div>
							<span>
								Сховати URL-посилання у донат повідомленнях ("https://...").
								<br />
								Відноситься до заборонених слів.
							</span>
						</div>

						<div className='switch-wrapper'>
							<Switch
								id="removeLinks"
								onChange={(checked) => this.toggleSwitch('removeLinks', checked)}
								checked={settings.removeLinks}
								height={24}
								width={45}
								onColor='#3579F6'
							/>
						</div>
					</div>
				)}

				{!onlyUserRole && (
					<div className="misc-item">
						<div className="misc-item-description pr-0 pr-sm-5 mb-3 mb-sm-0">
							<div className='misc-item-title'>{Badge()} Оновити заборонені Youtube посилання</div>
						</div>

						<button
							type="button"
							className="btn btn-outline-dark btn-sm"
							data-toggle="modal"
							data-target="#yotubeBlackListModal"
						>
							Додати посилання
						</button>
					</div>
				)}

				{!onlyUserRole && (
					<div className="modal fade" id="yotubeBlackListModal" tabIndex="-1" role="dialog"
						aria-labelledby="myModalLabel">
						<div className="modal-dialog black-words-list" role="document">
							<div className="modal-content">
								<div className="modal-body">
									<h4 className="mb-lg-4 text-center">Заборонені посиланя</h4>
									<i className="fa-solid fa-xmark icon-close-modal" data-dismiss="modal"></i>
									<div className="black-words-description">
										<span>
											Вкажіть заборонені посилання через кому, без пробілів.
										</span>
									</div>

									<div className='textarea-title'>Вкажіть заборонені посилання</div>
									<textarea
										className="black-list"
										id="youtubeBlackList"
										value={settings.youtubeBlackList || ''}
										onChange={(e) => this.onChange(e)}
									/>

									<div className="d-flex justify-content-between align-items-center">
										<button
											className="btn btn-outline-dark"
											data-dismiss="modal"
										>
											Скасувати
										</button>

										<button
											className="btn btn-dark"
											data-dismiss="modal"
											onClick={() => {
												this.updateField('youtubeBlackList', settings.youtubeBlackList, false);
											}}
										>
											Зберегти
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{!onlyUserRole && (
					<div className="misc-item flex-column flex-md-row align-items-start align-items-md-center">
						<div className="misc-item-description pr-0 pr-md-4">
							<div className='misc-item-title mb-2'>Затримка сповіщень</div>
							<span>
								Затримка сповіщень про нові донати. Для модерації повідомлень.
								<br />
								Сповіщення затримуються на одну хвилину.
							</span>
						</div>

						<div>
							<div className="delay-title mt-3 mt-md-0">
								Час затримки
							</div>

							<SelectComponent
								options={this.delayOptions}
								value={this.delayOptions.find((item) => item.id === settings.moderateDonates)}
								setSelectItem={this.onDelayChange}
								id='moderateDonates'
							/>
						</div>
					</div>
				)}

				{!onlyUserRole && isUserVerifiedStatus(status) && (
					<div className="misc-item forbidden-words">
						<div className='d-flex justify-content-between align-items-center mb-4'>
							<div className="misc-item-description">
								<div className='misc-item-title mb-2'>{Badge()} Забирати комісію під час оновлення даних про донаторів та у статистиці</div>
							</div>
							<div className='switch-wrapper'>
								<Switch
									id="subtractFee"
									onChange={(checked) => this.toggleSwitch('subtractFee', checked)}
									checked={settings.subtractFee}
									height={24}
									width={45}
									onColor='#3579F6'
								/>
							</div>
						</div>

						<div className='d-flex justify-content-between align-items-center mb-4'>
							<div className="misc-item-description pr-0 pr-md-4">
								<div className='misc-item-title mb-2'>{Badge()} Встановити дату початку відліку статистики</div>
								<span>
									нова дата для відрахунку вашої статистики на Донат сторінці та сторонці Огляд
								</span>
							</div>
							<div className='d-flex flex-column justify-content-between align-items-end' style={{minHeight: "70px"}}>
								<div className='switch-wrapper' style={{position: 'initial'}}>
									<Switch
										id="newStatsDate"
										onChange={(checked) => this.toggleSwitch('newStatsDate', checked)}
										checked={settings.newStatsDate}
										height={24}
										width={45}
										onColor='#3579F6'
									/>
								</div>
								{settings.newStatsDate && (
									<div className="time-picker-container">
										<DatePicker
											selected={settings.authorTopDonatorStartDate ? moment(settings.authorTopDonatorStartDate)._d : moment('2018-06-01')._d}
											onChange={(time) => this.onDateTimeChange(time)}
											showTimeSelect
											selectsStart
											timeIntervals={15}
											dateFormat="yyyy-MM-dd HH:mm:ss"
											timeFormat="HH:mm"
											className="form-control"
											locale={uk}
										/>
									</div>
								)}
							</div>
						</div>

						<div className='d-flex justify-content-between align-items-center'>
							<div className="misc-item-description pr-0 pr-md-4">
								<div className='misc-item-title mb-2'>Оновити дані про донати</div>
								<span>
									перераховує всі ваші донати і виправляє дані на головній сторінці
								</span>
							</div>

							<div>
								<button
									onClick={this.onRefreshTopClients}
									className="btn btn-outline-dark btn-sm"
								>
									Оновити
								</button>
							</div>
						</div>
					</div>
				)}

				<div className="misc-item">
					<div className="misc-item-description pr-0 pr-sm-5 mb-3 mb-sm-0">
						<div className='misc-item-title mb-2'>Видалити профіль</div>
						<span>
							Ви можете відновити профіль протягом 30 днів.
							Для відновлення профілю напишіть нам на пошту&nbsp;
							<a href='mailto:hello@donatello.to'>hello@donatello.to</a>
						</span>
					</div>

					<button
						type="button"
						className="btn btn-outline-danger"
						data-toggle="modal"
						data-target="#removeUser"
					>
						Видалити профіль
					</button>
				</div>

				<div className="modal fade" id="removeUser" tabIndex="-1" role="dialog"
					aria-labelledby="myModalLabel">
					<div className="modal-dialog black-words-list" role="document">
						<div className="modal-content">
							<div className="modal-body">
								<h4 className="mb-lg-4 text-center">Підтвердити видалення</h4>
								<i className="fa-solid fa-xmark icon-close-modal" data-dismiss="modal"></i>
								<div className='textarea-title'>
									<p>Протягом 30 днів ви можете відновити профіль</p>

									<p>Щоб підвердити видалення, введіть <strong>{DELETE}</strong>:</p>
								</div>

								<input
									className="form-control mb-4 col-4"
									id="removeConfirmation"
									value={removeConfirmation}
									onChange={(e) => this.onInputChange(e)}
								/>

								<div className="d-flex justify-content-between align-items-center">
									<button
										className="btn btn-outline-dark"
										data-dismiss="modal"
									>
										Скасувати
									</button>

									<button
										className="btn btn-dark"
										data-dismiss="modal"
										onClick={this.removeUser}
									>
										Видалити
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	}

	isOneUserAuthProvider = (userAuths) => {
		let count = AuthProviders.length;

		for (const provider of AuthProviders) {
			if (!userAuths[provider].linked) {
				count--;
			}
		}

		return count === 1;
	};

	renderSectionServices() {
		const { settings } = this.state;
		const isOneProvider = this.isOneUserAuthProvider(settings.userAuths);

		return <section className="section-wrapper mb-5">
			<h3 className='m-0'>Сервіси</h3>
			<div className="row mx-0 mt-4">
				<UserAuthLink
					provider="google"
					auth={settings.userAuths.google}
					one={isOneProvider}
					onAuth={this.onAuth}
				/>
				<UserAuthLink
					provider="youtube"
					auth={settings.userAuths.youtube}
					one={isOneProvider}
					onAuth={this.onAuth}
				/>
				<UserAuthLink
					provider="twitch"
					auth={settings.userAuths.twitch}
					one={isOneProvider}
					onAuth={this.onAuth}
				/>
				<UserAuthLink
					provider="discord"
					auth={settings.userAuths.discord}
					one={isOneProvider}
					onAuth={this.onAuth}
				/>
				<UserAuthLink
					provider="trovo"
					auth={settings.userAuths.trovo}
					one={isOneProvider}
					onAuth={this.onAuth}
				/>
			</div>
		</section>;
	}

	renderSectionBots() {
		const { settings, isLogChannelOn, discordGuildChannels, logChannelName } = this.state;

		return (
			<section className='section-bots'>
				<h3 className='mb-3'>Боти</h3>

				<div className='misc-item d-block'>
					<h3 className='mt-0 mb-4'>Discord</h3>
					<div className="row page-view-item">
						<div className="col-9 col-sm-4">
							<span className='page-view-item-name'>{Badge()} Логи на Discord сервері</span>
						</div>
						<div className='col-12 col-sm-6 page-view-item-description order-1 order-sm-0 mt-3 mt-sm-0'>
							<span>
								Увімкнути логування подій, повязаних з видачею ролей користувачам, в обраному каналі на своєму Discord сервері
							</span>
							{!settings.userAuths.discord?.id && (
								<span>
									<br />
									(Лише для користувачів авторизованих через <strong>Discord</strong>)
								</span>
							)}

							{isLogChannelOn && <div className="text-decoration-none mt-2" data-toggle="collapse" href="#discordBotPermission" role="button" aria-expanded="false" aria-controls="discordBotPermission">
								<strong>Налаштування дозволів бота </strong>
								<i className="fas fa-angle-down"></i>
							</div>}
							<div className={`collapse ${discordGuildChannels.length === 0 ? 'show' : ''}`} id="discordBotPermission">
								<div className="discord-bot-permission">
									На вашому Discord сервері потрібно увімкнути дозвіл "Відправляти повідомлення" для ролі DonatelloBot
								</div>
							</div>
						</div>
						<div className="col-3 col-sm-2 d-flex align-items-center justify-content-end pl-0">
							<Switch
								id="isLogChannelOn"
								onChange={(checked) => this.toggleLogChannelSwitch('isLogChannelOn', checked)}
								checked={isLogChannelOn}
								disabled={!settings.userAuths.discord?.id}
								height={24}
								width={45}
								onColor='#3579F6'
							/>
						</div>
					</div>

					{isLogChannelOn && (
						<div className="row page-view-item form-group border-0">
							<div className="col-9 col-md-4">
								<span className='page-view-item-name'>{Badge()} Канал для логів</span>
							</div>
							<div className='col-12 col-md-5 mt-3 mt-md-0'>
								<select id="logChannelName" className="form-control w-100"
									value={logChannelName}
									onChange={this.onInputChange}>
									<option value="">Оберіть канал</option>
									{discordGuildChannels.length > 0 && discordGuildChannels.map((item) =>
										<option key={item.channelId} value={item.channelName}>
											{item.channelName}
										</option>
									)}
								</select>
							</div>
							<div className='col-12 col-md-3 text-align-right mt-2 mt-md-0'>
								<button className="btn btn-dark btn-sm"
									disabled={!logChannelName || !isLogChannelOn}
									onClick={() => this.saveLogChannelName('logChannelName', logChannelName)}>
									Зберегти
								</button>
							</div>
						</div>
					)}
				</div>
			</section>
		)
	}

	setActiveTab = (tabId) => {
		history.push({
			pathname: '/panel/settings',
			search: `?${new URLSearchParams({ tab: this.state.tabs.find(tab => tab.id === tabId).route })}`
		})

		this.setState({ activeTab: tabId });
	};

	scrollToActiveElement = () => {
		setTimeout(() => {
			const activeElement = document.querySelector('.active-element.active');

			if (activeElement) {
				activeElement.scrollIntoView({
					behavior: 'smooth',
					block: 'nearest',
					inline: 'center'
				});
			}
		}, 250)
	};

	toggleAngle = () => {
		const updatedIsAngleDown = !this.state.isAngleDown;
		this.setState({ isAngleDown: updatedIsAngleDown });
	};

	scrollLeft = () => {
		if (this.scrollContainerRef.current) {
			this.scrollContainerRef.current.scrollLeft -= 297;
		}
	};

	scrollRight = () => {
		if (this.scrollContainerRef.current) {
			this.scrollContainerRef.current.scrollLeft += 297;
		}
	};

	render() {
		const { userRoles = [] } = this.props;
		const { loading, isModalVisible, tabs } = this.state;
		const isUserPending = this.props.status === UserStatus.pending;
		const onlyUserRole = userRoles.length === 1 && userRoles[0] === 'user';
		const alsoUserRole = !onlyUserRole && userRoles.find(userRole => userRole === 'user');

		const desiredTierId = localStorage.getItem('desiredTierId');

		return !loading && <div>
			{isUserPending && <DisclaimerUserPending />}

			<div className="settings">

				<PageNavigationTabs
					tabs={tabs}
					activeTab={this.state.activeTab}
					setActiveTab={this.setActiveTab}
					urlPath={'settings'}
				/>

				{this.state.activeTab === 1 && this.renderSectionAbout(onlyUserRole, alsoUserRole)}

				{this.state.activeTab === 2 && this.renderUserRole(false)}

				{!onlyUserRole && this.state.activeTab === 3 && this.renderSectionStatus()}

				{!onlyUserRole && this.state.activeTab === 4 && <Systems />}

				{this.state.activeTab === 5 && <Integrations onlyUserRole={onlyUserRole} />}

				{this.state.activeTab === 6 && this.renderSectionServices()}

				{!onlyUserRole && this.state.activeTab === 9 && <ModerationPermissions />}

				{this.state.activeTab === 7 && this.renderSectionMisc(onlyUserRole)}

				{!onlyUserRole && this.state.activeTab === 8 && this.renderSectionBots()}

			</div>

			{userRoles.length === 1 && userRoles[0] === UserRole.user && desiredTierId && (
				<ReactModal
					isOpen={true}
					style={whatsNewModalStyles}
					contentLabel="Select Role">
					{this.renderUserNameFiled()}
				</ReactModal>
			)}

			<ReactModal
				isOpen={isModalVisible}
				onRequestClose={() => {
					this.setState({ isModalVisible: false });
					api.updateSettings({ roleModalShown: true });
				}}
				style={whatsNewModalStyles}
				contentLabel="Select Role">
				{this.renderUserRole(true)}
			</ReactModal>

		</div>;
	}
}


function mapStateToProps(state) {
	const { config } = state;
	const { status, isNoServiceFee, system, features, userRoles } = config;

	return { status, isNoServiceFee, system, features, userRoles };
}

export default connect(mapStateToProps)(Settings);
