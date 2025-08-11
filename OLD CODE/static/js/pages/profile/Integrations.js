import React, {Component} from 'react';
import IntegrationItem from '../../coms/settings/IntegrationItem';
import IntegrationModel from '../../models/IntegrationModel';
import {api} from '../../services/api';


class Integrations extends Component {

	constructor(props) {
		super(props);

		this.state = {
			integrations: new IntegrationModel(),
			loading: false
		};
	}

	componentDidMount() {
		this.setState({loading: true}, () => {
			api.getIntegrations().then((resp) => this.setState({integrations: resp}));
		});
	}

	onChange = (e, channel) => {
		const {id, value} = e.target;
		const {integrations} = this.state;

		integrations[channel][id] = value;

		this.setState({integrations});
	};

	save = (channel) => {
		const {integrations} = this.state;

		api.saveIntegration({[channel]: integrations[channel]}).then();
	};

	remove = (channel) => {
		if (channel === 'telegram') {
			const {integrations} = this.state;

			integrations.telegram.enabled = false;
			integrations.telegram.phone = '';

			this.setState({integrations}, () => this.save(channel));
		}
	};

	toggleIntegration = (checked, channel) => {
		const {integrations} = this.state;
		integrations[channel]['enabled'] = checked;

		this.setState({integrations});
		this.save(channel);
	};

	testIntegration = (channel) => {
		api.testIntegration(channel).then();
	};

	getDiscordDescription() {
		return <><strong>Сповіщення про донати</strong>. Вкажіть вебхук.<br/>
			<a href="https://discord.com/channels/498101952333479956/956267720524050524"
			   rel="noopener noreferrer" target="_blank">Детальніше про інтеграцію з Discord</a>.</>;
	}

	getTelegramDescription(onlyUserRole) {
		const text = onlyUserRole ? 'Сповіщення від авторів, інормація про ваші підписки.' : 'Сповіщення про донати, статистика, баланс, виплата коштів.';
		return <><strong>{text}</strong><br/>
			Для прив'язки профілю:<br/>
			1. Вкажіть ваш номер телефону у форматі "380630001122".<br/>
			2. Підписуйтеся на <a href="https://t.me/DonatelloToBot" rel="noopener noreferrer" target="_blank">Telegram-бот
				Donatello</a> і надішліть ваш номер телефону.<br/>
			<a href="https://youtu.be/dMGDE6Ul4R4" rel="noopener noreferrer" target="_blank">Детальніше про інтеграцію з
				Telegram</a>.</>;
	}

	getStreamElementsDescription() {
		return <><strong>Публікація (крос-пост) донатів у StreamElements.</strong><br/>
			Вкажіть ID облікового запису і токен JWT.<br/>
			<a href="https://discord.gg/cFtg9F3gAn" rel="noopener noreferrer" target="_blank">Детальніше про інтеграцію
				зі StreamElements</a>.</>;
	}

	render() {
		const {discord, telegram, streamElements} = this.state.integrations;
		const { onlyUserRole } = this.props;

		return <section className="doc-api-section">
			<h3>Інтеграції</h3>

			{!onlyUserRole && <IntegrationItem title="Discord" name="discord" id="webHook"
							  config={discord}
							  toggle={this.toggleIntegration}
							  change={this.onChange}
							  save={this.save}
							  test={this.testIntegration}
							  placeholder="https://discord.com/api/webhooks/******"
							  hasTemplate={true}
							  template={discord?.template}
							  templatePlaceholder="{isPaidFee}  **{userName}** - {amount} {currency} {goalName} \n*{message}*"
							  description={this.getDiscordDescription()}/>
			}

			<IntegrationItem title="Telegram" name="telegram" id="phone"
							  config={telegram}
							  toggle={this.toggleIntegration}
							  change={this.onChange}
							  save={this.save}
								showRemoveIcon={telegram.phone && telegram.enabled}
								remove={this.remove}
							  test={this.testIntegration}
							  placeholder="380630001122"
							  hasTemplate={true}
							  template={telegram?.template}
							  templatePlaceholder="{isPaidFee}  <b>{userName}</b> - {amount} {currency} {goalName} \n<i>{message}</i>"
							  description={this.getTelegramDescription(onlyUserRole)}/>

			{!onlyUserRole && <IntegrationItem title="StreamElements" name="streamElements"
							  id="channelId" secondaryId="token"
							  config={streamElements}
							  toggle={this.toggleIntegration}
							  change={this.onChange}
							  save={this.save}
							  test={this.testIntegration}
							  placeholder="ID облікового запису"
							  secondaryPlaceholder="Токен JWT"
							  description={this.getStreamElementsDescription()}/>
			}
		</section>;
	}
}

export default Integrations;
