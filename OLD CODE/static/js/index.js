import 'bootstrap/dist/css/bootstrap.min.css';
import './css/index.css';

import React from 'react';
import {Provider as AlertProvider} from 'react-alert';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {ConnectedRouter} from 'react-router-redux';
// import registerServiceWorker from './utils/registerServiceWorker';
import Main from './app/Main';

import Message from './coms/misc/Message';
import messageOptions from './enums/messageOptions';
import {history} from './utils';
import store from './utils/store';

const target = document.querySelector('#root');

ReactDOM.render(
    <Provider store={store}>
        <AlertProvider template={Message} {...messageOptions}>
            <ConnectedRouter history={history}>
                <Main />
            </ConnectedRouter>
        </AlertProvider>
    </Provider>,
    target
);

// registerServiceWorker();
