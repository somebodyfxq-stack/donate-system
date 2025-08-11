const initialState = {
	isMenuOpen: false
};

const SET_CLOSE_MENU = 'SET_CLOSE_MENU';

export function mobileMenuReducer(state = initialState, action) {
	switch (action.type) {
		case SET_CLOSE_MENU:
			return {
			...state,
			isMenuOpen: action.payload,
			};
		default:
			return state;
	}
};

