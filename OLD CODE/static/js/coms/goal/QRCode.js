import React, {useEffect} from 'react';
import {QRCodeGenerator} from '../../pages/profile/graphics/QRCodeModal';

const qrCodeStyles = {
	width: 145,
	height: 145,
	margin: 12,
}

const QRCode = ({ nickname, isQrCode }) => {

	useEffect(() => {
		if (isQrCode) {
			const qrCode = QRCodeGenerator(nickname, qrCodeStyles);

			setTimeout(() => {
				const parent = document.getElementById("canvas")
				while (parent.firstChild) {
					parent.firstChild.remove()
				}
				qrCode.append(document.getElementById("canvas"));
			}, 100);
		}
	}, [nickname, isQrCode]);

	return (
		<>
			{isQrCode && <div id="canvas" className='mr-0 mr-sm-4'></div>}
		</>
	)
}

export default QRCode;
