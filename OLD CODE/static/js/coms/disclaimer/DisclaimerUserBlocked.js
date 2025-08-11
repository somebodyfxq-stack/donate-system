import React, {Component} from 'react';
import {DonatelloLink} from '../../enums/SupportEnums';

class DisclaimerUserBlocked extends Component {

    TERMS_URL = '/terms';

    render() {
        return <div className="alert alert-warning alert-panel d-flex align-items-start p-4" role="alert">
            <strong><i className="fas fa-exclamation-triangle fa-2x ml-3 mr-3 mt-2"/></strong>
            <div className="ml-4">
                <strong>Вашу сторінку заблоковано</strong> за порушення <a href={this.TERMS_URL} target="_blank" rel="noopener noreferrer">Умов та правил
                користування сервісом</a>.<br/><br/>
                Якщо ви вважаєте, що це було помилково, зверніться до&nbsp;
                <a href={DonatelloLink.discord} target="_blank" rel="noopener noreferrer">адміністратора</a>.
            </div>
        </div>;
    }
}

export default DisclaimerUserBlocked;
