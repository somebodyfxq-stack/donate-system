import { featureFlagEnum } from '../enums';

export function featureFlagReducer(state = {}, action) {
    switch (action.type) {
        case featureFlagEnum.SUCCESS:
            return {
                type: 'success',
                message: action.message
            };
        default:
            return state
    }
}