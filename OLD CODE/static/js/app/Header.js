import React, {Component} from 'react';
import {connect} from 'react-redux';
import BurgerMenu from '../coms/misc/BurgerMenu';
import UserMenu from '../coms/user/UserMenu';
import UserSearch from '../coms/user/UserSearch';
import {api} from '../services/api';


class Header extends Component {

    componentDidMount() {
        this.props.dispatch(api.getConfig());
    }

    render() {
        const {nickname, clientName, photo, userRoles} = this.props;
        const onlyUserRole = userRoles?.length === 1 && userRoles?.[0] === 'user';

        const userName = onlyUserRole ? clientName : nickname;

        return (
			<nav className="navbar p-0" >
				<div className="nav-container">
					<div className='d-flex align-items-center'>

						<BurgerMenu />

						<a className='navbar-brand' href="/">
							<img className='logo' src="/img/donatello_logo.svg" alt="Донателло" />
						</a>
					</div>

					<UserSearch isMobileDevice={false} />

					<div className='d-flex align-items-center'>
						<div className="d-flex position-relative">
							<i className="notifications fa-regular fa-bell"></i>
							{/* <span className='notifications-dot'></span> */}
						</div>

						<UserMenu photo={photo} userName={userName} />
					</div>
				</div>
				<div className='navbar-divider'></div>
			</nav>
		);
    }
}

function mapStateToProps(state) {
    const {nickname, clientName, photo, userRoles} = state.config;

    return {
        nickname,
        clientName,
        photo,
        userRoles
    };
}

export default connect(mapStateToProps)(Header);
