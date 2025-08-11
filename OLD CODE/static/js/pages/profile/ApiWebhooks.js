import React, {Component} from 'react';
import Switch from 'react-switch';
import {Channels} from '../../enums/IntegrationEnums';
import {ApiHost, ApiRoutes} from '../../enums/RouteEnums';
import IntegrationModel from '../../models/IntegrationModel';
import {api} from '../../services/api';
import helpers from '../../utils/helpers';


const WebhookExampleGetRequest = String.raw`curl -X GET "${ApiHost}${ApiRoutes.donates}/create?key={key}&name=Andriy&email=andriy@gmail.com&message=Shut%20up%20and%20take%20my%20money&amount=100&currency=UAH&source=customProvider&show=true"`;

class ApiWebhooks extends Component {

    constructor(props) {
        super(props);

        this.state = {
            integrations: new IntegrationModel(),
            loading: false
        };
    }

    componentDidMount() {
        this.setState({loading: true}, () => {
            api.getIntegrations(Channels.donatello).then((resp) => this.setState({integrations: resp}));
        });
    }

    onChange = (e, channel) => {
        const {id, value} = e.target;
        const {integrations} = this.state;

        integrations[channel][id] = value;

        this.setState({integrations});
    }

    save = (channel) => {
        const {integrations} = this.state;
        api.saveIntegration({[channel]: integrations[channel]}).then();
    }

    toggleIntegration = (checked, channel) => {
        const {integrations} = this.state;
        integrations[channel]['enabled'] = checked;

        this.setState({integrations});
        this.save(channel);
    }

    testIntegration = (channel) => {
        api.testIntegration(channel).then();
    }

    getDonatelloApiLink = () => {
        const donatello = this.state.integrations.donatello;

        return donatello?.apiKey ? `${ApiHost}${ApiRoutes.donates}/create?key=${donatello.apiKey}` +
            `&name={name}&email={email}&message={message}&amount={amount}&currency={currency}&source={source}&show={show}` : '';
    }

    createDonatelloApiKey = () => {
        api.saveIntegration({donatello: {enabled: true, action: 'create'}}).then(resp => {
            const {donatello} = resp.data;
            const {integrations} = this.state;
            integrations.donatello = donatello;
            this.setState(integrations);
        });
    }

    deleteProviderParams = (channel) => {
        const data = {enabled: false, apiKey: ''};

        api.saveIntegration({[channel]: data}).then(res => {
            const {integrations} = this.state;
            integrations[channel] = res.data[channel];
            this.setState(integrations);
        });
    }

    render() {
        const {donatello} = this.state.integrations;

        return <section className="doc-api-section">
            <h3>Вебхуки</h3>

            <small className="form-text text-muted">
                <strong>Публікація донатів</strong> з іншого сервісу на <strong>Donatello</strong>.
            </small>

            <div className="form-group row mt-4 mb-5">
                <div className="col-sm-7">
                    <Switch id="donatelloEnabled" className="mt-2 mb-3"
                            onChange={(checked) => this.toggleIntegration(checked, 'donatello')}
                            checked={donatello?.enabled || false}
                            height={24}
                            width={45}
                            onColor="#3579F6"/>

                    <div className="d-flex mt-2">
                        <input id="donatello" type="text" className="form-control" style={{width: '90%'}}
                               placeholder=""
                               value={this.getDonatelloApiLink()}
                               disabled="disabled"/>

                        <div className="input-tools">
                            {!donatello?.apiKey &&
                                <i className="fas fa-plus-circle" title="Створити"
                                   onClick={this.createDonatelloApiKey}/>}
                            {donatello?.apiKey &&
                                <i className="fas fa-copy" title="Копіювати"
                                   onClick={() => helpers.copyText(this.getDonatelloApiLink())}/>}
                            {donatello?.apiKey &&
                                <i className="fas fa-trash ml-2" title="Видалити"
                                   onClick={() => this.deleteProviderParams(Channels.donatello)}/>}
                        </div>
                    </div>
                </div>

                <div className="col-sm-5 col-form-label">
                    <div className="code-box">
                        <div className="header">
                            <div className="title">
                                Request example: cURL
                            </div>
                            <i className="fas fa-copy pointer"
                               onClick={() => helpers.copyText(WebhookExampleGetRequest)}/>
                        </div>
                        <div className="text-code">
                            <pre>{WebhookExampleGetRequest}</pre>
                        </div>
                    </div>
                </div>
            </div>
        </section>;
    }
}


export default ApiWebhooks;
