import { configEnum } from '../enums';

const defaultState = {
    userId: null,
    nickname: 'username',
    clientName: '',
    amount: 0,
    hasSettings: false,
    hasPage: false
};

export function config(state = defaultState, action) {
    switch (action.type) {
        case configEnum.GET_CONFIG_SUCCESS:
            return action.config;

        case configEnum.GET_CONFIG_FAILURE:
            return {
                error: action.error
            };
        default:
            return state
    }
}
