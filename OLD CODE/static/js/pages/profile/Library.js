import React, {useState} from 'react';
import {connect} from 'react-redux';
import '../../css/graphics.css';
import QRCodeModal from './graphics/QRCodeModal';

const Library = ({nickname}) => {
  const [qrModalState, setQRModalState] = useState(false);

  return (
    <div className="graphics-container">
      <div className="row">
        <div className="col-sm-6 col-md-4 px-0 px-sm-2 mb-3">
          <div className="item-container">
            <div>
              <div className="d-flex align-items-center" style={{minHeight: '210px'}}>
                <img src="https://media.giphy.com/media/bNHW6EGTxhPGJes8bK/giphy.gif" className="gif" alt="gif"></img>
              </div>
              <h4>Гіфки та стікери</h4>
              <p>Використовуй для публікацій і стрімів</p>
            </div>
            <a href="https://giphy.com/channel/Donatello_to" target="_blank" rel="noopener noreferrer" className="btn btn-primary main-donatello-button">Переглянути</a>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 px-0 px-sm-2 mb-3">
          <div className="item-container">
            <div>
              <div className="d-flex align-items-center" style={{minHeight: '210px'}}>
                <img src="/img/home-assets/working_from_home.svg" className="gif" alt="gif"></img>
              </div>
              <h4>Лого, асети</h4>
              <p>Для текстів, відео, сайтів, банерів та ін.</p>
            </div>
            <a href="/zip-items/assets.zip" target="_blank" rel="noopener noreferrer" className="btn btn-primary main-donatello-button">Завантажити</a>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 px-0 px-sm-2 mb-3">
          <div className="item-container">
            <div>
              <div className="d-flex align-items-center" style={{minHeight: '210px'}}>
                <img src="/img/qr-code-donatello.png" className="gif" alt="qr-code"></img>
              </div>
              <h4>QR код</h4>
              <p>Створи собі крутий QR код</p>
            </div>
            <button className="btn btn-primary main-donatello-button" onClick={() => setQRModalState(true)}>Створити</button>
          </div>
        </div>
      </div>
      <QRCodeModal
        nickname={nickname}
        qrModalState={qrModalState}
        setQRModalState={setQRModalState}
      />
    </div>
  )
}

function mapStateToProps(state) {
  const {nickname} = state.config;
  return {nickname};
}

export default connect(mapStateToProps)(Library);
