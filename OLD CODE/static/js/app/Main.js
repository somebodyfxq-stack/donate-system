import React, {Component} from 'react';
import {withAlert} from 'react-alert';
import DocumentTitle from 'react-document-title';
import {connect} from 'react-redux';
import LoadingBar from 'react-redux-loading-bar';
import {Redirect, Route} from 'react-router-dom';
import {history} from '../utils';
import App from './App';

import Header from './Header';
import Sidebar from './Sidebar';


class Main extends Component {

	constructor(props) {
		super(props);

		const initialValue = (window.location.pathname === "/panel/subscribers" || window.location.pathname === "/panel/donates") && window.innerWidth > 1680;

		this.state = {
			isBiggerContentWidth: initialValue,
			windowWidth: window.innerWidth,
		};
	}

	componentDidMount() {
		window.addEventListener('resize', this.handleResize);

		this.unlisten = history.listen((location) => {
			const shouldBeBigger = (location.pathname === "/panel/subscribers" || location.pathname === "/panel/donates") && this.state.windowWidth > 1680;

			if (shouldBeBigger !== this.state.isBiggerContentWidth) {
				this.setState({ isBiggerContentWidth: shouldBeBigger });
			}
		})
	};

	componentWillUnmount() {
        if (this.unlisten) this.unlisten();

		window.removeEventListener('resize', this.handleResize);
    };

	handleResize = () => {
		clearTimeout(this.resizeTimeout);
		this.resizeTimeout = setTimeout(() => {
			this.setState({ windowWidth: window.innerWidth });
		}, 100);
	};

    UNSAFE_componentWillUpdate(nextProps) {
        // app alert: listen for changes and show popup
        if (nextProps.message !== this.props.message) {
            const {message, type} = nextProps.message;
            if (message) {
                this.props.alert.show(message, {type: type});
            }
        }
    }

    render() {
		const { isBiggerContentWidth, windowWidth } = this.state;

        return <DocumentTitle title="Donatello">
            <div className="root">
				<div className={`main-wrapper ${isBiggerContentWidth && windowWidth > 1500 ? 'bigger-conten-width' : ''}`}>
					<LoadingBar className="loading"/>
					<Header/>
					<Sidebar isMobileDevice={false} />
					<Route exact path="/" render={() => <Redirect to="/panel"/>}/>
					<Route path="/panel" component={App}/>
				</div>
			</div>
        </DocumentTitle>;
    }
}

function mapStateToProps(state) {
    const {message} = state;
    return {
        message
    };
}

export default connect(mapStateToProps)(withAlert(Main));
