import React, {Component} from 'react';

class DisclaimerCryptoWalletNotes extends Component {

    render() {
        return <div className="alert alert-info alert-panel mt-3 mb-2" role="alert" style={{fontWeight: 'normal'}}>
            <div className="d-flex align-items-start">
				<i className="fa-solid fa-circle-info"></i>
                <div>
					<strong>Виплачуєш на гаманець біржі</strong>? <br/> Перевіряй номер гаманця <strong>перед кожною виплатою</strong>!
					Біржі можуть змінювати твій гаманець перед кожним новим зарахуванням.
				</div>
            </div>
        </div>
    }
}

export default DisclaimerCryptoWalletNotes;
