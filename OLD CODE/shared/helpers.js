/*global io*/

const helpers = {

    DarkThemeStorageKey: 'don-darkTheme',

    copyText(text) {
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
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
     * Check dark theme enabled
     * @return {boolean}
     */
    isDarkTheme() {
        return window.localStorage.getItem(this.DarkThemeStorageKey) === 'true';
    },

    /**
     * Toggle dark theme
     *
     * @param isDarkTheme {boolean=}
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

    buildSocket() {
        if (!io) {
            return null;
        }

        let protocol = 'wss';
        let port = '';

        if (window.location.protocol === 'http:') {
            protocol = 'ws';
            port = ':5001';
        }

        const url = protocol + '://' + window.location.hostname + port + '/';

        return io(url, {
            path: '/socket.io',
            transports: ['websocket']
        });
    }
};
