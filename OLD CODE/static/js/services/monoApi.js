import {hideLoading, showLoading} from 'react-redux-loading-bar';
import store from '../utils/store';
import {messageService} from './messageService';

export const monoApi = {
    getClientInfo,
    createWebHook
};


// ---------------------------
// Helper functions
// ---------------------------

function buildUrl(endpoint) {
    return `https://api.monobank.ua/${endpoint}`;
}

function handleResponse(response) {
    store.dispatch(hideLoading());

    if (response.status === 403) {
        messageService.error('Помилка авторизації. Невірний токен.');
    }

    return response.json();
}
function handleSuccessWithMessage(resp) {
    if (resp.message) {
        if (resp.success) {
            messageService.success(resp.message);
        } else if (resp.success === false) {
            messageService.error(resp.message);
        }
    }

    return resp;
}

function handleError(err) {
    try {
        const jsonError = JSON.parse(err);

        if (jsonError.error === 401 || jsonError.error === 403) {
            return Promise.reject(jsonError.message);
        }

        return err.json().then(json => {
            messageService.error('Ой! ' + json.message);
            return Promise.reject(json);
        });

    } catch (error) {
        return Promise.reject({});
    }
}

function buildHeaders(token) {
    return {'X-Token': token};
}

function getRequest(endpoint, token) {
    const url = buildUrl(endpoint);
    const requestOptions = {
        method: 'GET',
        headers: buildHeaders(token)
    };

    store.dispatch(showLoading());

    return fetch(url, requestOptions).then(handleResponse);
}

function postRequest(endpoint, token, data) {
    const url = buildUrl(endpoint);
    const requestOptions = {
        method: 'POST',
        headers: buildHeaders(token),
        body: JSON.stringify(data)
    };

    store.dispatch(showLoading());

    return fetch(url, requestOptions).then(handleResponse);
}



// ---------------------------
// API functions
// ---------------------------

function getClientInfo(token) {
    return getRequest('personal/client-info', token).then(handleSuccessWithMessage, handleError);
}

function createWebHook(token, data) {
    return postRequest('personal/webhook', token, data).then(handleSuccessWithMessage, handleError);
}
