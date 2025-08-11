const Currency = {
	UAH: 'UAH',
	USD: 'USD',
	EUR: 'EUR',
	USDT: 'USDT'
}

const CURRENCY = {
	UAH: '₴',
	USD: '$',
	EUR: '€',
	USDT: 'USDT'
};

const DefaultCurrency = Currency.UAH;

const DefaultCurrencyRates = {
	USD2UAH: 42.00,
	USDT2UAH: 42.00,
	EUR2UAH: 43.35,
	UAH2USD: 0.0238,
	UAH2USDT: 0.0238,
	UAH2EUR: 0.023
}

const getCurrencyRate = (fromCurrency, toCurrency) => {
	fromCurrency = fromCurrency || DefaultCurrency;
	toCurrency = toCurrency || DefaultCurrency;

	if (fromCurrency === toCurrency) {
		return 1;
	}

	return DefaultCurrencyRates[`${fromCurrency}2${toCurrency}`] || 1;
};

const getAmountInUAH = (amount, currency) => {
	const amountUAH = amount * getCurrencyRate(currency);
	return parseInt(amountUAH);
}
