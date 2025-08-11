import FontModel from './FontModel';

class PageModel {
    isActive = false;
    isPublic = true;
    amountButtons = [];
    amountInternationalButtons = [];
    payPageColor = {
        r:206,
        g:204,
        b:25,
        a:1
    };
    fontStyle = new FontModel();
    showTopUsers = true;
    showTopUsersAmount = true;
    language = 'ua';
    showLastFive = false;
    showLastFiveUsersAmount = false;
    textColor = "#FFFFFF";
    allowPayFee = false;
    autoDetectionLanguage = false;
    commentOptionally = false;
    showFeed = false;
    showSubscriptionSubscribers = false;
	showSubscriptionSum = false;
    minAmount = 5;
    minAmountInternationalCurrency = 1;
    socialNetworks = {};
    showDisclaimer = false;
    aboutAuthor = '';
    disclaimerLabel = '';
    disclaimerText = '';
    pageVersion = 'v2';
    currencies = ['UAH'];
	userThanksText = [];
	hideOneTimeDonationForm = false;
	accentOnSubscription = false;
	showSubscriptionWithAnyAmount = false;
}

export default PageModel;
