import React, {useCallback, useEffect, useState} from 'react';
import {connect} from 'react-redux';
import Sidebar from '../../app/Sidebar';
import {setMobileMenu} from '../../services/mobileMenuAction';
import store from '../../utils/store';
import UserSearch from '../user/UserSearch';

const BurgerMenu = ({ isMenuOpen }) => {
	const [menuChecked, setMenuChecked] = useState(false);

	const handleChange = useCallback(() => {
		setMenuChecked(!menuChecked)
		store.dispatch(setMobileMenu(!menuChecked))
	}, [menuChecked]);

	useEffect(() => {
		setMenuChecked(isMenuOpen);
	}, [isMenuOpen]);

	return (
		<div className="burger-menu">
			<input
				id="menu-toggle"
				type="checkbox"
				checked={menuChecked}
				onChange={handleChange}
			/>
			<label className="menu-button-container" htmlFor="menu-toggle">
				<div className="menu-button"></div>
			</label>

			<ul className="menu">
				<li>
					<UserSearch isMobileDevice={true} />
				</li>
				<li>
					<Sidebar isMobileDevice={true} />
				</li>
			</ul>
		</div>
	)
}

function mapStateToProps(state) {
    const { isMenuOpen } = state.mobileMenuReducer;
    return { isMenuOpen };
}

export default connect(mapStateToProps)(BurgerMenu);
