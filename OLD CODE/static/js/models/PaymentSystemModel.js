class PaymentSystemModel {
    fondy = {enabled: true};
	fondyMerchant = {enabled: true, id: '', key: '', template: {default: '', recurring: ''}};
	whitepay = {enabled: false};
    mono = {enabled: false, jarId: '', jarConfig: {}};
	wfpMerchant = {enabled: true, status: '', subscriptionsOnly: false, login: '', secretKey: ''};
	cardpay = {enabled: false, card: '', fullName: '', ipn: ''};
}

export default PaymentSystemModel;
