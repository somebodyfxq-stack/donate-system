import {StatusTerms, UserStatus} from './UserStatus';

export const PayoutStatus = {
    new: {type: 'new', title: 'Нова'},
    pending: {type: 'pending', title: 'Виконується'},
    processing: {type: 'processing', title: 'Обробка'},
    completed: {type: 'completed', title: 'Виконано'},
    canceled: {type: 'canceled', title: 'Скасовано'},
    hold: {type: 'hold', title: 'Зупинено'}
};

export const DefaultPayoutStatus = PayoutStatus.new;

export const ServiceFeeDefault = '4';
export const ServiceFeeLiqpay = '7.5';
export const ServiceFeeFondy = '5';
export const ServiceFeeWhitepay = '2';

export const SystemIdToFeeMap = {
    '1522602': '5',
    '1522655': '3',
    '1522654': '2',
    '1522657': '0'
}

const DefaultOldSystemId = '1475375';

export function GetServiceFeeBySystemId (systemId, status, isNoServiceFee) {
    if (isNoServiceFee) {
        return '0';
    }

    if (DefaultOldSystemId === systemId) {
        return StatusTerms[status || UserStatus.none].serviceFee || '';
    }

    return SystemIdToFeeMap[systemId] || '';
}

export const ShowDisclaimerPayoutsFondyLimitAmount = 25000;
