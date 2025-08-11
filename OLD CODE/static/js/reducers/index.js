import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { config } from './configReducer';
import { message } from './messageReducer';
import { featureFlagReducer } from './featureFlagReducer';
import { loadingBarReducer } from 'react-redux-loading-bar';
import { mobileMenuReducer } from './mobileMenuReducer';

export default combineReducers({
    router: routerReducer,
    config,
    message,
    featureFlagReducer,
    loadingBar: loadingBarReducer,
	mobileMenuReducer,
});
