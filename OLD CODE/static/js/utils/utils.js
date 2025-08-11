// -- Common utils and helpers

export function floatToFixedNumber(n) {
	if (isNaN(n)) {
		return 0;
	}

	return Number(Number(n).toFixed(2));
}

export function stringToNumber(str, fallbackValue) {
	const num = parseInt(str);

	return !isNaN(num) ? num : fallbackValue;
}

export function currencyToNumber(str, allowNegative = false) {
	str = (str + '').replace(/\s+/g, '').replace(/,/g, '');
	const num = Number.parseFloat(str);

	if (!str || isNaN(num)) {
		return 0;
	}

	if (!allowNegative && num < 0) {
		return 0;
	}

	return Number(num.toFixed(2));
}

export function formatCurrency(num) {
	return new Intl.NumberFormat('ua', {
		style: 'decimal',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(num);
}

/**
 * Format currency without cents
 *
 * @param num {number}
 * @return {string}
 */
export const formatCurrencyWithoutCents = (num) => {
	if (isNaN(num)) {
		return '0';
	}

	return new Intl.NumberFormat('ua', {
		style: 'decimal',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(num);
}

export function formatNumber(num) {
	return isNaN(num) ? num : num.toLocaleString('en-US', {style: 'decimal'});
}

export function formatPercent(num) {
	return `${formatNumber(num * 100)}%`;
}

export const validateNaN = (num, format) => {
	if (isNaN(num)) return format ? '0.00' : 0;
};

export const getSum = (array, column) => {
	const values = array.map((item) => parseInt(item[column]) || 0);

	return values.reduce((a, b) => a + b);
};

/**
 * Converts milliseconds into greater time units as possible
 * @param {int} ms - Amount of time measured in milliseconds
 * @return {Object} Reallocated time units. Empty object on failure.
 */
export const timeUnits = (ms) => {
	if (!Number.isInteger(ms)) {
		return {days: 0, hours: 0, minutes: 0, seconds: 0, ms: ms};
	}
	/**
	 * Takes as many whole units from the time pool (ms) as possible
	 * @param {int} msUnit - Size of a single unit in milliseconds
	 * @return {int} Number of units taken from the time pool
	 */
	const allocate = msUnit => {
		const units = Math.trunc(ms / msUnit);
		ms -= units * msUnit;
		return units;
	};
	// Property order is important here.
	// These arguments are the respective units in ms.
	return {
		// weeks: (604800000), // Uncomment for weeks
		days: allocate(86400000),
		hours: allocate(3600000),
		minutes: allocate(60000),
		seconds: allocate(1000),
		ms: ms // remainder
	};
};

/**
 * Sanitize string: remove all spaces from string
 *
 * @param str {string}
 * @returns {string}
 */
export const sanitizeString = (str) => {
	return str ? str.replace(/\s+/g, '') : '';
};

export const maskText = (text) => {
	if (!text) {
		return '*';
	}

	return `${text.slice(0, 1)}****`;
};

export function isValidUrl(value) {
	const r = new RegExp(/^(http|https):\/\/[^ "]+$/);

	return r.test(value);
}

const emailRegexp = new RegExp(/\S+@\S+\.\S+/);

export function isValidEmail(value) {
	if (value && value.indexOf('_duplicate_') !== -1) {
		return false;
	}

	return emailRegexp.test(value);
}

export function isValidFullName(fullName, allowLatin = false) {
	const cyrillicRegex = /^[А-Яа-яІіЇїЄєҐґ\s'-]+$/;
	const latinRegex = /^[A-Za-z\s']+$/;

	if (allowLatin) {
		return cyrillicRegex.test(fullName) || latinRegex.test(fullName);
	}

	return cyrillicRegex.test(fullName);
}
