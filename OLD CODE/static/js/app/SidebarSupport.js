import React, {Component} from 'react';
import ThemeSwitcher from '../coms/misc/ThemeSwitcher';
import {DonatelloLink} from '../enums/SupportEnums';

class SidebarSupport extends Component {

    render() {
        return <div className="sidebar-section sidebar-section-support">

			<ThemeSwitcher />

            <div className="list-group list-group-flush d-flex align-items-center">
				<a href={DonatelloLink.instagram} target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-instagram"></i>
                </a>

                <a href={DonatelloLink.facebook} target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-facebook-f"></i>
                </a>

                <a href={DonatelloLink.discord} target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-discord"></i>
                </a>

                <a href={`mailto:${DonatelloLink.email}`}>
                    <i className="fas fa-envelope mr-0"></i>
                </a>
            </div>
        </div>;
    }
}

export default SidebarSupport;
