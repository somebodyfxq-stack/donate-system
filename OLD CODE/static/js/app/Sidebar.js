import React, {Component} from 'react';
import {UserStatus} from '../enums/UserStatus';
import SidebarSection from './SidebarSection';
import {SidebarPages} from '../enums/PageEnums';
import {connect} from 'react-redux';
import SidebarSupport from './SidebarSupport';

class Sidebar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pages: SidebarPages
        };
    }

    render() {
        const {pages} = this.state;
        const userPages = [{...pages.find(page => page.id === "profile")}];

        const {hasSettings, isUserAllowed, userRoles} = this.props;

        if (userRoles?.includes('user')) {
            userPages.unshift(pages.find(page => page.id === "user-subscription"));
        }

        if (userRoles?.includes('blogger')) {
            userPages.unshift(pages.find(page => page.id === "subscription"));
        }

        if (userRoles?.includes('streamer')) {
            userPages.unshift(pages.find(page => page.id === "widgets"));
        }

        // only for user
        if (userRoles?.includes('user') && userRoles?.length === 1) {
            userPages.forEach(page => {
                if (page.id === "profile") {
                    page.pages = page.pages.filter(child => child.id === "settings");
                }
                return page;
            });
        // some user roles selected but not only user
        } else if (userRoles?.length > 0) {
            userPages.unshift(pages.find(page => page.id === "main"));
        // nothing is selected
        } else {
            userPages.forEach(page => {
                if (page.id === "profile") {
                    page.pages = page.pages.filter(child => child.id === "settings");
                }
                return page;
            });
        }

		const filteredPages = userPages.filter(page => page.id !== "profile");

        return <div className={"sidebar " + (this.props.isMobileDevice ? 'sidebar-mobile' : 'sidebar-desktop')}>
            {userPages && filteredPages && filteredPages.map((section) => {
                return <SidebarSection
                    key={section.id}
                    id={section.id}
                    icon={section.icon}
                    section={section.section}
                    pages={section.pages}
                    enabled={isUserAllowed && ((section.requireSettings && hasSettings) || !section.requireSettings)}
                />
            })}
            <SidebarSupport/>
        </div>;
    }
}


function mapStateToProps(state) {
    const {hasSettings, status, userRoles} = state.config;
    const isUserAllowed = status !== UserStatus.blocked;
    return {hasSettings, isUserAllowed, userRoles};
}

export default connect(mapStateToProps)(Sidebar);
