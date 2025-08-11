import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import store from '../utils/store';
import { setMobileMenu } from '../services/mobileMenuAction';

class SidebarSection extends Component {
	constructor(props) {
        super(props);
		const isListExpanded = localStorage.getItem(this.props.id + '-section-expanded') === 'false' ? false : true;
        this.state = {
            isListExpanded: isListExpanded
        };
    }

    isActivePage(page) {
        const path = this.props.location.pathname;
        return path === page.path || path.substring(0, path.lastIndexOf('/')) === page.path; // ignore trailing slash
    }

	toggleList(id) {
		const updatedIsListExpanded = !this.state.isListExpanded;
        this.setState({ isListExpanded: updatedIsListExpanded });
        localStorage.setItem(id + '-section-expanded', updatedIsListExpanded);
	}

	closeMobileMenu() {
		store.dispatch(setMobileMenu(false))
	}

    render() {
        const {section, pages, enabled, features, id} = this.props;
		const {isListExpanded} = this.state;

        return <div
            className={'sidebar-section  ' + (!enabled ? 'section-disabled' : '')}>
            <div
				className="section-title"
				title={section}
				onClick={() => this.toggleList(id)}
			>
				<div className='d-flex justify-content-between align-items-center'>
					<span className="section-title-text">{section}</span>
					{isListExpanded ? <i className="fas fa-angle-up section-title-angle"></i> : <i className="fas fa-angle-down section-title-angle"></i>}
				</div>
            </div>
            {isListExpanded && <div className="list-group list-group-flush animate__animated animate__fadeIn">
                {pages.map(page => {
                    if (page.feature && features && !features.includes(page.feature)) {
                        return <React.Fragment key={page.path}></React.Fragment>;
                    }

                    return <div key={page.path}>
                        {enabled &&
                            <Link to={page.path}
                                  className={`list-group-item list-group-item-action ${this.isActivePage(page) ? 'active' : ''}`}
                                  title={page.title}
								  onClick={() => this.closeMobileMenu()}
								>
                                <i className={'page-icon ' + page.icon}></i>
                                <span className="page-title">{page.title}</span>
                            </Link>}
                        {!enabled && <div
                            className={`list-group-item list-group-item-action d-flex align-items-center page-disabled`}>
                            <i className={'page-icon ' + page.icon}></i>
                            <span className="page-title">{page.title}</span>
                        </div>}
                    </div>
                })}
            </div>}
        </div>;
    }
}

function mapStateToProps(state) {
    const {location} = state.router;
    const {features} = state.config;

    return {location, features};
}

export default connect(mapStateToProps)(SidebarSection);
