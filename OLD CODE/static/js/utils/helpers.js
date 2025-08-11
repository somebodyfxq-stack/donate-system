import {io} from 'socket.io-client';
import {CurrencyDisplay} from '../enums/PaymentEnums';
import {messageService} from '../services/messageService';


const helpers = {

    DarkThemeStorageKey: 'don-darkTheme',

    copyText(text) {
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        messageService.success('Скопійовано');
    },

    buildWidgetUrl(widgetId, token) {
        return widgetId ? `${window.location.origin}/widget/${widgetId}/token/${token}` : '';
    },

    buildGoalPageUrl(widgetId, urlName, nickName) {
        return widgetId ? `${window.location.origin}/${nickName}?g=${urlName}` : '';
    },

    buildPostPageUrl(postUrl, urlName ) {
        return `${window.location.origin}/post/${postUrl}/${urlName}`;
    },

    capitalize(str) {
        return str.replace(/^\w/, c => c.toUpperCase());
    },

    assignDefaultValues(source, target) {
        const item = {...target};

        Object.entries(source).forEach(([key, value]) => {
            if (typeof item[key] === 'undefined') {
                item[key] = value;
            }
        });

        return item;
    },

    /**
     * Parse a localized number to a float.
     *
     * @param {string} strNumber - the localized number
     * @param {string} locale - [optional] the locale that the number is represented in.
     *                          Omit this parameter to use the current locale.
     */
    parseLocaleNumber(strNumber, locale) {
        if (typeof strNumber !== 'string' || strNumber === '') {
            return 0;
        }

        const thousandSeparator = Intl.NumberFormat(locale).format(11111).replace(/\p{Number}/gu, '');
        const decimalSeparator = Intl.NumberFormat(locale).format(1.1).replace(/\p{Number}/gu, '');

        return parseFloat(strNumber
            .replace(new RegExp('\\' + thousandSeparator, 'g'), '')
            .replace(new RegExp('\\' + decimalSeparator), '.')
        );
    },

    /**
     * Format card input
     *
     * @param value {string} card number as string
     * @returns {string}
     */
    formatCard(value) {
        const v = value.replace(/\s+/g, '').replace(/\D/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0; i < match.length; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    },

    /**
     * Validate credit card number: 16 digits, Luhn algorithm
     *
     * @param value {string|number|undefined}
     * @returns {boolean}
     */
    isValidCardNumber(value) {
        if (!value) {
            return false;
        }

        value = `${value}`.replace(/\D/g, '');

        if (value.length !== 16 || value === '0000000000000000') {
            return false;
        }

        // The Luhn Algorithm
        let nCheck = 0;
        let bEven = false;

        for (let n = value.length - 1; n >= 0; n--) {
            let cDigit = value.charAt(n),
                nDigit = parseInt(cDigit, 10);

            if (bEven && (nDigit *= 2) > 9) {
                nDigit -= 9;
            }

            nCheck += nDigit;
            bEven = !bEven;
        }

        return (nCheck % 10) === 0;
    },

    /**
     * Sanitazing File Name
     * @return {string}
     */
    sanitazeFileName(name) {
        return name.replace(/['"()\s]+/g, '');
    },

    /**
     * Check dark theme enabled
     * @return {boolean}
     */
    isDarkTheme() {
        return window.localStorage.getItem(this.DarkThemeStorageKey) === 'true';
    },

    /**
     * Toggle dark theme
     *
     * @param isDarkTheme {boolean} [null]
     */
    toggleDarkTheme(isDarkTheme) {
        const update = isDarkTheme !== undefined;

        if (update) {
            window.localStorage.setItem(this.DarkThemeStorageKey, isDarkTheme + '');
        }

        const darkTheme = window.localStorage.getItem(this.DarkThemeStorageKey) === 'true';
        const body = document.querySelectorAll('body')[0];

        if (darkTheme) {
            body.classList.add('dark');
        } else {
            body.classList.remove('dark');
        }
    },

    /**
     * Build socket
     * @return {{emit: function}|null}
     */
    buildSocket() {
        if (!io) {
            return null;
        }

        let protocol = 'wss';
        let port = '';

        if (window.location.protocol === 'http:') {
            protocol = 'ws';
            port = window.location.port === '5000' ? ':5001' : ':4201';
        }

        const url = protocol + '://' + window.location.hostname + port + '/';

        return io(url, {
            path: '/socket.io',
            transports: ['websocket']
        });
    },

    formatCurrency (num) {
        return new Intl.NumberFormat('ua', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    },

	getCurrencySign(currency) {
		return CurrencyDisplay[currency]?.sign || '';
	}
};

export default helpers;
