import React, {Component} from 'react';
import {connect} from 'react-redux';
import Switch from 'react-switch';
import {DonatelloSystemStatus, PaymentSystem} from '../../../enums/PaymentEnums';
import {isUserBaseVerifiedStatus} from '../../../enums/UserStatus';
import SystemDonatelloModel, {ContractType} from '../../../models/SystemDonatelloModel';
import {api} from '../../../services/api';
import {messageService} from '../../../services/messageService';
import IbanUtils from '../../../utils/IbanUtils';
import IpnUtils from '../../../utils/IpnUtils';
import {formatNumber, formatPercent, isValidEmail, isValidFullName} from '../../../utils/utils';

class SystemDonatello extends Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			system: new SystemDonatelloModel(),
			stepFormEnabled: false,
			stepFormErrors: {
				fullName: false,
				ipn: false,
				iban: false,
				phone: false,
				email: false
			},
			stepContractEnabled: false
		};
	}

	componentDidMount() {
		if (!isUserBaseVerifiedStatus(this.props.status)) {
			return; // Skip loading because system configuration is not available for unverified users
		}

		this.setState({loading: true}, () => {
			api.getPaymentSystems(PaymentSystem.donatello.system).then((resp) => {
				this.setState({loading: false});

				if (!resp.success) {
					messageService.error(resp.message);
					return;
				}

				if (resp.data?.donatello) {
					this.setState({system: resp.data.donatello});
				}
			});
		});
	}

	getSystemStatus = (status) => {
		const systemStatus = DonatelloSystemStatus[status] || null;

		return systemStatus ? <span className={'badge badge-pill badge-' + (systemStatus.className || ``)}>{systemStatus.title || ``}</span> : <span></span>;
	}

	save = (system) => {
		return api.savePaymentSystem({donatello: system}).then((resp) => {
			if (resp.success && resp?.data?.donatello) {
				this.setState({system: resp?.data?.donatello});
			}
		});
	};

	toggleSwitcher = (checked, field) => {
		const {system} = this.state;
		system[field] = checked;

		this.setState({system});
		this.save(system).then();
	};

	onInputChange = (e, field, parentField) => {
		const {system} = this.state;

		if (parentField) {
			if (!system[parentField]) {
				system[parentField] = {};
			}
			system[parentField][field] = e.target.value;
		} else {
			system[field] = e.target.value;
		}

		this.setState({system});
	};

	validateStepForm = () => {
		const {system, stepFormErrors} = this.state;

		stepFormErrors.fullName = !system.fullName || !isValidFullName(system.fullName);
		stepFormErrors.ipn = !system.ipn || !IpnUtils.isValid(system.ipn);
		stepFormErrors.iban = !system.iban || !IbanUtils.isValidIbanNumber(system.iban, 'UA');
		stepFormErrors.email = !system.email || !isValidEmail(system.email);

		this.setState({stepFormErrors});

		let hasErrors = stepFormErrors.fullName || stepFormErrors.ipn || stepFormErrors.iban || stepFormErrors.email;

		return !hasErrors;
	}

	saveStepForm = () => {
		const isValid = this.validateStepForm();

		if (!isValid) {
			messageService.error('Виправ помилки у заявці');
			return;
		}

		const {system} = this.state;

		this.setState({loading: true}, () => {
			api.savePaymentSystem({[PaymentSystem.donatello.system]: system}).then((resp) => {
				this.setState({loading: false});

				if (resp.success) {
					const {system} = this.state;
					Object.assign(system, resp.data[PaymentSystem.donatello.system]);
					this.setState({system});
					setTimeout(() => {
						this.setState({stepFormEnabled: false, stepContractEnabled: true});
					}, 1000);
				}
			});
		});
	};

	deleteStepForm = () => {
		this.setState({loading: true}, () => {
			api.deleteSystemData(PaymentSystem.donatello.name).then((resp) => {
				this.setState({loading: false, system: new SystemDonatelloModel()});
			});
		});
	};

	saveStepContract = (isOffer) => {
		this.setState({loading: true})

		if (this.state.loading) {
			return false;
		}

		setTimeout(() => {
			this.signContract(isOffer);
		}, 500);
	};

	signContract = (isOffer) => {
		if (!isOffer && this.state.system.contractExternalUrl) {
			this.setState({loading: false});
			window.open(this.state.system.contractExternalUrl, '_blank');
			return;
		}

		api.signContract({isOffer}).then((resp) => {
			this.setState({loading: false});

			if (resp.success && resp.data?.donatello) {
				const system = resp.data.donatello;
				this.setState({system});
				if (!isOffer && system.contractExternalUrl) {
					window.open(system.contractExternalUrl, '_blank');
				}
			}
		});
	}

	checkContractStatus = () => {
		this.setState({loading: true});

		api.checkContractStatus().then((resp) => {
			this.setState({loading: false});

			if (resp.success && resp.data?.donatello) {
				const system = resp.data.donatello;
				this.setState({system});

				if (system.isSignedByDonatello && system.isSignedByClient) {
					messageService.success('Активацію завершено');
				} else if (system.isOfferAccepted) {
					messageService.success('Активовано з обмеженням виплат');
				} else {
					messageService.success('Не активовано');
				}
			} else if (resp.message) {
				messageService.error(resp.message);
			}
		});
	}

	renderStepContract = () => {
		const {nickname} = this.props;
		const {isOfferAccepted, isSignedByDonatello, isSignedByClient, contractExternalUrl} = this.state.system;

		return <div className="row step-contract">
			<div className="col-12 mt-4">
				<div className="row">
					<div className={`col-2 number-circle-container`}>
						<div className={`number-circle ${isOfferAccepted ? 'number-circle-success' : 'number-circle-warning'}`}><span>1</span></div>
					</div>
					<div className="col-8">
						<h3 className="mb-3">Оферта договору</h3>
						<p className="mt-2 mb-3">
							Тобі потрібно <a target="_blank" rel="noopener noreferrer"
											 href={`/user/contract/${nickname}`}>ознайомитися
							з офертою договору</a> і прийняти умови. Цього достатньо, щоб ми почали співпрацю
							і активували цей спосіб оплати.
						</p>

						<button className="btn btn-primary pl-4 pr-4"
								disabled={this.state.loading || isOfferAccepted}
								onClick={(e) => this.saveStepContract(true)}>
							{isOfferAccepted ? `Оферту прийнято` : `Прийняти оферту`}
						</button>

						<a className="btn btn-outline-dark ml-3" target="_blank" rel="noopener noreferrer" href={`/user/contract/${nickname}`}>
							Ознайомитися
						</a>
					</div>
				</div>

				<div className="row mt-4">
					<div className="col-2 number-circle-container">
						<div className={`number-circle ${isSignedByDonatello && isSignedByClient ? 'number-circle-success' : 'number-circle-warning'}`}><span>2</span></div>
					</div>
					<div className="col-8">
						<h3 className="mb-3">Підписати договір</h3>
						<p className="mt-2 mb-3">
							Щоб зняти ліміти виплат, потрібно підписати договір. Після нашого підпису ти отримаєш імейл
							від <a href="https://edo.vchasno.ua" target="_blank" rel="noopener noreferrer">сервісу
							«Вчасно</a>».
							Перейди за посиланням і підпиши договір, наприклад, через «Дію.Підпис».
						</p>
						<button className="btn btn-primary pl-4 pr-4 mt-2 mr-3"
								disabled={this.state.loading || !isSignedByDonatello || isSignedByClient}
								onClick={(e) => this.saveStepContract(false)}>
							{isSignedByDonatello ? (isSignedByClient ? `Підписаний усіма` : `Підписати договір`) : `Очікується наш підпис`}
						</button>
						{!isSignedByClient &&
							<button className="btn btn-outline-dark mt-2"
									disabled={isSignedByDonatello && isSignedByClient}
									onClick={() => this.checkContractStatus()}>
								Перевірити статус
							</button>
						}
						{isSignedByClient && contractExternalUrl &&
							<a className="btn btn-outline-dark mt-2" href={contractExternalUrl} target="_blank"
							   rel="noopener noreferrer">
								Переглянути на «Вчасно»
							</a>
						}
					</div>
				</div>
			</div>
			<div className="col-12 mt-3">
				<div className="form-group d-flex justify-content-end">
					<button className="btn btn-outline-dark mr-2"
							onClick={(e) => this.setState({stepContractEnabled: false})}>
						Закрити
					</button>
				</div>
			</div>
		</div>
	}

	renderStepForm = () => {
		const {system, stepFormErrors} = this.state;
		const {isOfferAccepted} = this.state.system;

		return <div className="row step-form">
			<div className="col-12">
				<div className="form-group row" style={{marginBottom: '-10px'}}>
					<div className="col-md-4"></div>
					<div className="col-md-8">
						<div className="form-check form-check-inline ml-2">
							<input className="form-check-input" type="radio" name="contractType"
								   id={ContractType.individual}
								   checked={system?.contractType === ContractType.individual}
								   disabled={isOfferAccepted}
								   value={ContractType.individual}
								   onChange={(e) => this.onInputChange(e, 'contractType')}
							/>
							<label className="col-form-label form-check-label ml-1" htmlFor={ContractType.individual}>
								Фізична особа
							</label>
						</div>
						<div className="form-check form-check-inline ml-3">
							<input className="form-check-input" type="radio" name="contractType" id={ContractType.fop}
								   checked={system?.contractType === ContractType.fop}
								   disabled={isOfferAccepted}
								   value={ContractType.fop}
								   onChange={(e) => this.onInputChange(e, 'contractType')}
							/>
							<label className="col-form-label form-check-label ml-1" htmlFor={ContractType.fop}>
								ФОП
							</label>
						</div>
					</div>
				</div>

				<div
					className={`form-group row d-flex align-items-start ` + (stepFormErrors.fullName ? `form-error` : '')}>
					<label htmlFor="fullName" className="col-md-4 col-form-label">Прізвище, ім'я, по-батькові</label>
					<div className="col-md-8">
						<input type="text" className="form-control" id="fullName"
							   value={system?.fullName}
							   disabled={isOfferAccepted}
							   onChange={(e) => this.onInputChange(e, 'fullName')}/>
						<small className="form-text text-muted">
							ПІБ українською мовою (не латинською транслітерацією)
						</small>
					</div>
				</div>

				<div className={`form-group row d-flex align-items-start ` + (stepFormErrors.ipn ? `form-error` : '')}>
					<label htmlFor="ipn" className="col-md-4 col-form-label">Інд. податковий номер</label>
					<div className="col-md-8">
						<input type="text" className="form-control" id="ipn"
							   disabled={isOfferAccepted}
							   value={system?.ipn}
							   onChange={(e) => this.onInputChange(e, 'ipn')}/>
						<small className="form-text text-muted">Твій <strong>індивідуальний податковий
							номер</strong> (РНОКПП)</small>
					</div>
				</div>

				<div className={`form-group row d-flex align-items-start ` + (stepFormErrors.iban ? `form-error` : '')}>
					<label htmlFor="iban" className="col-md-4 col-form-label">IBAN рахунок</label>
					<div className="col-md-8">
						<input type="text" className="form-control" id="iban"
							   disabled={isOfferAccepted}
							   value={system?.iban}
							   onChange={(e) => this.onInputChange(e, 'iban')}/>
						{system?.contractType === ContractType.individual && <small className="form-text text-muted">
							Твій <strong>IBAN рахунок фізичної особи у гривні</strong>, зареєстрований на твоє
							прізвище, ім'я та податковий номер
						</small>}
						{system?.contractType === ContractType.fop && <small className="form-text text-muted">
							Твій <strong>IBAN рахунок ФОП у гривні</strong>. Важливо не сплутати з особистим рахунком фізичної особи.
						</small>}
					</div>
				</div>

				<div
					className={`form-group row d-flex align-items-start ` + (stepFormErrors.phone ? `form-error` : '')}>
					<label htmlFor="phone" className="col-md-4 col-form-label">Телефон</label>
					<div className="col-md-8">
						<input type="text" className="form-control" id="email"
							   disabled={isOfferAccepted}
							   value={system?.phone}
							   onChange={(e) => this.onInputChange(e, 'phone')}/>
						<small className="form-text text-muted"><strong>Телефон</strong> у форматі: +38 063 100 20 30</small>
					</div>
				</div>

				<div
					className={`form-group row d-flex align-items-start ` + (stepFormErrors.email ? `form-error` : '')}>
					<label htmlFor="email" className="col-md-4 col-form-label">Ел. пошта</label>
					<div className="col-md-8">
						<input type="text" className="form-control" id="email"
							   disabled={isOfferAccepted}
							   value={system?.email}
							   onChange={(e) => this.onInputChange(e, 'email')}/>
						<small className="form-text text-muted"><strong>Ел. пошта</strong> у
							сервісі <a href="https://vchasno.ua" target="_blank" rel="noopener noreferrer">Вчасно</a>,
							щоб підписати електронний договір</small>
					</div>
				</div>

				<div className="form-group d-flex justify-content-between">
					<button className="btn btn-outline-dark mr-2"
							onClick={(e) => this.setState({stepFormEnabled: false})}>
						Закрити
					</button>

					<div>
						<button className="btn btn-outline-dark mr-4"
								disabled={this.state.loading}
								onClick={(e) => {
									this.deleteStepForm();
								}}>
							{isOfferAccepted ? `Розірвати договір` : `Скасувати`}
						</button>

						<button className="btn btn-primary"
								disabled={this.state.loading}
								onClick={(e) => {
									if (isOfferAccepted) {
										messageService.error('Договір уже прийнято');
										return;
									}

									this.saveStepForm();
								}}>
							{system?.stepFormDone ? `Поновити` : `Надіслати`}
						</button>
					</div>
				</div>
			</div>
		</div>
	}

	renderStep = (title, action, checked, checkedCls, actionEnabled, onClick) => {
		return <div className="step">
			<div className="step-content">
				<div className="step-status">
					<i className={`fa-regular fa-circle-check ${checked ? 'step-checked' : ''} ${checkedCls}`}></i>
				</div>
				<div className="step-title">
					{title}
				</div>
			</div>
			<div className="step-action">
				<button className={`btn btn-xs ${actionEnabled ? `btn-primary` : `btn-outline-light`}`}
						disabled={!actionEnabled}
						onClick={onClick}>{action}</button>
			</div>
		</div>;
	};

	renderSteps = () => {
		const {system, stepFormEnabled, stepContractEnabled} = this.state;
		const stepFormAction = system?.stepFormDone ? 'Поновити заявку' : 'Подати заявку';

		return <div className="row steps">
			<div className="col-12 col-md-4">
				{this.renderStep('Заявка', stepFormAction, system?.stepFormDone, '', true, () => {
					this.setState({stepFormEnabled: !stepFormEnabled, stepContractEnabled: false});
				})}
			</div>
			<div className="col-12 col-md-4">
				{this.renderStep('Договір', 'Підписати договір', system?.isOfferAccepted, (system?.isSignedByDonatello && system?.isSignedByClient) ? '' : 'step-checked-warning', system?.stepFormDone, () => {
					if (!system.stepFormDone) {
						return;
					}
					this.setState({stepFormEnabled: false, stepContractEnabled: !stepContractEnabled});
				})}
			</div>
			<div className="col-12 col-md-4">
				{this.renderStep('Активація', 'Перевірити статус', system?.status === DonatelloSystemStatus.active.status, '', system?.stepFormDone && (system?.isOfferAccepted), this.checkContractStatus)}
			</div>
		</div>;
	}

	render() {
		const {system, stepFormEnabled, stepContractEnabled} = this.state;

		return <div className="payment-item">
			<div className="row">
				<div className='col-9 col-md-5'>
					<div className="payment-item-title d-flex align-items-center">
						<i className="fas fa-star" style={{color: "#facd30", fontSize: '23px', marginLeft: '-6px', marginRight: '12px'}}/> <span>Donatello</span>
					</div>
				</div>
				<div className="col-md-6 order-md-0 order-2 d-flex align-items-center justify-content-end">
					{this.getSystemStatus(system?.status)}
				</div>
				<div className="col-3 col-md-1 text-right">
					<Switch id="donatelloEnabled" className="mt-1" height={24} width={45} onColor="#3579F6"
							checked={system?.enabled || false}
							disabled={this.state.loading || system?.status !== DonatelloSystemStatus.active.status || !isUserBaseVerifiedStatus(this.props.status)}
							onChange={(checked) => this.toggleSwitcher(checked, 'enabled')}/>
				</div>
			</div>
			<div className="payment-item-description">
				<div className="mt-4">
					<span className="secondary-text">
						<i className="fas fa-heart"/><span className="ml-2 mr-3">Донати</span>
						<i className="far fa-gem"/><span className="ml-2 mr-3">Підписки</span>
						<i className="fas fa-money-check"/><span className="ml-2 mr-4">Виплати</span>
						<i className="fas fa-receipt"/><span className="ml-2 mr-4">Податки</span>
						<i className="fas fa-file-invoice"/><span className="ml-2 mr-4">Звіти</span>
						<i className="fas fa-shield-alt"/><span className="ml-2">Захист виплат</span>
					</span>
				</div>
				<div className="mt-4">
					<span className="d-flex flex-column flex-md-row">
						<span>Visa, Mastercard</span>
					</span>
				</div>
				<div className="mt-1">
					<span className="secondary-text">
						Комісія системи <strong>{formatPercent(PaymentSystem.donatello.transactionFee)}</strong>.
						Послуги сервісу <strong>{formatPercent(PaymentSystem.donatello.serviceFee)}</strong> (для ФОП <strong>{formatPercent(PaymentSystem.donatello.serviceFeeFop)}</strong>).
						Донат від <strong>{PaymentSystem.donatello.donateMinAmount}</strong> до <strong>{PaymentSystem.donatello.donateMaxAmount}</strong> {PaymentSystem.donatello.currencySign}.
						Виплата від <strong>{formatNumber(PaymentSystem.donatello.payoutMinAmount)}</strong> {PaymentSystem.donatello.currencySign}.
						<br/>
						Додатково для фізичних осіб: податок ПДФО <strong>18%</strong>, військовий збір <strong>5%</strong>.<br/>
						<a href="/individuals">Детальніше для авторів</a> &nbsp;
						● &nbsp; <a href="/business/partners">Детальніше для підприємців</a> &nbsp;
						● &nbsp; <a target="_blank" rel="noopener noreferrer" href={`/user/contract/${this.props.nickname}`}>Приклад договору</a>
					</span>
				</div>
			</div>
			<div className="row">
				{isUserBaseVerifiedStatus(this.props.status) && <div className="col-12">
					{this.renderSteps()}
					{stepFormEnabled && this.renderStepForm()}
					{stepFormEnabled === false && stepContractEnabled && this.renderStepContract()}
				</div>}

				{!isUserBaseVerifiedStatus(this.props.status) && <div className="col-12">
					<div className="alert alert-warning mt-4" role="alert" style={{fontSize: '0.9rem'}}>
						Активація доступна для <strong>Базового</strong> статусу або вище. <a href="/panel/settings?tab=status">Як змінити статус?</a>
					</div>
				</div>}
			</div>
		</div>;
	}
}


function mapStateToProps(state) {
	return {nickname: state.config?.nickname, status: state.config?.status};
}

export default connect(mapStateToProps)(SystemDonatello);
