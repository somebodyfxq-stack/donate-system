import React, {Component} from 'react';
import {connect} from 'react-redux';
import Switch from 'react-switch';
import DocApiItem from '../../coms/misc/DocApiItem';
import PageNavigationTabs from '../../coms/misc/PageNavigationTabs';
import WizardStep1 from '../../coms/wizard/WizardStep1';
import '../../css/doc-api.css';
import {DocApiEnums, MaskedInput} from '../../enums/DocApiEnums';
import {api} from '../../services/api';
import helpers from '../../utils/helpers';
import ApiCallbacks from './ApiCallbacks';
import ApiWebhooks from './ApiWebhooks';


const tabs = [{
	id: 1,
	route: 'main',
	title: 'API'
}, {
	id: 2,
	route: 'about-me',
	title: 'Про мене'
}, {
	id: 3,
	route: 'donates',
	title: 'Донати'
}, {
	id: 4,
	route: 'clients',
	title: 'Донатори'
}, {
	id: 5,
	route: 'subscribers',
	title: 'Підписники'
}, {
	id: 6,
	route: 'webhooks',
	title: 'Вебхуки'
}, {
	id: 7,
	route: 'callbacks',
	title: 'Колбеки'
}];


class DocApi extends Component {

    constructor(props) {
        super(props);

        this.state = {
            enabledApi: false,
            token: '',
            showToken: false,
            loading: false,
			activeTab: tabs[0].id,
        };
    }

    componentDidMount() {
        this.setState({loading: true}, () => {
            api.getSettingsApi().then((resp) => {
                const {enabledApi, token} = resp;
                this.setState({enabledApi, token});
            });
        });
    }

    toggleApi = (checked) => {
        this.setState({enabledApi: checked});

        api.updateSettings({enabledApi: checked}).then();
    }

    toggleShowToken = () => {
        const {showToken} = this.state;
        this.setState({showToken: !showToken});
    }

    rebuildToken = () => {
        api.updateSettings({rebuildToken: true}).then((resp) => {
            const {token} = resp.data;
            const {settings} = this.state;
            settings.token = token;
            this.setState(settings);
        });
    }

    renderMain() {
        const {enabledApi, token, showToken} = this.state;

        return <section className='doc-api-section'>
            <h3>API</h3>

            <div className="form-group row mt-3">
                <label className="col-sm-3 col-form-label" htmlFor="donatello">
                    <strong>Активація API</strong>
                </label>
                <div className="col-sm-4 d-flex align-items-center">
                    <Switch id="donatelloEnabled" className="mt-1"
                            onChange={(checked) => this.toggleApi(checked)}
                            checked={enabledApi || false}
							height={24}
							width={45}
							onColor={'#3579F6'}
					/>
                    <small className="form-text text-muted ml-3">
                        {enabledApi ? 'Увімкнено' : 'Вимкнено'}
                    </small>
                </div>
            </div>

            <div className="form-group row mt-5">
                <label className="col-sm-3 col-form-label" htmlFor="token">
                    <strong>Токен</strong>
                </label>

                <div className="col-sm-7">
                    <div className="d-flex">
                        <input id="token" className="form-control" disabled
                               value={showToken ? (token || '') : MaskedInput}/>

                        <div className="input-tools">
                            <i className={showToken ? 'fas fa-eye' : 'far fa-eye-slash'}
                               style={{width: '20px'}}
                               onClick={this.toggleShowToken}
                               data-toggle="tooltip" data-placement="top"
                               title={!showToken ? 'Показати' : 'Сховати'}/>
                            <i className="fas fa-copy ml-2" style={{width: '20px'}}
                               title="Копіювати"
                               onClick={() => helpers.copyText(token)}/>
                        </div>
                    </div>

                    <small className="form-text text-muted mt-3">
                        Ваш <strong>секретний токен</strong> для API та віджетів. Згенерувати новий токен необхідно
                        лише тоді, коли ви його випадково "засвітили" у стрімі. <br/>
                        <strong>Увага!</strong> Генерація нового токена змінить усі URL-посилання на віджети.
                    </small>

                    <div className="mt-4">
                        <button className="btn btn-warning btn-sm"
                                onClick={this.rebuildToken}>
                            Згенерувати новий токен
                        </button>
                    </div>
                </div>
            </div>
        </section>;
    }

	setActiveTab = (tabId) => {
		this.setState({activeTab: tabId});
	}

    render() {
        const {hasSettings} = this.props;

        return <div>
			<PageNavigationTabs
				tabs={tabs}
				activeTab={this.state.activeTab}
				setActiveTab={this.setActiveTab}
				urlPath='doc-api'
			/>

            {!hasSettings && <WizardStep1/>}

            {hasSettings && <div className="doc-api">
                {this.state.activeTab === 1 && this.renderMain()}

                {this.state.activeTab === 2 &&
					<DocApiItem
						title="Про мене"
						api={DocApiEnums.me}
					/>
				}

                {this.state.activeTab === 3 &&
					<DocApiItem
						title="Донати"
						api={DocApiEnums.donates}
					/>
				}

				{this.state.activeTab === 4 &&
					<DocApiItem
						title="Донатори"
						api={DocApiEnums.clients}
					/>
				}

				{this.state.activeTab === 5 &&
					<DocApiItem
						title="Підписники"
						api={DocApiEnums.subscribers}
					/>
				}

				{this.state.activeTab === 6 &&  <ApiWebhooks/>}

				{this.state.activeTab === 7 &&  <ApiCallbacks/>}
            </div>}
        </div>;
    }
}


function mapStateToProps(state) {
    const {nickname, hasSettings, status} = state.config;
    return {nickname, hasSettings, status};
}

export default connect(mapStateToProps)(DocApi);
