import moment from 'moment';
import {DateFormat} from './Commons';
import {ApiHost, ApiRoutes} from './RouteEnums';

export const MaskedInput = '************************';

export const DocApiEnums = {
    me : {
        method: 'GET',
        route: 'me',
        response: [{
            type: 'application/json; charset=utf-8',
            code: '200',
            cls: 'success',
            params: [{
                name: 'nickname',
                type: 'string'
            }, {
                name: 'pubId',
                type: 'string'
            }, {
                name: 'page',
                type: 'string'
            }, {
                name: 'isActive',
                type: 'boolean'
            }, {
                name: 'isPublic',
                type: 'boolean'
            }, {
                name: 'donates',
                type: `object<DonateStats>`
            }, {
                name: 'createdAt',
                type: 'date'
            }]
        }, {
            type: 'application/json; charset=utf-8',
            code: '401',
            cls: 'warning',
            params: [{
                name: 'success',
                type: 'boolean',
                example: 'false'
            }, {
                name: 'message',
                type: 'string',
                example: '"Помилка авторизації"'
            }]
        }, {
            type: 'application/json; charset=utf-8',
            code: '404',
            cls: 'warning',
            params: [{
                name: 'success',
                type: 'boolean',
                example: 'false'
            }, {
                name: 'message',
                type: 'string',
                example: '"Неповні налаштування профілю"'
            }]
        }],

        requestExample: String.raw`curl --request GET \
  --url ${ApiHost}${ApiRoutes.me} \
  --header 'X-Token: {token}'`,

        responseExample: String.raw`{
    "nickname": 'your-nickname',
    "pubId": "C26-123123",
    "page": "https://donatello.to/your-nickname",
    "isActive": true,
    "isPublic": true,
    "donates": {
        "totalAmount": "2500",
        "totalCount": "35"
    },
    "createdAt": "${moment().subtract(1, 'week').format(DateFormat)}"
}`
    },

    donates : {
        method: 'GET',
        route: 'donates',
        query: [{
            name: 'page',
            type: 'number',
            default: '0',
            optional: true
        }, {
            name: 'size',
            type: 'number',
            default: '20',
            optional: true
        }],
        response: [{
            type: 'application/json; charset=utf-8',
            code: '200',
            cls: 'success',
            params: [{
                name: 'content',
                type: `array[Donate]`
            }, {
                name: 'page',
                type: 'number'
            }, {
                name: 'size',
                type: 'number'
            }, {
               name: 'pages',
               type: 'number'
            }, {
                name: 'first',
                type: 'boolean'
            }, {
                name: 'last',
                type: 'boolean'
            }, {
                name: 'total',
                type: 'number'
            }]
        }, {
            type: 'application/json; charset=utf-8',
            code: '401',
            cls: 'warning',
            params: [{
                name: 'success',
                type: 'boolean',
                example: 'false'
            }, {
                name: 'message',
                type: 'string',
                example: '"Помилка авторизації"'
            }]
        }],

        requestExample: String.raw`curl --request GET \
  --url ${ApiHost}${ApiRoutes.donates} \
  --header 'X-Token: {token}'`,

        responseExample: String.raw`{
    "content": [{
        "pubId": "D41-123123",
        "clientName": "Андрій",
        "message": "Привіт! Крутий стрім! 🤟",
        "amount": "100",
        "currency": "UAH",
        "goal": "На мікрофон",
        "isPublished": false,
        "createdAt": "${moment().format(DateFormat)}"
    }],
    "page": 0,
    "size": 20,
    "pages": 1,
    "first": true,
    "last": true,
    "total": 1
}`
    },

    clients : {
        method: 'GET',
        route: 'clients',
        response: [{
            type: 'application/json; charset=utf-8',
            code: '200',
            cls: 'success',
            params: [{
                name: 'clients',
                type: `array[Client]`
            }]
        }, {
            type: 'application/json; charset=utf-8',
            code: '401',
            cls: 'warning',
            params: [{
                name: 'success',
                type: 'boolean',
                example: 'false'
            }, {
                name: 'message',
                type: 'string',
                example: '"Помилка авторизації"'
            }]
        }],

        requestExample: String.raw`curl --request GET \
  --url ${ApiHost}${ApiRoutes.clients} \
  --header 'X-Token: {token}'`,

        responseExample: String.raw`{
    "clients": [{
        "clientName": 'Андрій',
        "totalAmount": "850"
    }, {
        "clientName": 'Оксана',
        "totalAmount": "220"
    }]
}`
    },

	subscribers : {
        method: 'GET',
        route: 'subscribers?isActive=true',
		query: [{
            name: 'isActive',
            type: 'boolean',
            default: 'true',
            optional: false
        }, {
            name: 'page',
            type: 'number',
            default: '0',
            optional: true
        }, {
            name: 'size',
            type: 'number',
            default: '20',
            optional: true
        }],
        response: [{
            type: 'application/json; charset=utf-8',
            code: '200',
            cls: 'success',
            params: [{
                name: 'subscribers',
                type: `array[Subscriber]`
            }, {
                name: 'page',
                type: 'number'
            }, {
                name: 'size',
                type: 'number'
            }, {
				name: 'pages',
				type: 'number'
            }, {
                name: 'first',
                type: 'boolean'
            }, {
                name: 'last',
                type: 'boolean'
            }, {
                name: 'total',
                type: 'number'
            }]
        }, {
            type: 'application/json; charset=utf-8',
            code: '401',
            cls: 'warning',
            params: [{
                name: 'success',
                type: 'boolean',
                example: 'false'
            }, {
                name: 'message',
                type: 'string',
                example: '"Помилка авторизації"'
            }]
        }],

        requestExample: String.raw`curl --request GET \
  --url ${ApiHost}${ApiRoutes.subscribers} \
  --header 'X-Token: {token}'`,

        responseExample: String.raw`{
    "subscribers": [{
        "mainPubOrderId": "D47-123123",
        "clientName": "Oleksandr",
        "pubClientId": "C36-T123123",
        "subscriptionStatus": "active",
        "tierName": "Адмірал козацького флоту",
        "amount": "500",
        "currency": "UAH",
        "isActive": true,
        "createdAt": "${moment().format(DateFormat)}",
        "pausedAt": null,
        "deactivatedAt": null,
        "successPayments": 1,
        "clientEmail": "client@gmail.com",
        "discordName": "oleksandr",
        "twitchName": "oleksandr",
    }],
    "page": 0,
    "size": 20,
    "pages": 1,
    "first": true,
    "last": true,
    "total": 1
}`
    }

};
