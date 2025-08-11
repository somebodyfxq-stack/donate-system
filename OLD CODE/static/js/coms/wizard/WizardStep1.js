import React, {Component} from 'react';
import {Link} from 'react-router-dom';

class WizardStep1 extends Component {

    render() {
        return <div className="alert alert-warning alert-panel d-flex align-items-center p-3" role="alert">
            <span>
                <strong><i className="fas fa-tasks" /> &nbsp; Завершіть основні налаштування</strong>
            </span>

            <Link className="btn btn-primary ml-auto" to="/panel/settings">Налаштування</Link>
        </div>;
    }
}

export default WizardStep1;
