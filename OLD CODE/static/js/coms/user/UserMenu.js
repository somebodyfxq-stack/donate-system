import React, {useRef, useState} from 'react';
import NavDropdown from 'react-bootstrap/NavDropdown';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

const UserMenu = ({userRoles, photo, userName}) => {
	const [menuExpanded, setMenuExpanded] = useState(false);
	const menu = useRef(null);

	const toggleMenu = () => {
		setMenuExpanded(!menuExpanded);
	}

	// close menu when click outside
	const closeOpenMenus = e => {
		if(menu.current && menuExpanded && !menu.current.contains(e.target)){
			setMenuExpanded(!menuExpanded);
		}
	}

	document.addEventListener('mousedown', closeOpenMenus);

	const showPageSettings = userRoles?.includes('blogger') || userRoles?.includes('streamer');

	return (
		<>
			<div ref={menu} className='custom-dropdown-wrapper position-relative'>
				<div className="custom-dropdown nav-item dropdown">
					<div id="menu-dropdown" className="dropdown-toggle nav-link p-0" role="button" onClick={() => toggleMenu()}>
						<div className="user-label">
							{photo && <img className="userpic" src={photo} alt="Userpic" />}
							{userName && <div className='d-flex align-items-center font-weight-bold'>{userName}</div>}
						</div>
						<div className='custom-dropdown-arrow position-absolute'>
							{menuExpanded ? <i className="fas fa-angle-up"></i> : <i className="fas fa-angle-down"></i>}
						</div>
					</div>
					<div aria-labelledby="menu-dropdown" className={`dropdown-menu dropdown-menu-right ${menuExpanded ? 'show' : ''}`}>
						{showPageSettings &&
							<Link target="_blank" className="dropdown-item" to={`/${userName}`} onClick={() => toggleMenu()}>
								<i className="fas fa-chalkboard-teacher"></i>
								Моя сторінка
							</Link>
						}
						<Link className="dropdown-item" to="/panel/settings" onClick={() => toggleMenu()}>
							<i className="fas fa-tasks"></i>
							Налаштування
						</Link>
						{showPageSettings &&
							<Link className="dropdown-item" to="/panel/page" onClick={() => toggleMenu()}>
								<i className="fa-solid fa-wrench"></i>
								Сторінка
							</Link>
						}
						<Link className="dropdown-item" to="/panel/library" onClick={() => toggleMenu()}>
							<i className="fa-regular fa-images"></i>
							Графіка і QR код
						</Link>
						{showPageSettings &&
							<Link className="dropdown-item" to="/panel/doc-api" onClick={() => toggleMenu()}>
								<i className="fas fa-code"></i>
								API
							</Link>
						}
						{showPageSettings &&
							<Link className="dropdown-item" to="/panel/whats-new" onClick={() => toggleMenu()}>
								<i className="far fa-question-circle"></i>
								Що нового
							</Link>
						}

						<NavDropdown.Divider />

						<NavDropdown.Item href="/logout">
							<i className="fas fa-arrow-right-from-bracket"></i>
							Вийти
						</NavDropdown.Item>
					</div>
				</div>
			</div>
		</>
	);
};

function mapStateToProps(state) {
	const { userRoles } = state.config;

	return { userRoles };
}

export default connect(mapStateToProps)(UserMenu);
