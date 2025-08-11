import store from '../utils/store';
import {messageActions} from './messageActions';

export const messageService = {
    success,
    error
};

function success(msg) {
    store.dispatch(messageActions.success(msg));
}

function error(msg) {
    store.dispatch(messageActions.error(msg));
}
