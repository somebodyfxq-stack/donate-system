import { messageEnum } from '../enums';

export const messageActions = {
    success,
    error,
    clear
};

function success(message) {
    return { type: messageEnum.SUCCESS, message };
}

function error(message) {
    return { type: messageEnum.ERROR, message };
}

function clear() {
    return { type: messageEnum.CLEAR };
}