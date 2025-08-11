import QRCodeStyling from 'qr-code-styling';
import React, {useCallback, useEffect, useState} from 'react';
import {SketchPicker} from 'react-color';

import ReactModal from 'react-modal';
import reactCSS from 'reactcss';

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
ReactModal.setAppElement('#root')
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    borderRadius: '15px',
    transform: 'translate(-50%, -50%)',
    height: '460px',
    width: '640px',
    zIndex: '99',
    overflowX: 'hidden',
  }
};

export const QRCodeGenerator = (nickname, qrCodeStyle, pickerDotsData, pickerQRData) => {
	const { width, height, margin } = qrCodeStyle;
	const qrCode = new QRCodeStyling({
		data: `https://donatello.to/${nickname}`,
		image: `data:image/png;base64,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`,
		width: width,
		height: height,
		margin: margin,
		qrOptions: {
			typeNumber: '0',
			mode: 'Byte',
			errorCorrectionLevel: 'Q'
		},
		imageOptions: {
			hideBackgroundDots: true,
			imageSize: 0.3,
			margin: 5
		},
		dotsOptions: {
			type: 'rounded',
			color: pickerDotsData || '#0A1830',
			gradient: null
		},
		cornersSquareOptions: {
			type: 'extra-rounded',
			color: pickerQRData || '#0A1830'
		},
		cornersDotOptions: {
			type: 'dot',
			color: pickerQRData || '#0A1830'
		}
	});

	return qrCode;
}

const qrCodeStyles = {
	width: 300,
	height: 300,
	margin: 15,
}

const QRCodeModal = ({ nickname, qrModalState, setQRModalState }) => {
  const [qrCodeItem, setQRCodeItem] = useState(false);
  const [showDotsPicker, setShowDotsPicker] = useState(false);
  const [pickerDotsData, setDotsPickerData] = useState('#4F79F2');

  const [showQRPicker, setShowQRPicker] = useState(false);
  const [pickerQRData, setQRPickerData] = useState('#f3c64d');

  const downloadQRCode = useCallback((name, extension) => {
    qrCodeItem.download({name, extension});
  }, [qrCodeItem]);

  useEffect(() => {
    if (qrModalState) {
	  const qrCode = QRCodeGenerator(nickname, qrCodeStyles, pickerDotsData, pickerQRData);

      setQRCodeItem(qrCode);

      setTimeout(() => {
        const parent = document.getElementById("canvas")
        while (parent.firstChild) {
          parent.firstChild.remove()
        }
        qrCode.append(document.getElementById("canvas"));
      }, 100)
    }
  }, [qrModalState, pickerDotsData, nickname, pickerQRData]);

  const styles = reactCSS({
    default: {
      dotsColor: {
        width: '36px',
        height: '14px',
        borderRadius: '2px',
        background: pickerDotsData
      },
      qrColor: {
        width: '36px',
        height: '14px',
        borderRadius: '2px',
        background: pickerQRData
      },
      swatch: {
        padding: '5px',
        background: '#fff',
        borderRadius: '1px',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
        display: 'inline-block',
        cursor: 'pointer',
      },
      popover: {
        position: 'absolute',
        zIndex: '2',
      },
      cover: {
        position: 'fixed',
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      }
    }
  });

  return (
    <ReactModal
      isOpen={qrModalState}
      onAfterOpen={null}
      onRequestClose={() => setQRModalState(false)}
      style={customStyles}
      contentLabel="QRModal"
    >
      <div>
        <h4 className="text-center mt-4">QR код твоєї сторінки</h4>
        <div className="d-flex justify-content-center mt-2 mb-3">
          <a href={`https://donatello.to/${nickname}`} target="_blank" rel="noopener noreferrer">https://donatello.to/{nickname}</a>
        </div>
        <div className="d-flex">
          <div id="canvas"></div>
          <div className="col-sm-6 pt-4">
            <p>Змінити колір</p>
            <div className="row col">
              <div className="col-sm-6 px-0 mb-2">
                <div style={styles.swatch} onClick={() => setShowDotsPicker(true)}>
                  <div style={styles.dotsColor} />
                </div>
                {showDotsPicker && (
                  <div style={styles.popover}>
                    <div style={styles.cover} onClick={() => setShowDotsPicker(false)} />
                    <SketchPicker
                      color={pickerDotsData}
                      onChange={(e) => setDotsPickerData(e.hex)} />
                  </div>
                )}
              </div>
              <div className="col-sm-6 px-0 mb-2">
                <div style={styles.swatch} onClick={() => setShowQRPicker(true)}>
                  <div style={styles.qrColor} />
                </div>
                {showQRPicker && (
                  <div style={styles.popover}>
                    <div style={styles.cover} onClick={() => setShowQRPicker(false)} />
                    <SketchPicker
                      color={pickerQRData}
                      onChange={(e) => setQRPickerData(e.hex)} />
                  </div>
                )}
              </div>
            </div>
            <div className="mt-5">
              <button className="btn btn-sm btn-primary main-donatello-button mb-3 w-100" onClick={() => downloadQRCode(`qr_donatello_to_${nickname}`, 'svg')}>Завантажити SVG вектор</button>
              <button className="btn btn-sm btn-primary main-donatello-button w-100" onClick={() => downloadQRCode(`qr_donatello_to_${nickname}`, 'png')}>Завантажити PNG малюнок</button>
            </div>
          </div>
        </div>
      </div>
    </ReactModal>
  )
}

export default QRCodeModal;
