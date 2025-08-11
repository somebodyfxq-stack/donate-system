import widgetEnum from '../enums/widgetEnum';

class TierModel {
    tierName = 'Назва підписки';
    description = '';
    price = 0;
    activeMembers = 0;
    isLimitedSubscribers = false;
    buttonName = 'Приєднатися';
    limitedSubscribers = '';
    discordRole = false;
    tgBotInvite = false;
    tgChats = [];
    inviteUsersToChannel = false;
    tierStatus = widgetEnum.WidgetStatus.active;
    image = {};
    forSale = false;
    largeImage = false;
	selectedDiscordRoles = [];
    addRolesToCurrentSubscriber = false;
}

export default TierModel;
