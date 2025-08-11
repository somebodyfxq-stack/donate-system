import React, {Component} from 'react';
import DocumentTitle from 'react-document-title';
import {Redirect, Route, withRouter} from 'react-router-dom';

import {DefaultPageRoute, PageRoutes} from '../enums/PageEnums';
import AdminPayouts from '../pages/admin/AdminPayouts';
import AdminUserStatus from '../pages/admin/AdminUserStatus';
import AdminUserLinks from '../pages/admin/AdminUserLinks';
import AdminUserChart from '../pages/admin/AdminUserChart';
import AdminPostsVerification from '../pages/admin/AdminPostsVerification';

function getCurrentPageRoute(path) {
    const currPage = path.replace(/\/+$/, '').replace(/(\d|add)+$/, ''); // ignore trailing slash, digit (id) or add action
    const pageRoute = PageRoutes.find((p) => {
        const page = p.path.replace(':id', ''); // ignore :id pattern
        return page ===  currPage;
    });

    return pageRoute || DefaultPageRoute;
}


class Page extends Component {

    onModuleAction(path) {
        this.props.history.push(path);
    }

    render() {
        const path = this.props.location.pathname;
        const module = getCurrentPageRoute(path);

        return <DocumentTitle title={module.title + ' - Donatello'}>
			<div className="module">

                <header className='module-header'>
                    <div className="module-title">
                        {module.title}
                    </div>
                </header>

                <div className="module-content">
                    <Route exact path="/panel" render={() => <Redirect to="/panel/loading"/>}/>

                    {PageRoutes.map((route) => (
                        <Route key={route.path}
                               path={route.path}
                               exact={route.exact}
                               component={route.component}/>
                    ))}

                    <Route key="/panel/adm-user-chart"
                        path="/panel/adm-user-chart"
                        exact={true}
                        component={AdminUserChart}/>

                    <Route key="/panel/adm-payouts"
                           path="/panel/adm-payouts"
                           exact={true}
                           component={AdminPayouts}/>

                    <Route key="/panel/adm-user-status"
                           path="/panel/adm-user-status"
                           exact={true}
                           component={AdminUserStatus}/>

                    <Route key="/panel/adm-user-links"
                        path="/panel/adm-user-links"
                        exact={true}
                        component={AdminUserLinks}/>

                    <Route key="/panel/adm-posts-verification"
                        path="/panel/adm-posts-verification"
                        exact={true}
                        component={AdminPostsVerification}/>
                </div>
            </div>
        </DocumentTitle>;
    }
}

export default withRouter(props => <Page {...props}/>);
