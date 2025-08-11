import moment from 'moment';
import React, {Component} from 'react';
import Switch from 'react-switch';
import {Channels, CustomProviderMaxFailedRequests} from '../../enums/IntegrationEnums';
import IntegrationModel from '../../models/IntegrationModel';
import {api} from '../../services/api';
import {messageService} from '../../services/messageService';
import helpers from '../../utils/helpers';
import {isValidUrl} from '../../utils/utils';


const CustomProviderExamplePostRequest = String.raw`curl -X POST "https://webhook.site/{uuid}" \
  -H "Content-Type: application/json" \
  -H "X-Key: {key}" \
  -d '{ \
    "pubId": "D41-123123", \
    "clientName": "Андрій", \
    "message": "Привіт! Крутий стрім! 🤟", \
    "amount": "100", \
    "currency": "UAH", \
    "source": "donatello", \
    "goal": "На мікрофон", \
    "interactionMedia": "AO-EM98ntFs", \
    "interactionMediaStartTime": "0", \
    "show": true, \
    "isPaidFee": false, \
    "isSubscription": false, \
    "createdAt": "${moment().unix()}" \
  }'`;

const CustomProviderExampleGetRequest = String.raw`curl -X GET "https://webhook.site/{uuid}?key={key}&pubId=D41-123123&name=Andriy&message=Shut%20up%20and%20take%20my%20money&amount=100&currency=UAH&source=donatello&goal=Microphone&interactionMedia=AO-EM98ntFs&interactionMediaStartTime=0&isPaidFee=false&isSubscription=false&show=true&createdAt=${moment().unix()}"`;


class ApiCallbacks extends Component {

	constructor(props) {
		super(props);

		this.state = {
			integrations: new IntegrationModel(),
			loading: false
		};
	}

	componentDidMount() {
		this.setState({loading: true}, () => {
			api.getIntegrations(Channels.customProvider).then((resp) => this.setState({integrations: resp}));
		});
	}

	setStateData = (res) => {
		const {integrations} = this.state;
		integrations.customProvider = res.data?.customProvider;
		this.setState(integrations);
	}

	onChange = (e) => {
		const {id, value} = e.target;
		const {integrations} = this.state;

		integrations.customProvider[id] = value;
		this.setState({integrations});
	};

	save = (validateUrl) => {
		const {integrations} = this.state;

		if (validateUrl) {
			const {webHook} = integrations.customProvider;

			if (webHook && !isValidUrl(webHook)) {
				messageService.error('Недійсне URL-посилання');
				return;
			}
		}

		api.saveIntegration({customProvider: integrations.customProvider})
			.then(res => this.setStateData(res));
	};

	toggleIntegration = (checked) => {
		const {integrations} = this.state;
		integrations.customProvider.enabled = checked;

		this.setState({integrations});
		this.save();
	};

	testIntegration = () => {
		api.testIntegration(Channels.customProvider)
			.then(res => this.setStateData(res));
	};

	deleteProviderParams = (channel) => {
		const data = {enabled: false, webHook: ''};

		api.saveIntegration({customProvider: data})
			.then(res => this.setStateData(res));
	};

	render() {
		const {customProvider} = this.state.integrations;

		return <section className="doc-api-section">
			<h3>Колбеки</h3>

			<small className="form-text text-muted">
				<strong>Публікація донатів</strong> з Donatello на <strong>інший веб-сервіс</strong>.
			</small>

			<div className="form-group row mt-4">
				<div className="col-sm-7 col-form-label">
					<div className="d-flex justify-content-start align-items-center mb-3">
						<Switch id="customProviderEnabled" className="mt-1 mb-3"
								onChange={(checked) => this.toggleIntegration(checked)}
								checked={customProvider?.enabled || false}
								height={24}
								width={45}
								onColor="#3579F6"
						/>

						<div className="input-tools mt-1 mb-3">
							{customProvider?.webHook &&
								<i className="fas fa-trash" title="Видалити"
								   onClick={() => this.deleteProviderParams()}/>}
						</div>
					</div>

					<div className="mb-2">
						<select id="method" className="form-control mr-2"
								style={{maxWidth: '90px'}}
								disabled={!customProvider?.enabled}
								value={customProvider?.method}
								onChange={(e) => {
									this.onChange(e, Channels.customProvider);
									this.save();
								}}>
							<option value="POST">POST</option>
							<option value="GET">GET</option>
						</select>
					</div>

					<div className="d-flex mt-3">
						<input id="key" className="form-control"
							   placeholder="API Key"
							   disabled={!customProvider?.enabled}
							   onChange={(e) => this.onChange(e)}
							   onBlur={() => this.save()}
							   onKeyDown={(e) => {
								   if (e.key === 'Enter') {
									   this.save();
								   }
							   }}
							   value={customProvider?.key || ''}/>
						<div className="input-tools"></div>
					</div>

					<div className="d-flex mt-3">
						<input id="webHook" className="form-control"
							   placeholder="https://custom.website/api/v1/donates"
							   disabled={!customProvider?.enabled}
							   onChange={(e) => this.onChange(e)}
							   onBlur={() => this.save(true)}
							   onKeyDown={(e) => {
								   if (e.key === 'Enter') {
									   this.save(true);
								   }
							   }}
							   value={customProvider?.webHook || ''}/>
					</div>

					<div className="doc-api mt-3 ml-2">
						<small className="form-text text-muted">
							<strong>URL-посилання</strong> надає інший веб-сервіс.
							Ключ <strong>API Key</strong> використовується для перевірки, що запит найдійшов із Donatello.
						</small>
					</div>

					<div className="d-flex justify-content-between align-items-center mt-4">
						<button className="btn btn-info btn-sm ml-auto"
								disabled={!customProvider?.enabled || !customProvider?.webHook}
								onClick={() => this.testIntegration(Channels.customProvider)}>
							<i className="fas fa-paper-plane mr-2"/> Тестове повідомлення
						</button>
					</div>
				</div>

				<div className="col-sm-5 col-form-label">
					<div className="code-box">
						<div className="header">
							<div className="title">
								Request example: cURL
							</div>
							<i className="fas fa-copy pointer"
							   onClick={() => helpers.copyText(customProvider?.method === 'GET' ? CustomProviderExampleGetRequest : CustomProviderExamplePostRequest)}/>
						</div>
						<div className="text-code">
							<pre>{customProvider?.method === 'GET' ? CustomProviderExampleGetRequest : CustomProviderExamplePostRequest}</pre>
						</div>
					</div>
				</div>
			</div>

            <div className="form-group row mt-4">
                <div className="col-sm-12 col-form-label">
                    <h3>Лог</h3>

                    <div className="code-box">
                        <div className="header d-flex justify-content-between align-items-center">
                            <div className="title">
								Останні 30 запитів
                            </div>

                            <div className="title">
                                Успішні: <strong>{customProvider?.successRequests || '0'}</strong>&nbsp;
                                Невдалі: <strong>{customProvider?.failedRequests || '0'}</strong>
                            </div>
                        </div>
                        <div className="text-code">
                            <pre style={{minHeight: '100px'}}>{customProvider.log}</pre>
                        </div>
                    </div>

					<div className="doc-api mt-3 ml-2">
						<small className="form-text text-muted">
							Колбеки вимикаються після <strong>{CustomProviderMaxFailedRequests}</strong> невдалих запитів. Надсилаємо <strong>імейл</strong> про вимкнення колбеків.
						</small>

						<small className="form-text text-muted">
							<strong>Скинути</strong> лічильник запитів — <strong>видалити</strong> налаштування або <strong>вимкнути</strong> інтеграцію.
						</small>
					</div>
                </div>
            </div>
        </section>;
	}
}

export default ApiCallbacks;
