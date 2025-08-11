import React, {Component} from 'react';
import ReactModal from 'react-modal';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import Switch from 'react-switch';
import {AppModalStyles} from '../../../app/App';
import BillingTermsModal from '../../../coms/billing/BillingTermsModal';
import MonoJar from '../../../coms/mono/MonoJar';
import MonoLink from '../../../coms/mono/MonoLink';
import {BillingTerms} from '../../../enums/BillingEnums';
import {MaskedInput} from '../../../enums/DocApiEnums';
import {PaymentSystem, WfpMerchantStatus} from '../../../enums/PaymentEnums';
import SystemModel from '../../../models/PaymentSystemModel';
import {api} from '../../../services/api';
import {messageService} from '../../../services/messageService';
import {monoApi} from '../../../services/monoApi';
import helpers from '../../../utils/helpers';
import IpnUtils from '../../../utils/IpnUtils';
import {formatNumber, formatPercent, isValidFullName} from '../../../utils/utils';
import SystemDonatello from './SystemDonatello';

class Systems extends Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			showMonoLink: false,
			showBillingTerms: false,
			showData: {
				fondyMerchant: false,
				wfpMerchant: false
			},
			systems: new SystemModel(),
			stepFormErrors: {
				fullName: false,
				ipn: false
			}
		};
	}

	componentDidMount() {
		this.setState({loading: true}, () => {
			api.getPaymentSystems().then((resp) => {
				this.setState({loading: false});

				if (!resp.success) {
					messageService.error(resp.message);
					return;
				}

				if (resp.data) {
					this.setState({systems: resp.data}, () => {
						this.toggleAllMerchantData();
					});
				}
			});
		});
	}

	toggleSwitcher = (checked, system, field) => {
		const {systems} = this.state;
		systems[system][field] = checked;

		this.setState({systems});
		this.save(system, true).then();
	};

	onSystemsInputChange = (system, field, e, parentField) => {
		const {systems} = this.state;

		if (parentField) {
			if (!systems[system][parentField]) {
				systems[system][parentField] = {};
			}
			systems[system][parentField][field] = e.target.value;
		} else {
			systems[system][field] = e.target.value;
		}

		this.setState({systems});
	};

	toggleAllMerchantData = () => {
		this.toggleMerchantData(PaymentSystem.fondyMerchant.name, ['id', 'key']);
		this.toggleMerchantData(PaymentSystem.wfpMerchant.name, ['login', 'secretKey']);
	}

	toggleMerchantData = (systemName, keys) => {
		const system = this.state.systems[systemName];
		let emptyKeys = 0;

		for (const key of keys) {
			if (system[key] === '') {
				emptyKeys++;
			}
		}

		this.toggleShowData(systemName, emptyKeys === keys.length);
	};

	toggleShowData = (systemName, show) => {
		const {showData} = this.state;
		showData[systemName] = typeof show !== 'undefined' ? show : !showData[systemName];
		this.setState({showData});
	};

	buildFondyMerchantUrl = (suffix) => {
		const token = this.state.systems.fondyMerchant?.token || '';

		if (!token) {
			return '';
		}

		return `https://donatello.to/donate/fondyb/${token}/${suffix}`;
	};

	save = (system, refreshData) => {
		const {systems} = this.state;

		// Validate fondy merchant input
		if (system === PaymentSystem.fondyMerchant.name) {
			const fondyMerchant = systems.fondyMerchant;
			const isNotValidInputId = `${fondyMerchant.id}`.includes('*');
			const isNotValidInputKey = `${fondyMerchant.key}`.includes('*');

			if (isNotValidInputId || isNotValidInputKey) {
				messageService.error(`Невірний ID мерчанта або Ключ оплати`);
				return;
			}
		}

		this.setState({loading: true});

		return api.savePaymentSystem({[system]: systems[system]})
			.then((resp) => {
				if ((resp.success && refreshData) || (system === PaymentSystem.mono.name && refreshData)) {
					const {data} = resp;
					const {systems} = this.state;
					systems[system] = data[system];
					this.setState({loading: false, systems}, () => {
						this.toggleAllMerchantData();
					});
				}
			});
	};

	deleteSystemData = (system, keys) => {
		const {systems} = this.state;
		const systemData = systems[system];

		systemData.enabled = false;

		for (const key of keys) {
			systemData[key] = '';
		}

		this.setState({loading: true});

		return api.savePaymentSystem({[system]: systemData})
			.then((resp) => {
				const {data} = resp;
				const {systems} = this.state;
				systems[system] = data[system];
				console.log(systems);
				this.setState({loading: false, systems}, () => {
					this.toggleAllMerchantData();
				});
			});
	};

	onMonoLink = () => {
		this.setState({showMonoLink: true});
	};

	onMonoLinkSave = (data, token) => {
		const {systems} = this.state;
		const {mono} = systems;

		Object.assign(mono, data);
		Object.assign(systems, mono);

		this.setState({systems, showMonoLink: false}, () => {
			this.save(PaymentSystem.mono.name).then(() => {
				this.createMonoWebHook(data, token);
			});
		});
	};

	createMonoWebHook = (data, token) => {
		const webHookUrl = `${window.location.origin}/donate/IrfV8YjJhb/mono/${data.jarId}`;

		// test
		// console.log(webHookUrl);

		monoApi.createWebHook(token, {webHookUrl}).then((res) => {
			// console.log(res);

			if (res?.errorDescription) {
				// console.log(res.errorDescription);
				messageService.error('Помилка при реєстрації вебхуку');
			} else {
				messageService.success('Моно вебхук зареєстровано!');
			}
		});
	};

	onMonoLinkCancel = () => {
		this.setState({showMonoLink: false});
	};

	onMonoUnlink = () => {
		const {systems} = this.state;
		const {mono} = systems;

		Object.assign(mono, {jarId: null, jarConfig: null});
		Object.assign(systems, mono);

		this.setState({systems, showMonoLink: false}, () => {
			this.save(PaymentSystem.mono.name).then();
		});
	};

	renderFondy() {
		return <div className="payment-item d-flex justify-content-between align-items-md-top">
			<div className="payment-item-description">
				<div className="payment-item-title mb-2">
					Fondy
				</div>
				<div className="mt-4">
					<span className="secondary-text">
						<i className="fas fa-heart mr-2"/>Донати
						<i className="far fa-gem ml-3 mr-2"/>Підписки
					</span>
				</div>
				<div className="mt-4">
					<span>Visa, Mastercard</span>
				</div>
				<div className="mt-2">
					<span className="secondary-text">
						Комісія системи <strong>{formatPercent(PaymentSystem.fondy.transactionFee)}</strong>. Послуги сервісу <strong>{formatPercent(PaymentSystem.fondy.serviceFee)}</strong>.
						Донат від <strong>{PaymentSystem.fondy.donateMinAmount}</strong> до <strong>{PaymentSystem.fondy.donateMaxAmount}</strong> {PaymentSystem.fondy.currencySign}.
						Виплата від <strong>{formatNumber(PaymentSystem.fondy.payoutMinAmount)}</strong> {PaymentSystem.fondy.currencySign}.
					</span>
				</div>
				<div className="mt-3">
					<span style={{fontWeight: 'normal'}}>
						<i className="fa-solid fa-triangle-exclamation mr-1"/> Інтеграцію призупинено
						через <a href="https://fondy.ua/uk/blog/official-statement-30-04-24/" target="_blank"
								 rel="noopener noreferrer">скасування реєстрації Fondy у платіжних системах</a>.
					</span>
				</div>
			</div>

			<Switch id="fondyEnabled"
					className="mt-1"
					onChange={(checked) => this.toggleSwitcher(checked, PaymentSystem.fondy.name, 'enabled')}
					checked={false}
					disabled={true}
					height={24}
					width={45}
					onColor="#3579F6"/>
		</div>;
	}

	renderFondyMerchantUrl(id, title, suffix) {
		return <div className="mt-3 form-group row d-flex align-items-center">
			<small className="col-sm-3 text-muted">{title}</small>
			<div className="col-sm-9 d-flex">
				<input id={id} className="form-control form-control-sm" disabled
					   value={this.buildFondyMerchantUrl(suffix)}/>

				<div className="input-tools">
					<i className="fas fa-copy ml-2" style={{width: '20px'}}
					   title="Копіювати"
					   onClick={() => helpers.copyText(this.buildFondyMerchantUrl(suffix))}/>
				</div>
			</div>
		</div>;
	}

	renderFondyMerchant() {
		const showData = this.state.showData.fondyMerchant;
		const {fondyMerchant} = this.state.systems;

		return <div className="payment-item">
			<div className="form-group row col-sm-12 my-0">
				<label className="col-sm-3 col-form-label" htmlFor="fondyMerchantEnabled">
					<strong>{PaymentSystem.fondyMerchant.title}</strong>
				</label>

				<div className="col-sm-9">
					<Switch id="fondyMerchantEnabled" className="mt-1"
							onChange={(checked) => this.toggleSwitcher(checked, PaymentSystem.fondyMerchant.name, 'enabled')}
							checked={fondyMerchant.enabled || false}
							height={24}
							width={45}
							onColor="#3579F6"
					/>

					<div className="d-flex align-items-center justify-content-between">
						<small className="form-text text-muted mt-2">
							Донати і підписки на власний ФОП, ТОВ. Комісія системи <strong>{formatPercent(PaymentSystem.fondyMerchant.transactionFee)}</strong>.
							Послуги сервісу <strong>{formatPercent(PaymentSystem.fondyMerchant.serviceFee)}</strong>.
						</small>

						<div className="input-tools" style={{marginTop: '0.5rem'}}>
							<i className={showData ? 'fas fa-eye' : 'far fa-eye-slash'}
							   style={{width: '20px'}}
							   onClick={() => this.toggleShowData(PaymentSystem.fondyMerchant.name)}
							   data-toggle="tooltip" data-placement="top"
							   title={!showData ? 'Показати' : 'Сховати'}/>
						</div>
					</div>

					<div className="form-group row mt-4 d-flex align-items-center">
						<small className="col-sm-3 text-muted">ID мерчанта</small>
						<div className="col-sm-9">
							{showData &&
								<input id="merchantId" type="text" className="form-control form-control-sm" required
									   onChange={(e) => this.onSystemsInputChange(PaymentSystem.fondyMerchant.name, 'id', e)}
									   value={fondyMerchant?.id || ''}
									   onKeyDown={(e) => {
										   if (e.key === 'Enter') {
											   e.preventDefault(); // and ignore
										   }
									   }}/>
							}
							{!showData &&
								<input type="text" className="form-control form-control-sm" value={MaskedInput}
									   disabled={true}/>
							}
						</div>
					</div>

					<div className="form-group row d-flex align-items-center">
						<small className="col-sm-3 text-muted">Ключ оплати</small>
						<div className="col-sm-9">
							{showData &&
								<input id="merchantKey" type="text" className="form-control form-control-sm" required
									   onChange={(e) => this.onSystemsInputChange(PaymentSystem.fondyMerchant.name, 'key', e)}
									   value={fondyMerchant?.key || ''}
									   onKeyDown={(e) => {
										   if (e.key === 'Enter') {
											   e.preventDefault(); // and ignore
										   }
									   }}/>
							}
							{!showData &&
								<input type="text" className="form-control form-control-sm" value={MaskedInput}
									   disabled={true}/>
							}
						</div>
					</div>

					<div className="mt-2 text-align-right">
						<button className="btn btn-light btn-sm mr-3"
								onClick={(e) => {
									this.deleteSystemData(PaymentSystem.fondyMerchant.name, ['id', 'key']).then();
								}}>
							Видалити
						</button>

						<button className="btn btn-primary btn-sm"
								disabled={!fondyMerchant?.id || !fondyMerchant?.key}
								onClick={(e) => {
									this.save(PaymentSystem.fondyMerchant.name, true).then();
								}}>
							Зберегти
						</button>
					</div>

					<div className="mt-4">
						{this.renderFondyMerchantUrl('serverCallbackUrl', 'Server callback URL', 'callback')}
						{this.renderFondyMerchantUrl('chargebackCallbackUrl', 'Chargeback callback URL', 'chargeback_callback')}
					</div>
				</div>
			</div>
		</div>;
	}

	validateCardpayStepForm = () => {
		const {stepFormErrors} = this.state;
		const system = this.state.systems.cardpay;

		stepFormErrors.card = !system.card || !helpers.isValidCardNumber(system.card);
		stepFormErrors.fullName = !system.fullName || !isValidFullName(system.fullName, true);
		stepFormErrors.ipn = !system.ipn || !IpnUtils.isValid(system.ipn);

		this.setState({stepFormErrors});

		let hasErrors = stepFormErrors.card || stepFormErrors.fullName || stepFormErrors.ipn;

		return !hasErrors;
	}

	saveCardpayForm = () => {
		const isValid = this.validateCardpayStepForm();

		if (!isValid) {
			messageService.error('Виправ помилки у формі');
			return;
		}

		this.save(PaymentSystem.cardpay.name, true).then();
	};

	deleteCardpayForm = () => {
		const {systems} = this.state;

		systems.cardpay.card = '';
		systems.cardpay.fullName = '';
		systems.cardpay.ipn = '';

		this.setState({loading: true, systems}, () => {
			this.save(PaymentSystem.cardpay.name, true).then();
		});
	};

	renderCardpayForm = () => {
		const {stepFormErrors} = this.state;
		const {cardpay} = this.state.systems;

		return <div className="row mt-4 mb-2">
			<div className="col-9">
				<div className="row step-form">
					<div className="col-12">
						<h3>Дані для виплат</h3>
						<div
							className={`form-group row d-flex align-items-start ` + (stepFormErrors.card ? `form-error` : '')}>
							<label htmlFor="card" className="col-md-4 col-form-label">Картка для виплат</label>
							<div className="col-md-8">
								<input type="text" className="form-control" id="card"
									   value={cardpay?.card}
									   onChange={(e) => this.onSystemsInputChange(PaymentSystem.cardpay.name, 'card', e)}/>
								<small className="form-text text-muted"><strong>Картка</strong> українського банку у
									гривні</small>
							</div>
						</div>

						<div
							className={`form-group row d-flex align-items-start ` + (stepFormErrors.fullName ? `form-error` : '')}>
							<label htmlFor="fullName" className="col-md-4 col-form-label">Ім'я, прізвище</label>
							<div className="col-md-8">
								<input type="text" className="form-control" id="fullName"
									   value={cardpay.fullName}
									   onChange={(e) => this.onSystemsInputChange(PaymentSystem.cardpay.name, 'fullName', e)}/>
								<small className="form-text text-muted"><strong>Ім'я, прізвище</strong> власника картки</small>
							</div>
						</div>

						<div
							className={`form-group row d-flex align-items-start ` + (stepFormErrors.ipn ? `form-error` : '')}>
							<label htmlFor="ipn" className="col-md-4 col-form-label">РНОКПП</label>
							<div className="col-md-8">
								<input type="text" className="form-control" id="ipn"
									   value={cardpay.ipn}
									   onChange={(e) => this.onSystemsInputChange(PaymentSystem.cardpay.name, 'ipn', e)}/>
								<small className="form-text text-muted">
									<strong>РНОКПП</strong> (податковий номер) власника картки</small>
							</div>
						</div>

						<div className="form-group d-flex justify-content-end">
							<div>
								<button className="btn btn-outline-dark mr-4"
										disabled={this.state.loading || !cardpay.card || !cardpay.fullName || !cardpay.ipn}
										onClick={(e) => {
											this.deleteCardpayForm();
										}}>
									Видалити
								</button>

								<button className="btn btn-primary"
										disabled={!cardpay.card || !cardpay.fullName || !cardpay.ipn}
										onClick={(e) => {
											this.saveCardpayForm();
										}}>
									Зберегти
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	}

	renderCardpay() {
		const {cardpay} = this.state.systems;

		return <div className="payment-item">
			<div className="d-flex justify-content-between align-items-md-top">
				<div className="payment-item-description" style={{margin: '0 auto 0 0'}}>
					<div className="payment-item-title">
						{PaymentSystem.cardpay.title}
					</div>
					<div className="mt-4">
						<span className="secondary-text">
							<i className="fas fa-heart mr-2"/>Донати
							<i className="fas fa-money-check ml-4 mr-2"/>Виплати
						</span>
					</div>
					<div className="mt-4">
						<span>Visa, Mastercard (Україна)</span>
					</div>
					<div className="mt-2">
						<span className="secondary-text">
							Комісія системи <strong>{formatPercent(PaymentSystem.cardpay.transactionFee)}</strong>. Послуги сервісу <strong>{formatPercent(PaymentSystem.cardpay.serviceFee)}</strong>.
							Донат від <strong>{PaymentSystem.cardpay.donateMinAmount}</strong> до <strong>{PaymentSystem.cardpay.donateMaxAmount}</strong> {PaymentSystem.cardpay.currencySign}.
							Виплата від <strong>{formatNumber(PaymentSystem.cardpay.payoutMinAmount)}</strong> {PaymentSystem.cardpay.currencySign}.
						</span>
					</div>
				</div>

				<Switch
					id="cardpayEnabled"
					className="mt-1"
					onChange={(checked) => this.toggleSwitcher(checked, PaymentSystem.cardpay.name, 'enabled')}
					checked={cardpay?.enabled || false}
					height={24}
					width={45}
					onColor="#3579F6"
				/>
			</div>

			{this.renderCardpayForm()}
		</div>;
	}

	renderTrustyeu() {
		const {trustyeu} = this.state.systems;

		return <div className="payment-item">
			<div className="d-flex justify-content-between align-items-md-top">
				<div className="payment-item-description" style={{margin: '0 auto 0 0'}}>
					<div className="payment-item-title">
						{PaymentSystem.trustyeu.title}
					</div>
					<div className="mt-4">
						<span className="secondary-text">
							<i className="fas fa-heart mr-2"/>Донати
							<i className="fas fa-money-check ml-4 mr-2"/>Виплати
						</span>
					</div>
					<div className="mt-4">
						<span>Visa, Mastercard (EU)</span>
					</div>
					<div className="mt-1">
						<span className="secondary-text">
							Комісія системи <strong>{formatPercent(PaymentSystem.trustyeu.transactionFee)}</strong>. Послуги сервісу <strong>{formatPercent(PaymentSystem.trustyeu.serviceFee)}</strong>.
							Донат від <strong>{PaymentSystem.trustyeu.donateMinAmount}</strong> до <strong>{PaymentSystem.trustyeu.donateMaxAmount}</strong> {PaymentSystem.trustyeu.currencySign}.
							Виплата у <strong>криптовалюті {PaymentSystem.trustyeu.payoutCurrency}</strong> від <strong>{formatNumber(PaymentSystem.trustyeu.payoutMinAmount)}</strong> {PaymentSystem.trustyeu.payoutCurrencySign}.
						</span>
					</div>
				</div>

				<Switch
					id="trustyeuEnabled"
					className="mt-1"
					onChange={(checked) => this.toggleSwitcher(checked, PaymentSystem.trustyeu.name, 'enabled')}
					checked={trustyeu?.enabled || false}
					height={24}
					width={45}
					onColor="#3579F6"
				/>
			</div>
		</div>;
	}

	renderWhitepay() {
		const {whitepay} = this.state.systems;

		return <div className="payment-item">
			<div className="d-flex justify-content-between align-items-md-top">
				<div className="payment-item-description" style={{margin: '0 auto 0 0'}}>
					<div className="payment-item-title mb-2">
						{PaymentSystem.whitepay.title}
					</div>
					<div className="mt-4">
						<span className="secondary-text">
							<i className="fas fa-heart mr-2"/>Донати
							<i className="fas fa-money-check ml-4 mr-2"/>Виплати
						</span>
					</div>
					<div className="mt-4">
						<span>Криптовалюта (USDT, BTC, ETH, DOGE, TON та інші 140+ валют)</span>
					</div>
					<div className="mt-1">
						<span className="secondary-text">
							Комісія системи <strong>{formatPercent(PaymentSystem.whitepay.transactionFee)}</strong>. Послуги сервісу <strong>{formatPercent(PaymentSystem.whitepay.serviceFee)}</strong>.
							Донат від <strong>{PaymentSystem.whitepay.donateMinAmount}</strong> до <strong>{PaymentSystem.whitepay.donateMaxAmount}</strong> {PaymentSystem.whitepay.currencySign}.
							Виплата від <strong>{formatNumber(PaymentSystem.whitepay.payoutMinAmount)}</strong> {PaymentSystem.whitepay.currencySign}.
						</span>
					</div>
				</div>

				<Switch
					id="whitepayEnabled"
					className="mt-1"
					onChange={(checked) => this.toggleSwitcher(checked, PaymentSystem.whitepay.name, 'enabled')}
					checked={whitepay?.enabled || false}
					height={24}
					width={45}
					onColor="#3579F6"
				/>
			</div>
		</div>;
	}

	renderMono() {
		const {showMonoLink} = this.state;
		const {mono} = this.state.systems;

		return (
			<div className="payment-item">
				<div className="d-flex justify-content-between align-items-md-top">
					<div className="payment-item-description">
						<div className="payment-item-title">
							Моно
						</div>
						<div className="mt-4">
						<span className="secondary-text">
							<i className="fas fa-heart mr-2"/>Донати
						</span>
						</div>
						<div className="mt-4">
							<span className="d-flex flex-column flex-md-row">Visa, Mastercard</span>
						</div>
						<div className="mt-1">
							<span className="secondary-text">
								Комісія системи <strong>{formatPercent(PaymentSystem.mono.transactionFee)}</strong>. Послуги сервісу <strong>{PaymentSystem.mono.serviceFee} {PaymentSystem.mono.currencySign}</strong>.
								Донат від <strong>{PaymentSystem.mono.donateMinAmount}</strong> до <strong>{PaymentSystem.mono.donateMaxAmount}</strong> {PaymentSystem.mono.currencySign}.
							</span>
						</div>
						{!mono.jarId && <div className="mt-3">
							<span style={{fontWeight: 'normal'}}>
								 <i className="fab fa-youtube mr-1"/> <a
								href="https://www.youtube.com/watch?v=Kh9dQ0etN1o" target="_blank"
								rel="noopener noreferrer">Як підключити моно банку</a>
							</span>
						</div>}
					</div>

					<div className="switch-wrapper">
						<Switch
							id="monoEnabled"
							className="mt-1"
							onChange={(checked) => {
								if (checked && this.props.billing?.billingTerms !== BillingTerms.accept) {
									this.setState({showBillingTerms: true});
									messageService.error('Потрібно прийняти умови платних повідомлень');
									return;
								}

								this.toggleSwitcher(checked, PaymentSystem.mono.name, 'enabled');
							}}
							checked={mono?.enabled || false}
							height={24}
							width={45}
							onColor="#3579F6"
						/>
					</div>
				</div>

				<div className="d-flex mt-4 mb-4">
					{this.props.billing?.billingTerms !== BillingTerms.accept &&
						<button
							className="btn btn-outline-dark btn-sm btn-action mr-3" style={{padding: '10px 25px'}}
							onClick={() => this.setState({showBillingTerms: true})}>
							Умови платних повідомлень
						</button>}

					{this.props.billing?.billingTerms === BillingTerms.accept &&
						<Link className="btn btn-outline-dark btn-sm btn-action mr-3" style={{padding: '10px 25px'}}
							  to="/panel/billing?tab=plan&mode=main">
							Платні повідомлення
						</Link>}

					{!mono.jarId &&
						<button className="btn btn-primary btn-sm btn-action" style={{padding: '10px 25px'}}
								disabled={!mono.enabled}
								onClick={() => this.onMonoLink()}>
							Підключити банку
						</button>
					}
				</div>

				{mono.jarId && mono.jarConfig &&
					<div className={'mt-3 ' + (mono?.enabled ? '' : 'muted')}>
						<MonoJar
							jar={mono.jarConfig}
							mono={mono}
							selectedJar={{}}
							selectJar={() => {}}
							onButtonClick={() => this.onMonoUnlink()}
						/>
					</div>
				}

				{showMonoLink && mono?.enabled &&
					<MonoLink
						onSave={this.onMonoLinkSave}
						onCancel={this.onMonoLinkCancel}
					/>
				}

				<ReactModal
					isOpen={this.state.showBillingTerms}
					onRequestClose={null}
					style={{content: {...AppModalStyles.content, padding: '40px', width: '60%', maxWidth: '800px', maxHeight: '80vh'}}}
					contentLabel="Платні повідомлення">
					<BillingTermsModal onCloseModal={() => this.setState({showBillingTerms: false})}/>
				</ReactModal>
			</div>
		);
	}

	getWfpMerchantStatus = (status) => {
		const wfpMerchantStatus = WfpMerchantStatus[status] || null;

		return <span className={'badge badge-pill badge-' + (wfpMerchantStatus?.className || ``)}>{wfpMerchantStatus?.title || ``}</span>;
	}

	updateWfpMerchantStatus = () => {
		const {wfpMerchant} = this.state.systems;

		if (wfpMerchant?.login === '' || wfpMerchant.secretKey === '') {
			messageService.error(`Відсутні login та secret key`);
			return;
		}

		api.updatePaymentSystemStatus({system: PaymentSystem.wfpMerchant.system}).then((resp) => {
			const status = resp.data?.status;

			if (status) {
				const {systems} = this.state;
				systems.wfpMerchant.status = status;
				this.setState({systems});
				messageService.success(`Статус мерчанта оновлено`);
			}
		});
	}

	renderWfpMerchantForm = () => {
		const showData = this.state.showData.wfpMerchant;
		const {wfpMerchant} = this.state.systems;

		return <div className="row mt-4">
			<div className="col-9">
				<div className="row step-form">
					<div className="col-12">
						<div className="form-group row mt-4 d-flex align-items-center">
							<div className="col-md-4 col-form-label mb-2 mb-sm-0"
								 style={{fontSize: '14px', fontWeight: '500'}}>
								Login

								<span className="ml-2 pointer" style={{marginTop: '0.5rem'}}>
								<i className={showData ? 'fas fa-eye' : 'far fa-eye-slash'}
								   style={{width: '20px'}}
								   onClick={() => {
									   this.toggleShowData(PaymentSystem.wfpMerchant.name);
								   }}
								   data-toggle="tooltip" data-placement="top"
								   title={!showData ? 'Показати' : 'Сховати'}/>
							</span>
							</div>
							<div className="col-md-8">
								{showData &&
									<input id="wfpLogin" type="text" className="form-control form-control-sm"
										   required
										   onChange={(e) => this.onSystemsInputChange(PaymentSystem.wfpMerchant.name, 'login', e)}
										   value={wfpMerchant?.login || ''}
										   onKeyDown={(e) => {
											   if (e.key === 'Enter') {
												   e.preventDefault(); // and ignore
											   }
										   }}/>
								}
								{!showData &&
									<input type="text" className="form-control form-control-sm" value={MaskedInput}
										   disabled={true}/>
								}
							</div>
						</div>

						<div className="form-group row d-flex align-items-center">
							<div className="col-md-4 mb-2 mb-sm-0"
								 style={{fontSize: '14px', fontWeight: '500'}}>Secret key
							</div>
							<div className="col-md-8">
								{showData &&
									<input id="wfpSecretKey" type="text" className="form-control form-control-sm"
										   required
										   onChange={(e) => this.onSystemsInputChange(PaymentSystem.wfpMerchant.name, 'secretKey', e)}
										   value={wfpMerchant?.secretKey || ''}
										   onKeyDown={(e) => {
											   if (e.key === 'Enter') {
												   e.preventDefault(); // and ignore
											   }
										   }}/>
								}
								{!showData &&
									<input type="text" className="form-control form-control-sm" value={MaskedInput}
										   disabled={true}/>
								}
							</div>
						</div>

						<div className="form-group row d-flex align-items-center">
							<div className="col-md-4"
								 style={{fontSize: '14px', fontWeight: '500'}}>Лише підписки
							</div>
							<div className="col-md-8 text-right text-sm-left">
								<Switch id="wfpMerchantSubscriptionsOnly" className="mt-1"
										onChange={(checked) => this.toggleSwitcher(checked, PaymentSystem.wfpMerchant.name, 'subscriptionsOnly')}
										checked={wfpMerchant.subscriptionsOnly || false}
										height={24}
										width={45}
										onColor="#3579F6"
								/>
							</div>
						</div>

						<div className='form-group d-flex justify-content-end'>
							<button className="btn btn-outline-dark mr-4"
									onClick={(e) => {
										this.deleteSystemData(PaymentSystem.wfpMerchant.name, ['login', 'secretKey']).then();
									}}>
								Видалити
							</button>

							<button className="btn btn-primary"
									disabled={!wfpMerchant?.login || !wfpMerchant?.secretKey}
									onClick={(e) => {
										this.save(PaymentSystem.wfpMerchant.name, true).then();
									}}>
								Зберегти
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>;
	}

	renderWfpMerchant() {
		const {wfpMerchant} = this.state.systems;

		return <div className="payment-item">
			<div className="">
				<div className="row">
					<div className='col-9 col-md-5'>
						<div className="payment-item-title">
							Бізнес мерчант WayForPay
						</div>
					</div>
					<div className='col-md-6 col-lg-5 order-md-0 order-2'>
						<div
							className="mt-3 mt-md-0 d-flex align-items-center justify-content-between justify-content-md-end">
							<button className="btn btn-sm btn-light mr-3"
									style={{padding: '3px 15px', fontSize: '12px', fontWeight: '500'}}
									onClick={() => {
										this.updateWfpMerchantStatus();
									}}>
								<i className="fas fa-sync-alt mr-2 text-muted pointer"/> Оновити статус
							</button>
							{this.getWfpMerchantStatus(wfpMerchant?.status)}
						</div>
					</div>
					<div className='col-3 col-md-1 col-lg-2 text-right'>
						<Switch id="wfpMerchantEnabled"
								onChange={(checked) => {
									if (!wfpMerchant?.login || !wfpMerchant?.secretKey) {
										messageService.error(`Збережіть login та secret key`);
										return;
									}

									this.toggleSwitcher(checked, PaymentSystem.wfpMerchant.name, 'enabled');
								}}
								checked={wfpMerchant.enabled || false}
								height={24}
								width={45}
								onColor="#3579F6"
						/>
					</div>
				</div>
				<div className="payment-item-description">
					<div className="mt-4">
						<span className="secondary-text">
							<i className="fas fa-heart mr-2"/>Донати
							<i className="far fa-gem ml-3 mr-2"/>Підписки
							<i className="fas fa-receipt ml-4 mr-2"/>Податки
						</span>
					</div>
					<div className="mt-4">
						<span style={{fontWeight: 'normal'}}>
							<i className="fa-solid fa-briefcase mr-1"/> Донати і підписки на власний ФОП, ТОВ. <a
							href="/business/integration" target="_blank" rel="noopene noreferrer">Як інтегрувати мерчант WayForPay</a>.
						</span>
					</div>
					<div className="mt-4">
						<span className="d-flex flex-column flex-md-row">Visa, Mastercard</span>
					</div>
					<div className="mt-1">
						<span className="secondary-text">
							Комісія системи <strong>{formatPercent(PaymentSystem.wfpMerchant.transactionFee)}</strong>. Послуги сервісу <strong>{formatPercent(PaymentSystem.wfpMerchant.serviceFee)}</strong>.
							Донат від <strong>{PaymentSystem.wfpMerchant.donateMinAmount}</strong> до <strong>{PaymentSystem.wfpMerchant.donateMaxAmount}</strong> {PaymentSystem.wfpMerchant.currencySign}.
						</span>
					</div>
				</div>
			</div>

			{this.renderWfpMerchantForm()}
		</div>
	}

	render() {
		return <section className="mb-5">
			<h3>Способи оплати</h3>

			<SystemDonatello/>
			{this.renderCardpay()}
			{this.renderWfpMerchant()}
			{this.renderTrustyeu()}
			{this.renderWhitepay()}
			{this.renderMono()}
		</section>;
	}
}

function mapStateToProps(state) {
	return {
		nickname: state.nickname,
		status: state.status,
		billing: state.config?.billing
	};
}

export default connect(mapStateToProps)(Systems);
