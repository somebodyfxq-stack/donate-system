import arrayMove from 'array-move';
import React, {Component} from 'react';
import {SketchPicker} from 'react-color';
import SortableList, {SortableItem} from 'react-easy-sort';
import ReactModal from 'react-modal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {connect} from 'react-redux';
import Switch from 'react-switch';
import reactCSS from 'reactcss';

import DisclaimerUserPending from '../../coms/disclaimer/DisclaimerUserPending';

import Badge from '../../coms/misc/Badge';

import ImageCropper, {readFile} from '../../coms/misc/ImageCropper';
import PageNavigationTabs from '../../coms/misc/PageNavigationTabs';
import {fileUpload} from '../../coms/misc/UploadComponent';
import WizardStep1 from '../../coms/wizard/WizardStep1';

import '../../css/page.css';
import '../../css/settings.css';
import LANGUAGES from '../../enums/languagesEnum';
import {Currency, getCurrencyRate} from '../../enums/PaymentEnums';
// import {UserStatus, StatusTerms} from '../../enums/UserStatus';
import {UserStatus} from '../../enums/UserStatus';
import widgetEnum from '../../enums/widgetEnum';
import PageModel from '../../models/PageModel';
import {api} from '../../services/api';
import {messageService} from '../../services/messageService';
import helpers from '../../utils/helpers';
import {stringToNumber} from '../../utils/utils';

const tabs = [
	{
		id: 1,
		route: 'main',
		title: 'Основне'
	},
	{
		id: 2,
		route: 'donate-form',
		title: 'Донат форма'
	},
	{
		id: 7,
		route: 'thanks-text',
		title: 'Текст подяки'
	},
	{
		id: 3,
		route: 'statistics',
		title: 'Статистика'
	},
	{
		id: 4,
		route: 'social-networks',
		title: 'Соціальні мережі'
	},
	{
		id: 5,
		route: 'about-author',
		title: 'Про автора'
	},
	{
		id: 6,
		route: 'announcement',
		title: 'Оголошення'
	},
];

const socialLinks = [{
	id: 'youtube',
	name: 'Youtube',
	placeholder: 'https://youtube.com'
}, {
	id: 'twitch',
	name: 'Twitch',
	placeholder: 'https://twitch.tv'
}, {
	id: 'tiktok',
	name: 'Tiktok',
	placeholder: 'https://tiktok.com'
}, {
	id: 'facebook',
	name: 'Facebook',
	placeholder: 'https://facebook.com'
}, {
	id: 'telegram',
	name: 'Telegram',
	placeholder: 'https://t.me'
}, {
	id: 'discord',
	name: 'Discord',
	placeholder: 'https://discord.com'
}, {
	id: 'instagram',
	name: 'Instagram',
	placeholder: 'https://instagram.com'
}, {
	id: 'twitter',
	name: 'Twitter/X',
	placeholder: 'https://twitter.com'
}, {
	id: 'trovo',
	name: 'Trovo',
	placeholder: 'https://trovo.live'
}, {
	id: 'custom',
	name: 'Ваш сайт',
	placeholder: 'https://'
}];

const customStyles = {
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		borderRadius: '15px',
		transform: 'translate(-50%, -50%)',
		zIndex: '99',
		overflowX: 'hidden',
	}
};

const defaultColors = [
	'#FF0000',
	'#00FF00',
	'#0000FF',
	'#000000',
	'#dfdfdf'
];

class Page extends Component {

	constructor(props) {
		super(props);

		this.resolveUpload = this.resolveUpload.bind(this);
		this.setPageBgImage = this.setPageBgImage.bind(this);

		this.state = {
			page: new PageModel(),
			isLoading: false,
			activeTab: tabs[0].id,
			currencies: widgetEnum.CURRENCIES,
			colorsPalette: null,
			selectedTextColor: null,
			selectedButtonColor: null,
			error: null,
			showModal: false,
			isCropperImageModalOpen: false,
			imageSrc: null,
			imageName: '',
		};
	}

	fonts = widgetEnum.FONTS;

	componentDidMount() {
		this.setState({ isLoading: true }, () => {
			this.props.dispatch(api.getConfig());
			api.getPage().then(this.updateForm);
		});
	}

	updateForm = (page) => {
		if (!page.currencies) {
			page.currencies = ['UAH'];
		}

		let sortedCurr = [];
		let currencies = [...this.state.currencies];

		page.currencies.forEach((c, i) => {
			let indexToRemove = -1;
			currencies.forEach((cur, n) => {
				if (cur.label === c) {
					cur.selected = true;

					sortedCurr.push(cur);
					indexToRemove = n;
				}
			})

			if (indexToRemove !== -1) {
				currencies.splice(indexToRemove, 1)
			}
		})
		if (currencies.length > 0) {
			sortedCurr = [...sortedCurr, ...currencies];
		}

		this.setState({ page: page, currencies: sortedCurr, isLoading: false });
	};

	buildUrl = () => {
		return `${window.location.origin}/${this.props.nickname}`;
	};

	onSwitch(checked, prop, removeProp) {
		const page = this.state.page;
		page[prop] = checked;

		if (removeProp && !checked) {
			page[removeProp] = false;
		}

		this.setState({ page: page });
		this.onSubmit();
	}

	setPageBgImage = (croppedImage) => {
		fileUpload(null, 'pageBgImageData', 'pageBgImage', this.resolveUpload, croppedImage, this.state.imageName)
	};

	onFileChange = async (e) => {
		if (e.target.files && e.target.files.length > 0) {
			const file = e.target.files[0];
			const imageDataUrl = await readFile(file);

			this.setState({ imageSrc: imageDataUrl, imageName: file.name, isCropperImageModalOpen: true});
		}
	};

	closeModal = () => {
		this.setState({ isCropperImageModalOpen: false });
	};

	extractColorsPalette = async (imageURL) => {
		const res = await api.extractColorsPalette({imageURL});

		if (!res.success) {
			this.setState({ error: res.error });
			return;
		}

		const colorsPalette = res.colorsPalette.map(rgb => this.rgbToHex(rgb));

		this.setState({ colorsPalette });
	};

	rgbToHex = (rgb) => {
		return '#' + rgb.map(x => {
			const hex = x.toString(16);
			return hex.length === 1 ? '0' + hex : hex;
		}).join('');
	};

	openModal() {
		const page = this.state.page;
		const imageURL = page.pageBgImage;

		this.extractColorsPalette(imageURL);

		this.setState({
			showModal: true,
			error: null,
			colorsPalette: null,
			selectedButtonColor: null,
			selectedTextColor: null
		});
	};

	onSaveColors() {
		const { page, selectedTextColor, selectedButtonColor } = this.state;

		page.buttonColor = selectedButtonColor;
		page.buttonTextColor = selectedTextColor;

		this.setState({ page, showModal: false }, () => this.onSubmit());
	};

	onColorSelect(color, type) {
		this.setState({ [type]: color});
	};

	resolveUpload = (dataName, imageField, res) => {
		const { page } = this.state;

		api.deleteFile({ name: page[dataName]?.name }).then();

		page[dataName] = res;
		page[imageField] = res.url;

		this.setState({ page }, () => this.onSubmit());

		messageService.success('Файл завантажений');

		if (imageField === 'pageBgImage') {
			this.openModal();
		}
	};

	onClosePicker = (picker) => {
		const option = this.getColorPickerOption(picker);

		this.setState({ [option]: false });
	};

	getColorPickerOption = (picker) => {
		return `show${helpers.capitalize(picker)}Picker`;
	};

	onShowPicker = (picker) => {
		const option = this.getColorPickerOption(picker);

		this.setState({ [option]: !this.state[option] });
	};

	onChangeColor = (color, type) => {
		const page = this.state.page;

		switch (type) {
			case 'payPageColor':
				page[type] = color.rgb;
				break;
			default:
				page[type] = color.hex;
		}

		this.setState({ page });
	};

	onChange = (e) => {
		const { value, id } = e.target;
		const page = this.state.page;

		page[id] = value;
		this.setState({ page });
	};

	onChangeAmount = (e, i, field) => {
		const { value } = e.target;
		const page = this.state.page;

		page[field][i] = value;
		this.setState({ page });
	};

	sortCurrencies = (oldIndex, newIndex) => {
		this.setState({
			currencies: arrayMove(this.state.currencies, oldIndex, newIndex),
		});
	};

	selectCurrency = (i) => {
		const { currencies } = this.state;

		currencies[i].selected = !currencies[i].selected;

		this.setState({ currencies });
	};

	removePageBgImage = () => {
		let { page } = this.state;

		api.deleteFile({ name: page.pageBgImageData?.name }).then();

		delete page.pageBgImage;
		delete page.pageBgImageData;

		this.setState({ page }, () => this.onSubmit());

		messageService.success('Файл видалений');
	}

	addAmountButton = (e) => {
		e.preventDefault();
		let { page } = this.state;

		page.amountButtons.push([]);
		page.amountInternationalButtons.push([]);

		this.setState({ page });
	}

	removeAmountButton = (i) => {
		let { page } = this.state;
		page.amountButtons.splice(i, 1);
		page.amountInternationalButtons.splice(i, 1);

		this.setState({ page });
	}

	replaceSocialNetworksValues(socialNetworks, socialLinks) {
		const updatedSocialNetworks = {};

		for (const key in socialNetworks) {
			if (socialNetworks.hasOwnProperty(key)) {
				let value = socialNetworks[key];

				if (value === '') { // skip empty values
					continue;
				}

				if (!value.startsWith('http://') && !value.startsWith('https://')) { // check whether the value starts with http or https
					const link = socialLinks.find(link => link.id === key);
					if (link) {
						const placeholder = link.placeholder;
						const placeholderWithoutPrefix = placeholder.replace('https://', ''); // cut off https:// from placeholder
						if (value.includes(placeholderWithoutPrefix)) { // check if the value includes the placeholder without https://
							value = value.replace(placeholderWithoutPrefix, ''); // if value includes placeholder, remove it
						}
						if (!value.startsWith('https://') && link.id !== 'custom') { // if value doesn't start with https:// and the link id is not custom
							value = placeholder + '/' + (value.startsWith('/') ? value.slice(1) : value); // prepend placeholder and / to the value
						} else {
							value = placeholder + value // prepend placeholder to the value
						}
					}
				}

				updatedSocialNetworks[key] = value;
			}
		}

		return updatedSocialNetworks;
	}

	onSubmit = (e) => {
		e && e.preventDefault();

		const { page, currencies } = this.state;

		const pageCurrencies = [];
		currencies.forEach(item => {
			item.selected && pageCurrencies.push(item.label)
		});
		page.currencies = pageCurrencies;

		if (page.minAmount < 5) {
			messageService.error('Мінімальна сума донату не може бути менша ніж 5 грн. Дані не збережено!');
			return;
		}

		if (page.minAmountInternationalCurrency < 1) {
			messageService.error('Мінімальна сума донату не може бути менша ніж 1 usd/eur. Дані не збережено!');
			return;
		}

		let buttons = page.amountButtons.filter(a => parseInt(a) < parseInt(page.minAmount));
		if (buttons.length > 0) {
			messageService.error('Сума на кнопках повинна бути більша ніж Мінімальна сума донату. Дані не збережено!');
			return;
		}

		buttons = page.amountInternationalButtons.filter(a => parseInt(a) < parseInt(page.minAmountInternationalCurrency));
		if (buttons.length > 0) {
			messageService.error('Сума на кнопках повинна бути більша ніж Мінімальна сума донату. Дані не збережено!');
			return;
		}

		const updatedSocialNetworks = this.replaceSocialNetworksValues(page.socialNetworks, socialLinks);
		page.socialNetworks = updatedSocialNetworks;

		api.savePage(this.state.page).then((data) => {
			this.props.dispatch(api.getConfig());
			// console.log(data);
		});
	};

	buildStyles(page) {
		return reactCSS({
			default: {
				buttonTextColor: {
					width: '24px',
					height: '24px',
					borderRadius: '50%',
					background: page.buttonTextColor
				},
				buttonColor: {
					width: '24px',
					height: '24px',
					borderRadius: '50%',
					background: page.buttonColor
				},
				textColor: {
					width: '24px',
					height: '24px',
					borderRadius: '50%',
					background: page.textColor
				},
				payPageColor: {
					width: '24px',
					height: '24px',
					borderRadius: '50%',
					background: `rgba(${page.payPageColor.r},${(page.payPageColor.g)},${(page.payPageColor.b)},${(page.payPageColor.a)})`
				},
				swatch: {
					background: '#fff',
					borderRadius: '50%',
					boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
					display: 'inline-block',
					cursor: 'pointer',
					width: '24px',
					height: '24px'
				},
				popover: {
					position: 'absolute',
					top: '-340px',
					left: '30px',
					zIndex: '2'
				},
				cover: {
					position: 'fixed',
					top: '0px',
					right: '0px',
					bottom: '0px',
					left: '0px',
				}
			}
		}, this.props, this.state);
	}

	copyPageLink = () => {
		helpers.copyText(this.buildUrl());
	};

	onSocialChange = (e) => {
		const { id, value } = e.target;
		const { page } = this.state;

		page.socialNetworks[id] = value;
		this.setState({ page });
	};

	onTextEditorChanged = (description, field, source, i) => {
		if (source !== 'user') return;

		const page = this.state.page;

		page[field][i]['text'] = description;

		this.setState({page});
	};

	onChangeThanksTextAmount = (e, i, field) => {
		const { value, id } = e.target;
		const page = this.state.page;

		page[field][i][id] = value;

		this.setState({ page });
	};

	addThanksTextSection = (e) => {
		e.preventDefault();
		let { page } = this.state;

		page.userThanksText.push({
			minAmount: 0,
			maxAmount: 0,
			text: ''
		});

		this.setState({ page });
	}

	removeThanksTextSection = (i) => {
		let { page } = this.state;

		page.userThanksText.splice(i, 1);

		this.setState({ page });
	}

	renderPageLink() {
		const { page } = this.state;
		const pageUrl = this.buildUrl();

		return page.isActive
			? <a href={pageUrl} target="_blank" rel="noopener noreferrer">{pageUrl}</a>
			: <span className="text-muted">{pageUrl}</span>;
	}

	renderStatusIcons() {
		const { page } = this.state;

		return <div className="va-center-inline status-icons">
			<i className={'fas ml-2 mr-2 ' + (page.isActive ? 'fa-lock-open' : 'fa-lock')}
				title={page.isActive ? 'Сторінка активна' : 'Сторінка неактивна'} />
			<i className={'fas ml-2 mr-2 ' + (page.isPublic ? 'fa-eye' : 'fa-eye-slash')}
				title={page.isPublic ? 'Сторінка відкрита' : 'Сторінка приватна'} />
		</div>;
	}

	renderSectionStatus(page) {
		return (
			<section className='section-wrapper'>
				<h3>Основне</h3>

				<div className="form-group">
					<div className='section-status d-flex flex-column'>
						<div className="row page-view-item">
							<div className="col-12 col-sm-4">
								<span className='page-view-item-name'>Моя сторінка</span>
							</div>
							<div className='col-12 col-sm-8 page-view-item-description mt-3 mt-sm-0'>
								<div className='mb-2'>
									{this.renderPageLink()}
									<i className="fa-regular fa-copy pointer ml-2 ml-sm-3" title="Копіювати" onClick={this.copyPageLink} />
								</div>
								<span>Посилання на вашу донат-сторінку. Ваші підписники можуть надсилати повідомлення та донати.</span>
							</div>
						</div>

						<div className="row page-view-item">
							<div className="col-9 col-sm-4">
								<span className='page-view-item-name'>{page.isActive ? 'Активна' : 'Неактивна'}</span>
							</div>
							<div className='col-12 col-sm-6 page-view-item-description mt-3 mt-sm-0'>
								<span>
									{page.isActive ? 'Сторінка доступна для користувачів' : 'Сторінка недоступна для користувачів'}
								</span>
							</div>
							<div className="col-3 col-sm-2 d-flex align-items-center justify-content-end pl-0">
								<Switch
									id="isActive"
									onChange={(checked) => this.onSwitch(checked, 'isActive')}
									checked={page.isActive}
									height={24}
									width={45}
									onColor={'#3579F6'}
								/>
							</div>
						</div>

						<div className="row page-view-item">
							<div className="col-9 col-sm-4">
								<span className='page-view-item-name'>{page.isPublic ? 'Відкрита' : 'Приватна'}</span>
							</div>
							<div className='col-12 col-sm-6 page-view-item-description mt-3 mt-sm-0'>
								<span>
									{page.isPublic ? 'Сторінка числиться у відкритому списку' : 'Сторінка не числиться у відкритому списку'}
								</span>
							</div>
							<div className="col-3 col-sm-2 d-flex align-items-center justify-content-end pl-0">
								<Switch
									id="isPublic"
									onChange={checked => this.onSwitch(checked, 'isPublic')}
									checked={page.isPublic}
									height={24}
									width={45}
									onColor={'#3579F6'}
								/>
							</div>
						</div>

						<div className="row align-items-start">
							<div className="col-9 col-sm-4">
								<span className='page-view-item-name'>Оплата комісії</span>
							</div>
							<div className='col-12 col-sm-6 page-view-item-description mt-3 mt-sm-0'>
								<span>Дозволити глядачеві оплатити комісію платіжної системи і сервісу</span>
							</div>
							<div className="col-3 col-sm-2 d-flex align-items-center justify-content-end pl-0">
								<Switch
									id="allowPayFee"
									onChange={(checked) => this.onSwitch(checked, 'allowPayFee')}
									checked={page.allowPayFee || false}
									height={24}
									width={45}
									onColor={'#3579F6'}
								/>
							</div>
						</div>
					</div>
				</div>
			</section>
		)
	}

	renderSectionPageView(page) {
		return <section className='section-wrapper'>
			<h3>Вигляд сторінки</h3>
			<div className="form-group">
				<div className='section-page-view d-flex flex-column'>

					<div className="row page-view-item border-0 pb-0">
						<div className="col-9 col-sm-4">
							<span className='page-view-item-name'>Аватарка</span>
						</div>
						<div className='col-12 col-sm-8 page-view-item-description d-flex align-items-center mt-3 mt-sm-0'>
							<div className="avatar">
								<img src={this.state.page.photo} alt="User's avatar" />
							</div>

							<div>
								<span>Максимальна вага: 5 Мб</span>
								<div className='position-relative mt-2'>
									<label htmlFor="avatar" className="upload-button-label mb-0">
										<div className='upload-button-page-view'>Вибрати файл</div>
									</label>
									<input
										id="avatar"
										type="file"
										className="upload-button-page"
										onChange={(e) => fileUpload(e, 'avatarData', 'photo', this.resolveUpload)}
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="row page-view-item">
						<div className="col-9 col-sm-4">
							<span className='page-view-item-name'>Обкладинка сторінки</span>
						</div>
						<div className='col-12 col-sm-8 page-view-item-description mt-3 mt-sm-0'>
							<div className='upload-bg-image'>
								<span>Максимальна вага: 5 Мб</span>
								<span>Рекомендований розмір: 1040 х 200px</span>
								<div className='position-relative mt-2'>
									<label htmlFor="bgImage" className="upload-button-label mb-0">
										<div className='upload-button-page-view'>Вибрати файл</div>
									</label>
									<input
										id="bgImage"
										type="file"
										className="upload-button-page"
										onChange={this.onFileChange}
									/>
								</div>

								{this.state.page.pageBgImage && (
									<div className="bg-image">
										<img src={this.state.page.pageBgImage} alt="Background" />
										<div className='d-flex align-items-center'>
											<span>{this.state.page.pageBgImageData.name}</span>
											<i
												className="fas fa-trash-alt pointer ml-2"
												title="Видалити"
												onClick={() => this.removePageBgImage()}
											/>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>

					<div className="row page-view-item border-0 pb-0">
						<div className="col-9 col-sm-4">
							<span className='page-view-item-name'>Назва сторінки</span>
						</div>
						<div className='col-12 col-sm-8 page-view-item-description mt-3 mt-sm-0'>
							<input
								id="displayName"
								type="text"
								className="form-control"
								required
								placeholder='Вкажіть назву сторінки'
								maxLength={35}
								value={page.displayName}
								onChange={(e) => this.onChange(e)}
							/>
						</div>
					</div>

					<div className="row page-view-item">
						<div className="col-9 col-sm-4">
							<span className='page-view-item-name'>Опис сторінки</span>
						</div>
						<div className='col-12 col-sm-8 page-view-item-description mt-3 mt-sm-0'>
							<textarea
								id="description"
								type="text"
								className="form-control"
								required
								value={page.description}
								placeholder='Додайте опис сторінки, розкажіть про себе'
								maxLength={150}
								rows='3'
								onChange={(e) => this.onChange(e)}
							/>
						</div>
					</div>

					<div className="row page-view-item border-0 pb-0">
						<div className="col-9 col-sm-4">
							<span className='page-view-item-name'>Мова сторінки</span>
						</div>
						<div className='col-12 col-sm-8 page-view-item-description mt-3 mt-sm-0'>
							<select
								id="language"
								value={page.language}
								onChange={(e) => this.onChange(e)}
								className="form-control"
							>
								{LANGUAGES.map((item) =>
									<option key={item.id} value={item.id}> {item.name} </option>
								)}
							</select>
						</div>
					</div>

					<div className="row align-items-start pb-5">
						<div className="col-9 col-sm-4">
							<span className='page-view-item-name'>Автовизначення мови</span>
						</div>
						<div className='col-12 col-sm-6 page-view-item-description mt-3 mt-sm-0 pr-0'>
							<span>Визначення мови за налаштуваннями браузера користувача</span>
						</div>
						<div className="col-3 col-sm-2 d-flex align-items-center justify-content-end pl-0">
							<Switch id="autoDetectionLanguage"
								onChange={(checked) => this.onSwitch(checked, 'autoDetectionLanguage')}
								checked={page.autoDetectionLanguage}
								height={24}
								width={45}
								onColor={'#3579F6'}
							/>
						</div>
					</div>

					{this.renderFixedBottomSaveButton()}
				</div>
			</div>

			{this.state.isCropperImageModalOpen &&
				<ImageCropper
					imageUrl={this.state.imageSrc}
					setPageBgImage={(croppedImage) => this.setPageBgImage(croppedImage)}
					closeModal={this.closeModal}
				/>
			}
		</section>
	}

	renderSectionDonates(page, styles) {
		const { currencies } = this.state;
		const { userRoles } = this.props;

		const onlyUsersWithRoleBlogger = userRoles.includes('blogger');

		// const statusTerms = StatusTerms[status];
		const isForeignCurrenciesChecked = currencies.some(currencie => (currencie.label === 'USD' || currencie.label === 'EUR') && currencie.selected);

		return (
			<section className='section-wrapper'>
				<h3>Донат форма</h3>

				<div className="row page-view-item">
					<div className="col-9 col-sm-4">
						<span className='page-view-item-name'>Повідомлення від донатора</span>
					</div>
					<div className='col-12 col-sm-6 page-view-item-description mt-3 mt-sm-0'>
						<span>
							Вимкнути повідомлення від донатора як обов'язкове поле
						</span>
					</div>
					<div className="col-3 col-sm-2 d-flex align-items-center justify-content-end pl-0">
						<Switch id="commentOptionally"
							onChange={(checked) => this.onSwitch(checked, 'commentOptionally')}
							checked={page.commentOptionally}
							height={24}
							width={45}
							onColor={'#3579F6'}
						/>
					</div>
				</div>

				<div className="row page-view-item">
					<div className="col-9 col-sm-4">
						{Badge()}
						<span className='page-view-item-name'>Форма одноразового донату</span>
					</div>
					<div className='col-12 col-sm-6 page-view-item-description mt-3 mt-sm-0'>
						<span>
							Не показувати форму одноразового донату на донат сторінці
						</span>
						{!onlyUsersWithRoleBlogger && (
							<div className="text-disclaimer mt-2">
								Щоб мати можливість вимкнути форму одноразового донату потрібно увімкнути роль "Блогер"
							</div>
						)}
					</div>
					<div className="col-3 col-sm-2 d-flex align-items-center justify-content-end pl-0">
						<Switch id="hideOneTimeDonationForm"
							onChange={(checked) => this.onSwitch(checked, 'hideOneTimeDonationForm')}
							checked={page.hideOneTimeDonationForm}
							disabled={!onlyUsersWithRoleBlogger}
							height={24}
							width={45}
							onColor={'#3579F6'}
						/>
					</div>
				</div>

				<div className="row page-view-item">
					<div className="col-9 col-sm-4">
						{Badge()}
						<span className='page-view-item-name'>Акцент на регулярні підписки</span>
					</div>
					<div className='col-12 col-sm-6 page-view-item-description mt-3 mt-sm-0'>
						<span>
							Змінити донат сторінку та акцентувати саме на регулярних підписках, а не одноразових донатах
						</span>
						{!onlyUsersWithRoleBlogger && (
							<div className="text-disclaimer mt-2">
								Щоб мати можливість зробити акцент на підписки потрібно увімкнути роль "Блогер"
							</div>
						)}
					</div>
					<div className="col-3 col-sm-2 d-flex align-items-center justify-content-end pl-0">
						<Switch id="accentOnSubscription"
							onChange={(checked) => this.onSwitch(checked, 'accentOnSubscription')}
							checked={page.accentOnSubscription}
							disabled={!onlyUsersWithRoleBlogger}
							height={24}
							width={45}
							onColor={'#3579F6'}
						/>
					</div>
				</div>

				<div className="row page-view-item">
					<div className="col-9 col-sm-4">
						{Badge()}
						<span className='page-view-item-name'>Підписка з будь-якою сумою</span>
					</div>
					<div className='col-12 col-sm-6 page-view-item-description mt-3 mt-sm-0'>
						<span>
							Показувати підписку з будь-якою сумою на донат сторінці
						</span>
					</div>
					<div className="col-3 col-sm-2 d-flex align-items-center justify-content-end pl-0">
						<Switch id="showSubscriptionWithAnyAmount"
							onChange={(checked) => this.onSwitch(checked, 'showSubscriptionWithAnyAmount')}
							checked={page.showSubscriptionWithAnyAmount}
							disabled={!onlyUsersWithRoleBlogger}
							height={24}
							width={45}
							onColor={'#3579F6'}
						/>
					</div>
				</div>

				<div className="row page-view-item p-0 border-0">
					<div className="col-12 col-sm-4">
						<span className='page-view-item-name'>Валюти</span>
					</div>
					<div className='col-12 col-sm-8 page-view-item-description mt-3 mt-sm-0'>
						<span>Виберіть валюти та встановіть порядок валют на донат сторінці</span>

						<div className="input-group amount-count currency-list mt-3">
							<SortableList onSortEnd={this.sortCurrencies} className="list" draggedItemClassName="dragged">
								{this.state.currencies.map((item, i) =>
									<SortableItem key={i}>
										<div className="input-group-text mb-2">
											<div className="fas fa-bars mr-3" style={{ cursor: 'move' }} />
											<input type="checkbox" id="scales" className="mr-2" name="scales"
												onChange={() => this.selectCurrency(i)}
												checked={item.selected || false}
												disabled={item.label === 'UAH'}
											></input>
											{item.label} {item.sign}
										</div>
									</SortableItem>
								)}
							</SortableList>
						</div>
					</div>
				</div>

				<div className="row page-view-item p-0 border-0">
					<div className="col-12 col-md-4">
						<span className="page-view-item-name">Мінімальна сума донату</span>
					</div>
					<div className="row col-12 col-md-8 page-view-item-description mt-3 mt-sm-0">
						<div className="col-12 mb-3">
							<span>Найменша мінімальна сума 10&nbsp;₴ та 1&nbsp;$/€.<br/>
								Платіжна система може перевизначити вказану тобою мінімальну суму.
							</span>
						</div>
						<div className="col-6 col-md-5 pr-0">
							<div className="input-group amount-count">
								<input
									id="minAmount"
									type="number"
									value={page.minAmount}
									name="amount"
									className="form-control input-wrapper-left"
									placeholder="Вкажіть суму"
									onChange={(e) => this.onChange(e)}
									required
								/>

								<div className="vertical-line-wrapper">
									<div className="vertical-line"></div>
								</div>

								<div className="input-group-append">
									<span className="input-group-text input-wrapper-right"
										  id="amount"><strong>₴</strong>&nbsp;UAH</span>
								</div>
							</div>
						</div>
						{isForeignCurrenciesChecked && (
							<div className="col-6 col-md-5">
								<div className="input-group amount-count">
									<input
										id="minAmountInternationalCurrency"
										type="number"
										className="form-control input-wrapper-left"
										value={page.minAmountInternationalCurrency}
										onChange={(e) => this.onChange(e)}
										required
									/>

									<div className="vertical-line-wrapper">
										<div className="vertical-line"></div>
									</div>

									<div className="input-group-append">
										<span className="input-group-text input-wrapper-right" id="amount">$ | €</span>
									</div>
								</div>
							</div>
						)}
					</div>


				</div>

				<div className="row page-view-item">
					<div className="col-12 col-md-4">
						<span className="page-view-item-name">Суми на кнопках донату</span>
					</div>
					<div className="row col-md-8 page-view-item-description d-flex amount-group mt-3 mt-sm-0 col-12">
						<div className='col-12 mb-3'>
							<span>Вкажіть суми на донат кнопках. Донатор зможе натиснути кнопку з потрібною сумою і вона автоматично додасться в поле введення суми</span>
						</div>

						<div className='col-12 mb-3'>
							<div className='text-disclaimer'>
								Суми на кнопках донату не повинні перевищувати максимальну суму одного донату для вашого рівня
							</div>
						</div>

						<div className="col-6 col-md-5 pr-0">
							{page.amountButtons.map((am, i) =>
								<div key={i} className="amount-count d-flex">

									<div className="input-group">
										<input
											id="minAmount"
											type="number"
											value={am}
											name="amount"
											className="form-control input-wrapper-left"
											placeholder="Вкажіть суму"
											onChange={(e) => this.onChangeAmount(e, i, 'amountButtons')}
										/>

										<div className="vertical-line-wrapper">
											<div className="vertical-line"></div>
										</div>

										<div className="input-group-append">
											<span className="input-group-text input-wrapper-right" id="amount"><strong>₴</strong>&nbsp;UAH</span>
										</div>
									</div>
								</div>
							)}
						</div>

						<div className="col-6 col-md-5">
							{page.amountInternationalButtons.map((am, i) =>
								<div key={i} className="amount-count d-flex">
									{isForeignCurrenciesChecked && <div className="input-group">
										<input
											id="minAmountInt"
											type="number"
											placeholder="Вкажіть суму"
											className="form-control input-wrapper-left"
											required
											value={am}
											onChange={(e) => this.onChangeAmount(e, i, 'amountInternationalButtons')} />

										<div className="vertical-line-wrapper">
											<div className="vertical-line"></div>
										</div>

										<div className="input-group-append">
											<span className="input-group-text input-wrapper-right" id="amount">$ / €</span>
										</div>
									</div>}
									{(page.amountButtons.length > 1) && (
										<div className="input-tools">
											<i
												className="fa-regular pointer fa-trash-can"
												title="Видалити"
												onClick={() => this.removeAmountButton(i)}
											/>
										</div>
									)}
								</div>
							)}
						</div>

						<div className='col-12 mb-3'>
							{(page.amountButtons.length < 6) &&
								<button
									className="btn btn-outline-dark add-button-donate-amount"
									title="Додати кнопку"
									onClick={(e) => this.addAmountButton(e)}
								>
									<span>Додати кнопку</span>
									<i className="fa-solid fa-plus"></i>
								</button>
							}
						</div>
					</div>
				</div>

				<div className="row page-view-item">
					<div className="col-9 col-sm-4">
						<span className='page-view-item-name'>Текст основної кнопки</span>
					</div>
					<div className='col-12 col-sm-8 page-view-item-description mt-3 mt-sm-0'>
						<input
							id="buttonText"
							type="text"
							className="form-control"
							required
							placeholder='Надіслати'
							value={page.buttonText}
							onChange={(e) => this.onChange(e)}
						/>
						<small className="brief-info text-muted form-text mt-2">
							Придумайте текст для основної кнопки на донат формі
						</small>
					</div>
				</div>

				<div className="row page-view-item p-0 border-0">
					<div className="col-10 col-sm-4">
						<span className='page-view-item-name'>
							Колір тексту та кнопок
						</span>
					</div>
					<div className='col-2 col-sm-8 page-view-item-description'>
						<div style={styles.swatch} onClick={() => this.onShowPicker('buttonColor')}>
							<div style={styles.buttonColor} />
						</div>
						{this.state.showButtonColorPicker && <div className='sketch-picker-popover' style={styles.popover}>
							<div style={styles.cover} onClick={() => {
								this.onClosePicker('buttonColor')
							}} />
							<SketchPicker
								color={page.buttonColor}
								onChange={(e) => this.onChangeColor(e, 'buttonColor')} />
						</div>
						}
					</div>
				</div>

				<div className="row page-view-item pb-5 border-0">
					<div className="col-10 col-sm-4">
						<span className='page-view-item-name'>
							{`Колір тексту на кнопці «${page.buttonText || 'Надіслати'}»`}
						</span>
					</div>
					<div className='col-2 col-sm-8 page-view-item-description'>
						<div style={styles.swatch} onClick={() => this.onShowPicker('buttonTextColor')}>
							<div style={styles.buttonTextColor} />
						</div>
						{this.state.showButtonTextColorPicker && <div className='sketch-picker-popover' style={styles.popover}>
							<div style={styles.cover} onClick={() => {
								this.onClosePicker('buttonTextColor')
							}} />
							<SketchPicker
								color={page.buttonTextColor}
								onChange={(e) => this.onChangeColor(e, 'buttonTextColor')} />
						</div>
						}
					</div>
				</div>

				{this.renderFixedBottomSaveButton()}
			</section>
		);
	}

	renderSectionStatsTextColor(page) {
		const userRoles = this.props.userRoles;

		return (
			<section className="section-wrapper">
				<section>
					<h3>Статистика</h3>

					<div className="statistics-item">
						<span className='page-view-item-name'>Топ-5 донаторів</span>
						<Switch
							id="showTopUsers"
							onChange={(checked) => this.onSwitch(checked, 'showTopUsers', 'showTopUsersAmount')}
							checked={page.showTopUsers}
							height={24}
							width={45}
							onColor={'#3579F6'}
						/>
					</div>

					<div className="statistics-item">
						<span className='page-view-item-name'>Суми Топ-5 донаторів</span>
						<Switch
							id="showTopUsersAmount"
							disabled={!page.showTopUsers}
							onChange={(checked) => this.onSwitch(checked, 'showTopUsersAmount')}
							checked={page.showTopUsersAmount}
							height={24}
							width={45}
							onColor={'#3579F6'}
						/>
					</div>

					<div className="statistics-item">
						<span className='page-view-item-name'>Останні 5 донаторів</span>
						<Switch
							id="showLastFive"
							onChange={(checked) => this.onSwitch(checked, 'showLastFive', 'showLastFiveUsersAmount')}
							checked={page.showLastFive}
							height={24}
							width={45}
							onColor={'#3579F6'}
						/>
					</div>

					<div className="statistics-item">
						<span className='page-view-item-name'>Суми останніх 5 донаторів</span>
						<Switch
							id="showLastFiveUsersAmount"
							disabled={!page.showLastFive}
							onChange={(checked) => this.onSwitch(checked, 'showLastFiveUsersAmount')}
							checked={page.showLastFiveUsersAmount}
							height={24}
							width={45}
							onColor={'#3579F6'}
						/>
					</div>

					{userRoles.includes("blogger") && (
						<h3 className="pt-4">Регулярні підписки</h3>
					)}

					{userRoles.includes("blogger") && (
						<div className="statistics-item">
							<span className='page-view-item-name'>Кількість підписок</span>
							<Switch
								id="showSubscriptionSubscribers"
								onChange={(checked) => this.onSwitch(checked, 'showSubscriptionSubscribers')}
								checked={page.showSubscriptionSubscribers}
								height={24}
								width={45}
								onColor={'#3579F6'}
							/>
						</div>
					)}

					{userRoles.includes("blogger") && (
						<div className="statistics-item border-0 p-0">
							<span className='page-view-item-name'>Сума підписок</span>
							<Switch
								id="showSubscriptionSum"
								onChange={(checked) => this.onSwitch(checked, 'showSubscriptionSum')}
								checked={page.showSubscriptionSum}
								height={24}
								width={45}
								onColor={'#3579F6'}
							/>
						</div>
					)}
				</section>
			</section>
		)
	}

	renderSocialLink(link) {
		const { page } = this.state;

		return <div className="col-sm-6 mb-2">
			<div className="">
				<label className="col-form-label" htmlFor={link.id}>
					{link.name}
				</label>

				<div className="input-group mb-2">
					<div className="input-group-prepend">
						<div className='input-group-text' style={{ fontSize: "20px" }}>
							{link.id !== 'trovo' && link.id !== 'custom' && <i className={`fab fa-${link.id}`} style={{ color: '#282828' }} />}
							{link.id === 'trovo' && <i className={`fa-solid fa-t`} />}
							{link.id === 'custom' && <i className={`fa-solid fa-link`} />}
						</div>
					</div>
					<input
						type="text"
						className='form-control'
						id={link.id}
						value={page.socialNetworks?.[link.id]}
						placeholder={link.placeholder}
						onChange={this.onSocialChange}
					/>
				</div>
			</div>
		</div>;
	}

	renderSocialLinks() {
		return <section className="social-links section-wrapper">
			<h3>Соціальні мережі</h3>

			<div className='text-disclaimer mb-3'>
				Посилання на соціальні мережі можуть бути у форматі: <strong>your-channel-name, youtube.com/your-channel-name, https://youtube.com/your-channel-name</strong>
			</div>

			<div className="row">
				{this.renderSocialLink(socialLinks[0])}
				{this.renderSocialLink(socialLinks[1])}
			</div>
			<div className="row">
				{this.renderSocialLink(socialLinks[2])}
				{this.renderSocialLink(socialLinks[3])}
			</div>
			<div className="row">
				{this.renderSocialLink(socialLinks[4])}
				{this.renderSocialLink(socialLinks[5])}
			</div>
			<div className="row">
				{this.renderSocialLink(socialLinks[6])}
				{this.renderSocialLink(socialLinks[7])}
			</div>
			<div className="row mb-3">
				{this.renderSocialLink(socialLinks[8])}
				{this.renderSocialLink(socialLinks[9])}
			</div>

			{this.renderSaveButton()}
		</section>;
	}

	renderAboutAuthor(page) {
		return (
			<section className='section-wrapper'>
				<h3>Про автора</h3>

				<div className='page-view-item-description mb-4'>
					<span>Ця інформація буде відображатись в окремому табі на вашій сторінці</span>
				</div>

				<div className="row page-view-item border-0 p-0">
					<div className="col-9 col-sm-4">
						<span className='page-view-item-name'>Коротко про автора сторінки</span>
					</div>
					<div className='col-12 col-sm-8 page-view-item-description mt-3 mt-sm-0'>
						<textarea
							id="aboutAuthor"
							className="form-control"
							rows='5'
							placeholder='Додайте коротку інформацію про автора сторінки'
							value={page.aboutAuthor}
							onChange={(e) => this.onChange(e)}
						/>
					</div>
				</div>

				{this.renderSaveButton()}
			</section>
		)
	}

	renderDisclaimer(page) {
		return (
			<section className='section-wrapper'>
				<h3>Оголошення (дисклеймер)</h3>

				<div className="row page-view-item border-0 pb-0 align-items-center align-items-md-start">
					<div className="col-9 col-sm-4">
						<span className='page-view-item-name'>Оголошення активне</span>
					</div>
					<div className='col-3 col-sm-8 page-view-item-description mt-3 mt-sm-0'>
						<Switch
							id="showDisclaimer"
							onChange={(checked) => this.onSwitch(checked, 'showDisclaimer')}
							checked={page.showDisclaimer}
							height={24}
							width={45}
							onColor={'#3579F6'}
						/>
					</div>
				</div>

				<div className="row page-view-item border-0 pb-0">
					<div className="col-9 col-sm-4">
						<span className='page-view-item-name'>Заголовок</span>
					</div>
					<div className='col-12 col-sm-8 page-view-item-description mt-3 mt-sm-0'>
						<input
							id="disclaimerLabel"
							type="text"
							className="form-control"
							placeholder="Додайте заголовок"
							maxLength={35}
							disabled={!page.showDisclaimer}
							value={page.disclaimerLabel}
							onChange={(e) => this.onChange(e)}
						/>
					</div>
				</div>

				<div className="row page-view-item border-0 pb-0">
					<div className="col-9 col-sm-4">
						<span className='page-view-item-name'>Текст оголошення</span>
					</div>
					<div className='col-12 col-sm-8 page-view-item-description mt-3 mt-sm-0'>
						<textarea
							id="disclaimerText"
							type="text"
							className="form-control"
							value={page.disclaimerText}
							placeholder='Додайте текст'
							maxLength={145}
							disabled={!page.showDisclaimer}
							rows='5'
							onChange={(e) => this.onChange(e)}
						/>
					</div>
				</div>

				{page.disclaimerLabel && page.disclaimerText && (
					<div className="row page-view-item border-0 pb-0">
						<div className="col-9 col-sm-4">
							<span className='page-view-item-name'>Прев’ю оголошення</span>
						</div>
						<div className='col-12 col-sm-8 col-xl-6 mt-3 mt-sm-0'>
							<div className='preview-disclaimer'>
								<div className='preview-disclaimer-title'>
									{page.disclaimerLabel}
								</div>
								<span>{page.disclaimerText}</span>
								<button
									className='btn btn-primary preview-disclaimer-btn'
									style={{ backgroundColor: page.buttonColor, color: page.buttonTextColor }}
									onClick={(e) => e.preventDefault()}
								>
									{page.buttonText || 'Підтримати'}
								</button>
							</div>
						</div>
					</div>
				)}

				{this.renderSaveButton()}
			</section>
		)
	}

	renderSectionThanksText = (page) => {
		return (
			<section className='section-wrapper thanks-text'>
				<h3>Текст подяки</h3>

				<div className="text-disclaimer mb-4">
					Це текст подяки для глядача, який буде видимий після успішної оплати на донат сторінці (одноразовий донат та регулярні підписки).
				</div>

				<div className="row page-view-item pb-5 border-0">
					<div className="col-12 col-md-4 mb-3">
						<span className='page-view-item-name'>Мін / макс сума донату і текст</span>
					</div>

					<div className='col col-md-8 col-lg-7'>
						{page.userThanksText.map((item, i) =>
							<div key={i} className="page-view-item-description mt-3 mt-sm-0 mb-4">
								<div className='mb-3'>
									<span>Мінімальна і максимальна сума донату</span>
								</div>

								<div className='row'>
									<div className='col-10'>
										<div className="row mb-2">
											<div className="col">
												<div className="input-group amount-count">
												<input id="minAmount" type="text" className="form-control input-wrapper-left" required
													value={item.minAmount}
													onChange={(e) => this.onChangeThanksTextAmount(e, i, 'userThanksText')}
												/>
												<div className="vertical-line-wrapper">
													<div className="vertical-line"></div>
												</div>
												<div className="input-group-append">
													<span className="input-group-text input-wrapper-right">
													₴
													</span>
												</div>
												</div>
											</div>
											<div className="col">
												<div className="input-group amount-count">
												<input id="maxAmount" type="text" className="form-control input-wrapper-left" required
													value={item.maxAmount}
													onChange={(e) => this.onChangeThanksTextAmount(e, i, 'userThanksText')} />
												<div className="vertical-line-wrapper">
													<div className="vertical-line"></div>
												</div>
												<div className="input-group-append">
													<span className="input-group-text input-wrapper-right">
													₴
													</span>
												</div>
												</div>
											</div>
										</div>

										<div className="row mb-2">
											<div className="col">
												<div className="input-group amount-count">
													<input id="minAmount" type="text" className="form-control input-wrapper-left" required
														value={`~${(stringToNumber(item.minAmount, 1) / getCurrencyRate(Currency.USD)).toFixed(2)}`}
														disabled/>
													<div className="input-group-append">
														<span className="input-group-text input-wrapper-right">
														$
														</span>
													</div>
												</div>
											</div>
											<div className="col">
												<div className="input-group amount-count">
													<input id="maxAmount" type="text" className="form-control input-wrapper-left" required
														value={`~${(stringToNumber(item.maxAmount, 1) / getCurrencyRate(Currency.USD)).toFixed(2)}`}
														disabled/>
													<div className="input-group-append">
														<span className="input-group-text input-wrapper-right">
														$
														</span>
													</div>
												</div>
											</div>
										</div>
										<div className="row mb-3">
											<div className="col">
												<div className="input-group amount-count">
													<input id="minAmount" type="text" className="form-control input-wrapper-left" required
														value={`~${(stringToNumber(item.minAmount, 1) / getCurrencyRate(Currency.EUR)).toFixed(2)}`}
														disabled/>
													<div className="input-group-append">
														<span className="input-group-text input-wrapper-right">
														€
														</span>
													</div>
												</div>
											</div>
											<div className="col">
												<div className="input-group amount-count">
													<input id="maxAmount" type="text" className="form-control input-wrapper-left" required
														value={`~${(stringToNumber(item.maxAmount, 1) / getCurrencyRate(Currency.EUR)).toFixed(2)}`}
														disabled/>
													<div className="input-group-append">
														<span className="input-group-text input-wrapper-right">
														€
														</span>
													</div>
												</div>
											</div>
										</div>
									</div>
									<div className='col-2'>
										<div className='amount-group'>
											<div className="input-tools">
												<i
													className="fa-regular pointer fa-trash-can"
													title="Видалити"
													onClick={() => this.removeThanksTextSection(i)}
												/>
											</div>
										</div>
									</div>
								</div>

								<div className='mb-3'>
									<span>Текст подяки</span>
								</div>

								<ReactQuill theme="snow" id='text' value={item.text}
									onChange={(e, delta, source) => this.onTextEditorChanged(e, 'userThanksText', source, i)}/>
							</div>
						)}

						{page.userThanksText.length < 10 &&
							<div className={`d-flex ${page.userThanksText.length === 0 && 'justify-content-start justify-content-md-end'}`} >
								<button
									className="btn btn-outline-dark add-button-donate-amount justify-content-between"
									title="Додати текст подяки"
									onClick={(e) => this.addThanksTextSection(e)}
								>
									<span>Додати текст</span>
									<i className="fa-solid fa-plus"></i>
								</button>
							</div>
						}
					</div>

				</div>

				{page.userThanksText.length <= 1 ? this.renderSaveButton() : this.renderFixedBottomSaveButton()}
			</section>
		)
	}

	renderSaveButton() {
		return (
			<div className='row save-button-wrapper'>
				<div className='col-12 col-sm-12 d-flex justify-content-sm-end justify-content-center px-0'>
					<button className="btn btn-dark" onClick={(e) => this.onSubmit(e)}>Зберегти зміни</button>
				</div>
			</div>

		)
	}

	renderFixedBottomSaveButton() {
		return (
			<div className='row'>
				<div className='fixed-save-button col-11 col-sm-9 col-md-10 col-lg-12'>
					<div className='d-flex justify-content-sm-end justify-content-center'>
						<button className="btn btn-dark" onClick={(e) => this.onSubmit(e)}>Зберегти зміни</button>
					</div>
				</div>
			</div>
		)
	}

	setActiveTab = (tabId) => {
		this.setState({ activeTab: tabId });
	}

	renderConfirmColorsPalette() {
		const { page, selectedTextColor, selectedButtonColor, colorsPalette, error } = this.state;
		const colors = !error ? colorsPalette : defaultColors;

		return (
			<div className='colors-palette-modal'>
				<h4 className='text-center mb-3'><strong>Палітра кольорів</strong></h4>

				<div className='text-disclaimer mb-3'>
					Ви можете використати палітру кольорів, створену з обкладинки сторінки донатів, для налаштування кольорів кнопок та тексту
				</div>

				{!error && !colors && <div className='text-center item-name mb-3'>
					Завантаження кольорів...
				</div>}

				{colors && (
					<div className='mb-3'>
						<div className='item-name mb-3'>Колір тексту та кнопок</div>
						<div className='colors-palette mb-3'>
							{colors.map((color, i) =>
								<div key={i} style={{ borderBottom: selectedButtonColor === color ? `4px solid ${color}` : 'none'	}}>
									<div style={{ backgroundColor: color, width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', marginBottom: '3px' }}
										className={selectedButtonColor === color ? 'selected-color' : selectedTextColor === color ? 'disabled-color' : ''}
										onClick={() => this.onColorSelect(color, 'selectedButtonColor')}
									>
									</div>
								</div>
							)}
						</div>

						<div className='item-name mb-3'>Колір тексту на кнопці {`«${page.buttonText || 'Надіслати'}»`}</div>
						<div className='colors-palette'>
							{colors.map((color, i) =>
								<div key={i} style={{ borderBottom: selectedTextColor === color ? `4px solid ${color}` : 'none'	}}>
									<div style={{ backgroundColor: color, width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', marginBottom: '3px' }}
										className={selectedTextColor === color ? 'selected-color' : selectedButtonColor === color ? 'disabled-color' : ''}
										onClick={() => this.onColorSelect(color, 'selectedTextColor')}
									>
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{colors && (
					<div className='text-disclaimer mb-3'>
						Цей вибір не є обовʼязковим, ви можете відмінити та користуватися стандартними кольорами. Також зможете змінити їх згодом у вкладці "Донат форма"
					</div>
				)}

				<div className='d-flex justify-content-between mt-4'>
					<button className='btn btn-outline-dark' onClick={() => this.setState({ showModal: false })}>Скасувати</button>
					<button className='btn btn-dark' disabled={ !selectedButtonColor || !selectedTextColor } onClick={() => this.onSaveColors()}>Застосувати</button>
				</div>
			</div>
		)
	}

	render() {
		const { isLoading, page } = this.state;
		const { hasSettings } = this.props;
		const isUserPending = this.props.status === UserStatus.pending;

		if (page.amountButtons.length === 0) {
			page.amountButtons = [''];
		}

		const styles = this.buildStyles(page);

		return !isLoading && <div>
			<PageNavigationTabs
				tabs={tabs}
				activeTab={this.state.activeTab}
				setActiveTab={this.setActiveTab}
				urlPath='page'
			/>

			{isUserPending && <DisclaimerUserPending />}

			{!hasSettings && <WizardStep1 />}

			{hasSettings && <form onSubmit={this.onSubmit}>

				<div className="page-module row-form px-0 pb-4 pb-sm-0">
					{this.state.activeTab === 1 && this.renderSectionStatus(page)}

					{this.state.activeTab === 1 && this.renderSectionPageView(page)}

					{this.state.activeTab === 2 && this.renderSectionDonates(page, styles)}

					{this.state.activeTab === 3 && this.renderSectionStatsTextColor(page)}

					{this.state.activeTab === 4 && this.renderSocialLinks()}

					{this.state.activeTab === 5 && this.renderAboutAuthor(page)}

					{this.state.activeTab === 6 && this.renderDisclaimer(page)}

					{this.state.activeTab === 7 && this.renderSectionThanksText(page)}
				</div>
			</form>}


			<ReactModal
                isOpen={this.state.showModal}
                onRequestClose={() => this.setState({ showModal: false })}
                style={customStyles}
                contentLabel="Colors palette Modal"
            >
				{this.renderConfirmColorsPalette()}
			</ReactModal>

		</div>;
	}
}

function mapStateToProps(state) {
	const { nickname, hasSettings, status, userRoles, createdAt } = state.config;

	return { nickname, hasSettings, status, userRoles, createdAt };
}

export default connect(mapStateToProps)(Page);
