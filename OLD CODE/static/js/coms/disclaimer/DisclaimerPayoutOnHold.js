import 'rc-slider/assets/index.css';
import React, {Component} from 'react';
import ReactModal from 'react-modal';
import {DonatelloLink} from '../../enums/SupportEnums';
import '../../css/payouts.css';


const ModalStyles = {
    content: {
        top: '50px',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        borderRadius: '15px',
        transform: 'translate(-50%, 0%)',
        width: '50%',
        zIndex: '99',
    }
};

ReactModal.setAppElement('#root');



class DisclaimerPayoutOnHold extends Component {

    render = () => {
        return (
            <ReactModal
                isOpen={this.props.show}
                onRequestClose={() => this.setState({showPayoutStatusModal: false})}
                style={ModalStyles}
                contentLabel="Призупинено">
                    <div className="alert alert-warning alert-panel mb-sm-3 small" role="alert">
                        <div className="d-flex align-items-start">
                            <strong><i className="fas fa-exclamation-circle mr-4"></i></strong>
                            <div>
                                Ой, ваш переказ зупинено. Ми не змогли перевірити ваш профіль.
                                Надішліть посилання на ваші медіа канали адміну у Discord або у Facebook (YouTube, Twitch, TikTok, Instagram чи ін.), щоб підтвердити призначення донатів.
                                Просимо, щоб в описі вашого медіа каналу або будь-якої публікації було вказано посилання на вашу донат-сторінку.
                                Це підтверджуватиме, що ви автор каналу.
                            </div>
                        </div>
                    </div>
                <a href={DonatelloLink.facebook} target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-facebook-messenger mr-3"></i>
                </a>

                <a href={DonatelloLink.discord} target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-discord"></i>
                </a>
            </ReactModal>
        )
    }
}

export default DisclaimerPayoutOnHold;
