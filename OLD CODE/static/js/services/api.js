import {hideLoading, showLoading} from 'react-redux-loading-bar';
import {configEnum} from '../enums';
import store from '../utils/store';
import {messageService} from './messageService';

export const api = {
    getConfig,
    getSettings,
    getEmails,
    deleteUser,
    updateUserEmail,
    getSettingsApi,
    updateSettings,
    unlinkUserAuth,
    getPaymentSystems,
    savePaymentSystem,
	updatePaymentSystemStatus,
    savePaymentSystemIpn,
    deletePaymentSystemIpn,
	deleteSystemData,
	signContract,
	checkContractStatus,
    getIntegrations,
    saveIntegration,
    testIntegration,
    saveDataForUserFromAdmin,
    getPage,
    savePage,
    getWidgets,
    saveWidget,
    updateWheelWidget,
    deleteWidget,
    toggleWidget,
    getDonates,
    changeDonationClientName,
    saveDonate,
    publishDonate,
    banDonate,
    manuallyApproveDonate,
    onRefreshTopClients,
    deleteDonate,
    countTotalDonates,
    getPayouts,
	getPayoutsHistory,
    getSubscriptionPayments,
    requestPayout,
    getOpenedPayouts,
    saveOpenedPayouts,
	getBilling,
	getBillingPlan,
	mergeBills,
	saveBillingTerms,
	deleteBillingCard,
    getFiles,
    deleteFile,
    getUserStats,
    getUserStatus,
    getUserLinks,
    saveUserLinks,
    setUserStatus,
    deactivateWidget,
    saveSelectedMedia,
    getSelectedMedia,
    getUserDonateTimePeriod,
    getUsersGoalPresets,
    addUsersGoalPreset,
    removeUsersGoalPreset,
    getProjects,
    saveProject,
    deleteProject,
    getDonationData,
    getRandomNumber,
    markAllAsSeen,
    getAllUserTiers,
    saveUserTier,
    saveUserPost,
    removeUserTier,
    removeUserPost,
	getSubscriptionStats,
    getAllUserPosts,
    getPostsToModerate,
    setPostModerationStatus,
    getWelcomeEmails,
    getTierMessages,
    getAllChats,
    getChatMessages,
    saveChatMessage,
    markChatAsRead,
    saveTierMessage,
    saveWelcomeEmails,
	removeWelcomeEmail,
    getAllSubscribers,
    getPossibleChats,
    getChat,
    getAllUserSubscriptions,
    changeUserSubscription,
    saveClientAvatar,
    getAllUsers,
	getAllActivePostsForUserNews,
    getPostDetails,
    toggleDonateVisibility,
    getDonateVisibility,
    onLikeClick,
    onVoteClick,
	setPostSeen,
	getDiscordGuildRoles,
    getTgSecretChats,
	getDiscordLogChannelData,
	getDiscordGuildChannels,
	saveDiscordLogChannelData,
	addDiscordRolesToMe,
	changeSubscriptionsClientName,
	checkSubscriptionsEnabled,
	extractColorsPalette,
	getUserPayments,
    getModerationSettings,
    setModerationSettings,
    removeModerationSettings,
    getAuthorsToModerate,
    provideDiscordRoles,
    provideTgInviteLink,
    setToggleModerationSettings
};


// ---------------------------
// Helper functions
// ---------------------------

function buildUrl(endpoint) {
    return `/panel-api/${endpoint}`;
}

// Quick workaround to show no session message only once
let unauthorized = false;

function handleResponse(response) {
    store.dispatch(hideLoading());

    if (unauthorized) {
        return Promise.reject({success: false, error: 401, message: 'Сесію завершено. Увійдіть знову.'});
    }

    if (response.status === 401) {
        unauthorized = true;

        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
    }

    if (!response.ok) {
        return Promise.reject(response);
    }

    unauthorized = false;

    return response.json();
}

function handleSuccess(resp) {
    return resp;
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

const credentials = 'same-origin';
const headers = {'Content-Type': 'application/json'};

function getRequest(endpoint) {
    const url = buildUrl(endpoint);
    const requestOptions = {
        method: 'GET',
        credentials
    };

    store.dispatch(showLoading());

    return fetch(url, requestOptions).then(handleResponse);
}

function postRequest(endpoint, data) {
    const url = buildUrl(endpoint);
    const requestOptions = {
        method: 'POST',
        credentials,
        headers,
        body: JSON.stringify(data)
    };

    store.dispatch(showLoading());

    return fetch(url, requestOptions).then(handleResponse);
}

function patchRequest(endpoint, data) {
    const url = buildUrl(endpoint);
    const requestOptions = {
        method: 'PATCH',
        credentials,
        headers,
        body: JSON.stringify(data)
    };

    store.dispatch(showLoading());

    return fetch(url, requestOptions).then(handleResponse);
}

function deleteRequest(endpoint, data) {
    const url = buildUrl(endpoint);
    const requestOptions = {
        method: 'DELETE',
        credentials,
        headers,
        body: JSON.stringify(data)
    };

    store.dispatch(showLoading());

    return fetch(url, requestOptions).then(handleResponse);
}

function buildQueryParams(params) {
    let query = '';

    for (let key in params) {
        query += `&${key}=${params[key]}`;
    }

    return query.replace('&', '?');
}

function getModerationQueryParams(authorId, moderationType) {
    let queryParams = '';

    if (authorId) {
        queryParams += "?authorId=" + authorId;
        queryParams += "&moderationType=" + moderationType;
    }

    return queryParams;
}


// ---------------------------
// API functions
// ---------------------------

function checkNewUser(config) {
    const {hasSettings} = config;
    const isDashboardPage = window.location.pathname.indexOf('/panel/dashboard') !== -1;

    // Redirect new users to settings page
    if (isDashboardPage && hasSettings === false) {
        window.location.href = '/panel/settings';
    }
}

function getConfig() {
    return dispatch => {

        return getRequest('config')
            .then(config => {
                checkNewUser(config);
                dispatch(success(config));

            }, error => {
                console.log(error);

                if (typeof error.json === 'function') {
                    error.json().then(resp => {
                        let message = resp.message;
                        dispatch(failure(message));
                        messageService.error(message);
                    });
                } else {
                    dispatch(failure(error));
                    const msg = typeof error === 'string' ? error : null;
                    if (msg) {
                        messageService.error(error);
                    }
                }
            });
    };

    function success(config) {
        return {type: configEnum.GET_CONFIG_SUCCESS, config}
    }

    function failure(error) {
        return {type: configEnum.GET_CONFIG_FAILURE, error}
    }
}

function getSettings() {
    return getRequest('settings').then(handleSuccess, handleError);
}

function getEmails() {
    return getRequest('settings/email').then(handleSuccess, handleError);
}

function updateUserEmail(email) {
    return patchRequest('settings/email', {email}).then(handleSuccessWithMessage, handleError);
}

function getSettingsApi() {
    return getRequest('settings/api').then(handleSuccess, handleError);
}

function toggleDonateVisibility(data) {
    return postRequest('settings/toggleDonateVisibility', data).then(handleSuccess, handleError);
}

function onLikeClick({postId, likeStatus}) {
    return getRequest(`likes/${postId}/${likeStatus}`).then(handleSuccess, handleError);
}

function onVoteClick({postId, checkedValue, voteState}) {
    return getRequest(`poll?postId=${postId}&checkedValue=${checkedValue}&voteState=${voteState}`).then(handleSuccess, handleError);
}

function setPostSeen({postId}) {
    return getRequest(`post/seen/${postId}`).then(handleSuccess, handleError);
}

function getDonateVisibility() {
    return getRequest('settings/getDonateVisibility').then(handleSuccess, handleError);
}

function updateSettings(data) {
    return patchRequest('settings', data).then(handleSuccessWithMessage, handleError);
}

function unlinkUserAuth(data) {
    return postRequest('settings/unlink', data).then(handleSuccessWithMessage, handleError);
}

function deleteUser() {
    return deleteRequest('settings/deleteUser').then(handleSuccessWithMessage, handleError);
}

function getModerationSettings() {
    return getRequest('settings/getModerationSettings').then(handleSuccess, handleError);
}

function setModerationSettings(data) {
    return postRequest('settings/setModerationSettings', data).then(handleSuccess, handleError);
}

function setToggleModerationSettings(data) {
    return postRequest('settings/setToggleModerationSettings', data).then(handleSuccess, handleError);
}

function removeModerationSettings(data) {
    return postRequest('settings/removeModerationSettings', data).then(handleSuccess, handleError);
}

function getAuthorsToModerate(moderationType) {
    return getRequest(`settings/getAuthorsToModerate?moderationType=${moderationType}`).then(handleSuccess, handleError);
}

function onRefreshTopClients() {
	return getRequest('onRefreshTopClients').then(handleSuccess, handleError);
}

function getPaymentSystems(system) {
    return getRequest(`systems${system ? `?system=${system}` : ``}`).then(handleSuccess, handleError);
}

function savePaymentSystem(data) {
    return postRequest('systems', data).then(handleSuccessWithMessage, handleError);
}

function updatePaymentSystemStatus(data) {
	return postRequest('systems/status', data).then(handleSuccessWithMessage, handleError);
}

function savePaymentSystemIpn(data) {
    return postRequest('systems/ipn', data).then(handleSuccessWithMessage, handleError);
}

function deletePaymentSystemIpn() {
    return deleteRequest('systems/ipn').then(handleSuccessWithMessage, handleError);
}

function deleteSystemData(system) {
	return deleteRequest(`systems${system ? `?system=${system}` : ``}`).then(handleSuccessWithMessage, handleError);
}

function signContract(params) {
	return postRequest(`systems/contract/sign`, params).then(handleSuccessWithMessage, handleError);
}

function checkContractStatus(params) {
	return getRequest(`systems/contract/status`, params).then(handleSuccess, handleError);
}

function getIntegrations(channel) {
    return getRequest(`integration${channel ? `?channel=${channel}` : ``}`).then(handleSuccess, handleError);
}

function saveIntegration(data) {
    return postRequest('integration', data).then(handleSuccessWithMessage, handleError);
}

function testIntegration(channel) {
    return postRequest('integration/test', {channel}).then(handleSuccessWithMessage, handleError);
}

function getPage() {
    return getRequest('page').then(handleSuccess, handleError);
}

function savePage(data) {
    return postRequest('page', data).then(handleSuccessWithMessage, handleError);
}

function saveClientAvatar(data) {
    return postRequest('saveClientAvatar', {data}).then(handleSuccessWithMessage, handleError);
}

function getUserStats() {
    return getRequest('userStats').then(handleSuccess, handleError);
}

function getUserDonateTimePeriod(timePeriod) {
    return postRequest('getUserDonateTimePeriod', {timePeriod}).then(handleSuccess, handleError);
}

function getFiles(userFileType) {
    return getRequest(`files?userFileType=${userFileType}`).then(handleSuccess, handleError);
}

function getSelectedMedia(mediaListId) {
    return getRequest(`getSelectedMedia?mediaListId=${mediaListId}`).then(handleSuccess, handleError);
}

function deleteFile(fileName) {
    return deleteRequest('file', fileName).then(handleSuccess, handleError);
}

function saveSelectedMedia(data) {
    return postRequest('saveSelectedMedia', data).then(handleSuccess, handleError);
}

function getWidgets(widgetType) {
    return getRequest(`widget/${widgetType}`).then(handleSuccess, handleError);
}

function saveWidget(widgetType, data) {
    return postRequest(`widget/${widgetType}`, data).then(handleSuccessWithMessage, handleError);
}

function updateWheelWidget(data) {
    return postRequest('updateWheelWidget', data).then(handleSuccess, handleError);
}

function deleteWidget(widgetType, data) {
    return deleteRequest(`widget/${widgetType}`, data).then(handleSuccessWithMessage, handleError);
}

function deactivateWidget(widgetType, data) {
    return postRequest(`widget/deactivate/${widgetType}`, data).then(handleSuccessWithMessage, handleError);
}

function toggleWidget(widgetType, data) {
    return postRequest(`widget/toggle/${widgetType}`, data).then(handleSuccessWithMessage, handleError);
}

function getDonates(params) {
    const query = buildQueryParams(params);

    return getRequest(`donates${query}`).then(handleSuccess, handleError);
}

function saveDonate(data) {
    return postRequest('donate', data).then(handleSuccessWithMessage, handleError);
}

function changeDonationClientName(data) {
    return postRequest('changeDonationClientName', data).then(handleSuccessWithMessage, handleError);
}

function deleteDonate(data) {
    return deleteRequest('donate', data).then(handleSuccessWithMessage, handleError);
}

function publishDonate(data) {
    return postRequest('donate/publish', data).then(handleSuccessWithMessage, handleError);
}

function banDonate(data) {
    return postRequest('donate/ban', data).then(handleSuccessWithMessage, handleError);
}

function manuallyApproveDonate(data) {
    return postRequest('donate/manuallyApproveDonate', data).then(handleSuccessWithMessage, handleError);
}

function countTotalDonates() {
    return getRequest('donates/countTotal').then(handleSuccessWithMessage, handleError);
}

function getPayouts(params) {
    const query = buildQueryParams(params);

    return getRequest(`payouts${query}`).then(handleSuccess, handleError);
}

function getPayoutsHistory(params) {
	const query = buildQueryParams(params);

	return getRequest(`payouts/history${query}`).then(handleSuccess, handleError);
}

function getSubscriptionPayments() {
    return getRequest('tier/getSubscriptionPayments').then(handleSuccess, handleError);
}

function getUserPayments(subscriptionId, limit) {
    return getRequest(`tier/getUserPayments?subscriptionId=${subscriptionId}&limit=${limit}`).then(handleSuccess, handleError);
}

function requestPayout(params) {
    return postRequest('payouts/request', params).then(handleSuccessWithMessage, handleError);
}

function getUsersGoalPresets() {
    return getRequest('getUsersGoalPresets').then(handleSuccessWithMessage, handleError);
}

function addUsersGoalPreset(data) {
    return postRequest('saveUsersGoalPreset', data).then(handleSuccessWithMessage, handleError);
}

function removeUsersGoalPreset(id) {
    return postRequest('removeUsersGoalPreset', {id}).then(handleSuccessWithMessage, handleError);
}

function getProjects() {
    return getRequest('projects').then(handleSuccess, handleError);
}

function saveProject(data) {
    return postRequest('projects', data).then(handleSuccessWithMessage, handleError);
}

function deleteProject(data) {
    return deleteRequest('projects', data).then(handleSuccessWithMessage, handleError);
}

function getDonationData(data) {
    return postRequest('getDonationData', data).then(handleSuccess, handleError);
}

function getRandomNumber(data) {
    return postRequest('getRandomNumber', data).then(handleSuccess, handleError);
}

function markAllAsSeen() {
    return getRequest('donate/markAllAsSeen').then(handleSuccess, handleError);
}

function getAllUserTiers(userId) {
    return getRequest(`tier/getAllUserTiers?userId=${userId}`).then(handleSuccess, handleError);
}

function getAllUserPosts() {
    return getRequest(`tier/getAllUserPosts`).then(handleSuccess, handleError);
}

function getPostsToModerate() {
    return getRequest(`getPostsToModerate`).then(handleSuccess, handleError);
}

function setPostModerationStatus(data) {
    return postRequest(`setPostModerationStatus`, data).then(handleSuccess, handleError);
}

function getWelcomeEmails() {
    return getRequest(`tier/getWelcomeEmails`).then(handleSuccess, handleError);
}

function getTierMessages() {
    return getRequest('tier/getTierMessages').then(handleSuccess, handleError);
}

function getAllChats() {
    return getRequest(`tier/getAllChats`).then(handleSuccess, handleError);
}

function getChatMessages(data) {
    return postRequest(`tier/getChatMessages`, data).then(handleSuccess, handleError);
}

function markChatAsRead(data) {
    return postRequest(`tier/markChatAsRead`, data).then(handleSuccess, handleError);
}

function saveTierMessage(data) {
    return postRequest(`tier/saveTierMessage`, data).then(handleSuccess, handleError);
}

function saveWelcomeEmails(data) {
    return postRequest('tier/saveWelcomeEmails', data).then(handleSuccess, handleError);
}

function removeWelcomeEmail(id) {
    return postRequest('tier/removeWelcomeEmail', {id}).then(handleSuccess, handleError);
}

function getAllSubscribers(authorId, moderationType) {
    return getRequest(`tier/getAllSubscribers${getModerationQueryParams(authorId, moderationType)}`).then(handleSuccess, handleError);
}

function getPossibleChats(authorId, moderationType) {
    return getRequest(`chat/getPossibleChats${getModerationQueryParams(authorId, moderationType)}`).then(handleSuccess, handleError);
}

function getChat(data) {
    return postRequest(`chat/getChat${getModerationQueryParams(data.authorId, data.moderationType)}`, data).then(handleSuccess, handleError);
}

function saveChatMessage(data) {
    return postRequest(`chat/saveChatMessage${getModerationQueryParams(data.authorId, data.moderationType)}`, data).then(handleSuccess, handleError);
}

function saveUserTier(tierData) {
    return postRequest('tier/saveUserTier', tierData).then(handleSuccess, handleError);
}

function saveUserPost(postData) {
    return postRequest('tier/saveUserPost', postData).then(handleSuccess, handleError);
}

function getPostDetails(data) {
    return postRequest('tier/getPostDetails', data).then(handleSuccess, handleError);
}

function removeUserTier(tierId) {
    return postRequest('tier/removeUserTier', {tierId}).then(handleSuccess, handleError);
}

function removeUserPost(postId) {
    return postRequest('tier/removeUserPost', {postId}).then(handleSuccess, handleError);
}

function getSubscriptionStats() {
    return getRequest('tier/getSubscriptionStats').then(handleSuccess, handleError);
}

function getAllUserSubscriptions() {
    return getRequest('tier/getAllUserSubscriptions').then(handleSuccess, handleError);
}

function changeUserSubscription(subData) {
    return postRequest('tier/changeUserSubscription', subData).then(handleSuccess, handleError);
}

function addDiscordRolesToMe(data) {
    return postRequest('tier/addDiscordRolesToMe', data).then(handleSuccess, handleError);
}

function getAllActivePostsForUserNews() {
    return getRequest('getAllActivePostsForUserNews').then(handleSuccess, handleError);
}

function getDiscordGuildRoles() {
    return getRequest('getDiscordGuildRoles').then(handleSuccess, handleError);
}

function getTgSecretChats() {
    return getRequest('getTgSecretChats').then(handleSuccess, handleError);
}

function getDiscordGuildChannels() {
    return getRequest('getDiscordGuildChannels').then(handleSuccess, handleError);
}

function getDiscordLogChannelData() {
    return getRequest('getDiscordLogChannelData').then(handleSuccess, handleError);
}

function saveDiscordLogChannelData(data) {
    return postRequest('saveDiscordLogChannelData', data).then(handleSuccess, handleError);
}

function changeSubscriptionsClientName(data) {
    return postRequest('tier/changeSubscriptionsClientName', data).then(handleSuccess, handleError);
}

function provideDiscordRoles(authorId, moderationType) {
	return getRequest(`tier/provideDiscordRoles${getModerationQueryParams(authorId, moderationType)}`).then(handleSuccess, handleError);
}

function provideTgInviteLink(authorId, moderationType) {
	return getRequest(`tier/provideTgInviteLink${getModerationQueryParams(authorId, moderationType)}`).then(handleSuccess, handleError);
}

function checkSubscriptionsEnabled(data) {
	return getRequest(`subscriptions/check?subscriptionId=${data.subscriptionId}`).then(handleSuccess, handleError);
}

function extractColorsPalette(data) {
    return postRequest('extractColorsPalette', data).then(handleSuccess, handleError);
}


// ---------------------------
// Admin API (to be removed)
// ---------------------------

function getOpenedPayouts(data) {
    return postRequest('openedPayouts', data).then(handleSuccess, handleError);
}

function saveOpenedPayouts(data) {
    return postRequest('openedPayouts/save', data).then(handleSuccessWithMessage, handleError);
}

function getBilling(isInfo) {
	return getRequest(`billing${isInfo ? '?info=true' : ''}`).then(handleSuccess, handleError);
}

function getBillingPlan(params) {
	const query = buildQueryParams(params);

	return getRequest(`billing/plan${query}`).then(handleSuccess, handleError);
}

function mergeBills() {
	return getRequest('billing/merge').then(handleSuccessWithMessage, handleError);
}

function saveBillingTerms(data) {
	return postRequest('settings/billingTerms', data).then(handleSuccessWithMessage, handleError);
}

function deleteBillingCard() {
	return deleteRequest('billing/card').then(handleSuccessWithMessage, handleError);
}

function getUserStatus(data) {
    return postRequest('userStatus', data).then(handleSuccessWithMessage, handleError);
}

function getUserLinks(data) {
    return postRequest('userLinks', data).then(handleSuccessWithMessage, handleError);
}

function saveUserLinks(data) {
    return postRequest('saveUserLinks', {...data}).then(handleSuccessWithMessage, handleError);
}

// TODO COULD BE REMOVED it think
function setUserStatus(data) {
    return postRequest('userStatus/save', data).then(handleSuccessWithMessage, handleError);
}

function saveDataForUserFromAdmin(data) {
    return postRequest('userStatus/saveDataForUserFromAdmin', data).then(handleSuccessWithMessage, handleError);
}

function getAllUsers() {
    return getRequest('getAllUsers').then(handleSuccess, handleError);
}
