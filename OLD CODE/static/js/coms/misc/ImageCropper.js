import React, {useCallback, useState} from 'react';
import Cropper from 'react-easy-crop';
import ReactModal from 'react-modal';
import '../../css/image-cropper.css';

const customStyles = {
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		borderRadius: '15px',
		transform: 'translate(-50%, -50%)',
		width: '650px',
		height: '600px',
		zIndex: '99',
		overflowX: 'hidden',
	}
};

export const readFile = (file) => {
	return new Promise((resolve) => {
		const reader = new FileReader()
		reader.addEventListener('load', () => resolve(reader.result), false)
		reader.readAsDataURL(file)
	})
};

const ImageCropper = ({ imageUrl, setPageBgImage, closeModal }) => {
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

	const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
		const fiftyPercentFromHeight = croppedAreaPixels.height * 0.5;
		const twentyFivePercentFromHeight = croppedAreaPixels.height * 0.25;

		setCroppedAreaPixels({
			...croppedAreaPixels,
			y: croppedAreaPixels.y - twentyFivePercentFromHeight,
			height: croppedAreaPixels.height + fiftyPercentFromHeight
		});
	}, []);

	const handleCloseModal = useCallback(() => {
		closeModal();
	}, [closeModal]);

	const createImage = useCallback((url) =>
		new Promise((resolve, reject) => {
			const image = new Image();
			image.addEventListener('load', () => resolve(image));
			image.addEventListener('error', (error) => reject(error));
			image.setAttribute('crossOrigin', 'anonymous');
			image.src = url;
		}
	), []);

	const getCroppedImg = useCallback(async (imageSrc, pixelCrop) => {
		const image = await createImage(imageSrc);

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		const fiftyPercentFromHeight = pixelCrop.height * 0.5;
		const twentyFivePercentFromHeight = pixelCrop.height * 0.25;

		if (!ctx) {
			return null;
		}

		canvas.width = pixelCrop.width;
		canvas.height = pixelCrop.height + fiftyPercentFromHeight;

		ctx.drawImage(
			image,
			pixelCrop.x,
			pixelCrop.y - twentyFivePercentFromHeight,
			pixelCrop.width,
			pixelCrop.height + fiftyPercentFromHeight,
			0,
			0,
			pixelCrop.width,
			pixelCrop.height + fiftyPercentFromHeight
		);

		return new Promise((resolve, reject) => {
			canvas.toBlob((file) => {
				resolve(URL.createObjectURL(file));
			}, 'image/png');
		});
	}, [createImage]);

	const saveCroppedImage = useCallback(async () => {
		try {
			const croppedImage = await getCroppedImg(
				imageUrl,
				croppedAreaPixels
			);

			setPageBgImage(croppedImage);
			closeModal();
		} catch (e) {
			console.error(e);
		}
	}, [croppedAreaPixels, getCroppedImg, imageUrl, closeModal, setPageBgImage]);

	return (
		<ReactModal
			isOpen={true}
			onRequestClose={handleCloseModal}
			style={customStyles}
			contentLabel="Example Modal"
		>
			<div className="crop-container">
				<Cropper
					image={imageUrl}
					crop={crop}
					zoom={zoom}
					aspect={1040 / 200}
					onCropChange={setCrop}
					onCropComplete={onCropComplete}
					onZoomChange={setZoom}
				/>
			</div>
			<div className="controls">
				<input
					type="range"
					value={zoom}
					min={1}
					max={3}
					step={0.1}
					aria-labelledby="Zoom"
					onChange={(e) => {
						setZoom(e.target.value)
					}}
					className="zoom-range"
				/>
			</div>
			<div className="save-button">
				<button className="btn btn-dark" onClick={() => saveCroppedImage()}>Зберегти</button>
			</div>
		</ReactModal>
	);
};

export default ImageCropper;
