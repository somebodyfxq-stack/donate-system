import React, {Component} from 'react';
import {DonatelloLink} from '../../enums/SupportEnums';

class DisclaimerUserPending extends Component {

    TERMS_URL = '/terms';

    render() {
        return <div className="alert alert-warning alert-panel d-flex align-items-start mb-sm-5" role="alert">
            <strong><i className="fas fa-pause-circle mr-3"></i></strong>
            <div>
                Ваш профіль призупинено. Якщо це було помилково, зверніться до&nbsp;
                <a href={DonatelloLink.discord} target="_blank" rel="noopener noreferrer">адміністратора</a>.
            </div>
        </div>
    }
}

export default DisclaimerUserPending;
