import {DonateSource} from './DonateEnums';
import {UserStatus} from './UserStatus';

export const PaymentSystem = {
	liqpay: {
		system: DonateSource.liqpay.source,
		name: DonateSource.liqpay.source,
		title: DonateSource.liqpay.title,
		icon: 'fas fa-money-bill-wave',
		transactionFee: 0.02,
		serviceFee: 0.05,
		donateMinAmount: '5',
		donateMaxAmount: '29,000',
		payoutMinAmount: 50,
		payoutMaxAmount: 29000,
		currencySign: '₴'
	},
	fondy: {
		system: DonateSource.fondy.source,
		name: DonateSource.fondy.source,
		title: DonateSource.fondy.title,
		icon: 'fas fa-money-check-alt',
		transactionFee: 0.0257,
		serviceFee: 0.05,
		donateMinAmount: '5',
		donateMaxAmount: '29,000',
		payoutMinAmount: 50,
		payoutMaxAmount: 29000,
		currencySign: '₴'
	},
	fondyMerchant: {
		system: DonateSource.fondyb.source,
		name: 'fondyMerchant',
		title: DonateSource.fondyb.title,
		icon: 'fas fa-money-check-alt',
		transactionFee: 0.02,
		serviceFee: 0.02,
		donateMinAmount: '5',
		donateMaxAmount: '90,000',
		payoutMinAmount: 0,
		payoutMaxAmount: 0,
		currencySign: '₴'
	},
	whitepay: {
		system: DonateSource.whitepay.source,
		name: DonateSource.whitepay.source,
		title: DonateSource.whitepay.title,
		icon: 'fas fa-coins',
		transactionFee: 0.01,
		serviceFee: 0.02,
		networkFee: 1,
		donateMinAmount: '6',
		donateMaxAmount: '10,000',
		payoutMinAmount: 10,
		payoutMinAmountCard: 70,
		payoutMaxAmount: 10000,
		currencySign: '$T'
	},
	mono: {
		system: DonateSource.mono.source,
		name: DonateSource.mono.source,
		title: DonateSource.mono.title,
		icon: 'fas fa-cat',
		transactionFee: 0,
		serviceFee: 3,
		donateMinAmount: '10',
		donateMaxAmount: '29,000',
		payoutMinAmount: 0,
		payoutMaxAmount: 0,
		currencySign: '₴'
	},
	wfpb: {
		system: DonateSource.wfpb.source,
		name: 'wfpMerchant',
		title: DonateSource.wfpb.title,
		icon: 'fas fa-money-check-alt',
		transactionFee: 0.02,
		serviceFee: 0.02,
		donateMinAmount: '5',
		donateMaxAmount: '90,000',
		payoutMinAmount: 0,
		payoutMaxAmount: 0,
		currencySign: '₴'
	},
	wfpMerchant: {
		system: DonateSource.wfpb.source,
		name: 'wfpMerchant',
		title: DonateSource.wfpb.title,
		icon: 'fas fa-money-check-alt',
		transactionFee: 0.02,
		serviceFee: 0.02,
		donateMinAmount: '5',
		donateMaxAmount: '90,000',
		payoutMinAmount: 0,
		payoutMaxAmount: 0,
		currencySign: '₴'
	},
	trusty: {
		system: DonateSource.trusty.source,
		name: DonateSource.trusty.source,
		title: 'Trustypay UA',
		icon: 'fas fa-money-check-alt',
		transactionFee: 0.155,
		serviceFee: 0.04,
		donateMinAmount: '500',
		donateMaxAmount: '29,000',
		payoutMinAmount: 1000,
		payoutMaxAmount: 29000,
		currencySign: '₴'
	},
	trustyeu: {
		system: DonateSource.trustyeu.source,
		name: DonateSource.trustyeu.source,
		title: 'Trustypay EU',
		icon: 'fas fa-money-check-alt',
		transactionFee: 0.11,
		serviceFee: 0.04,
		networkFee: 1,
		donateMinAmount: '1',
		donateMaxAmount: '600',
		currency: 'EUR',
		currencySign: '€',
		payoutMinAmount: 20,
		payoutMaxAmount: 2000,
		payoutCurrency: 'USDT',
		payoutCurrencySign: '$T'
	},
	cardpay: {
		system: DonateSource.cardpay.source,
		name: DonateSource.cardpay.source,
		title: 'Cardpay',
		icon: 'fas fa-money-check-alt',
		transactionFee: 0.14,
		serviceFee: 0.04,
		donateMinAmount: '50',
		donateMaxAmount: '29,000',
		payoutMinAmount: 100,
		payoutMaxAmount: 29000,
		currencySign: '₴'
	},
	donatello: {
		system: DonateSource.donatello.source,
		name: DonateSource.donatello.source,
		title: 'Donatello',
		icon: 'fas fa-credit-card',
		transactionFee: 0.019,
		serviceFee: 0.06,
		serviceFeeFop: 0.03,
		donateMinAmount: '10',
		donateMaxAmount: '29,000',
		payoutMinAmount: 500,
		payoutMaxAmount: 29000,
		payoutMaxAmountFop: 90000,
		currencySign: '₴'
	}
};

export const UserStatusesWithMonoFeature = [
	UserStatus.middle, UserStatus.advanced, UserStatus.partner, UserStatus.business
];

export const DefaultPaymentSystem = PaymentSystem.fondy.name;

export const DonatelloSystemStatus = {
	'inactive': {status: 'inactive', title: 'Неактивний', className: 'canceled'},
	'new': {status: 'new', title: 'Новий', className: 'pending'},
	'review': {status: 'review', title: 'Перевірка', className: 'pending'},
	'active': {status: 'active', title: 'Активний', className: 'active'},
	'blocked': {status: 'active', title: 'Заблокований', className: 'blocked'}
}

export const WfpMerchantStatus = {
	'inactive': {status: 'inactive', title: 'Неактивний', className: 'canceled'},
	'new': {status: 'new', title: 'Новий', className: 'pending'},
	'active': {status: 'active', title: 'Активний', className: 'active'},
	'blocked': {status: 'active', title: 'Заблокований', className: 'blocked'}
}

export const Currency = {
	UAH: 'UAH',
	USD: 'USD',
	EUR: 'EUR',
	USDT: 'USDT'
}

export const DefaultCurrency = Currency.UAH;

export const CurrencyDisplay = {
	UAH: {name: 'Гривня', sign: '₴', label: 'UAH'},
	USD: {name: 'Долар', sign: '$', label: 'USD'},
	EUR: {name: 'Євро', sign: '€', label: 'EUR'},
	USDT: {name: 'USDT', sign: '$T', label: 'USDT'}
};

export const isForeignCurrency = (currency) => {
	return currency !== DefaultCurrency;
}

export const DefaultCurrencyRates = {
	USD2UAH: 42.00,
	USDT2UAH: 42.00,
	EUR2UAH: 43.35,
	UAH2USD: 0.0238,
	UAH2USDT: 0.0238,
	UAH2EUR: 0.023
}

/**
 * Get currency rate
 *
 * @param fromCurrency {string}
 * @param [toCurrency] {string}
 * @return {number}
 */
export const getCurrencyRate = (fromCurrency, toCurrency) => {
	fromCurrency = fromCurrency || DefaultCurrency;
	toCurrency = toCurrency || DefaultCurrency;

	if (fromCurrency === toCurrency) {
		return 1;
	}

	return DefaultCurrencyRates[`${fromCurrency}2${toCurrency}`] || 1;
};

export const getAmountInUAH = (amount, currency) => {
	return amount * getCurrencyRate(currency);
}

export const WalletType = { card: 'card', tron: 'tron'};
