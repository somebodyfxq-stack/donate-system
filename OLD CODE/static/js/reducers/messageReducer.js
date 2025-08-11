import { messageEnum } from '../enums';

export function message(state = {}, action) {
    switch (action.type) {
        case messageEnum.SUCCESS:
            return {
                type: 'success',
                message: action.message
            };
        case messageEnum.ERROR:
            return {
                type: 'error',
                message: action.message
            };
        case messageEnum.CLEAR:
            return {};
        default:
            return state
    }
}