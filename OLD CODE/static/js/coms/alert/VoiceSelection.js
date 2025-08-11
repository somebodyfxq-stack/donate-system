import React, { useState, useEffect, useCallback } from 'react';
import ReactModal from 'react-modal';

ReactModal.setAppElement('#root');
const customStyles = {
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		padding: '32px 40px',
		borderRadius: '30px',
		transform: 'translate(-50%, -50%)',
		height: 'auto',
		width: '100%',
		maxWidth: '580px',
		zIndex: '99',
		overflowX: 'hidden'
	}
};

let audio = null;
let playingAudioID = null;

const VoiceSelection = ({languageTTS, languages, onChange, isUserVerifiedStatus}) => {
	const [showVoiceSelectionModal, toggleVoiceSelectionModal] = useState(false);
	const [selectedVoiceId, setSelectedVoiceId] = useState(languageTTS);
	const [searchTerm, setSearchTerm] = useState('');
	const [filteredLanguages, setFilteredLanguages] = useState(languages);
	const voice = languages.find(language => language.voiceID === languageTTS);

	useEffect(() => {
		const delayDebounce = setTimeout(() => {
			const filtered = languages.filter(lang =>
				lang.label.toLowerCase().includes(searchTerm.toLowerCase())
			);
			setFilteredLanguages(filtered);
		}, 300);

		return () => clearTimeout(delayDebounce);
	}, [searchTerm, languages]);

	const onPlayVoice = useCallback((e, voiceID) => {
		e.preventDefault();
		audio && audio.pause();

		if (audio?.paused && playingAudioID === voiceID) {
			audio.pause();
			playingAudioID = null;
			return
		}

		const item = languages.find(lang => lang.voiceID === voiceID);
		const url = `/voices/${item.voiceID || 'googleStandardTTS'}.mp3`;
		playingAudioID = item.voiceID

		audio = new Audio(url);
		audio.play();
	}, [languages]);

	const addVoice = useCallback(() => {
		audio && audio.pause();
		playingAudioID = null;

		onChange({ target: { value: selectedVoiceId, id: 'languageTTS' } });
		toggleVoiceSelectionModal(false);
		setSearchTerm('');
	}, [selectedVoiceId, onChange]);

	const closeModal = useCallback(() => {
		audio && audio.pause();
		playingAudioID = null;

		toggleVoiceSelectionModal(false);
		setSelectedVoiceId(languageTTS);
		setSearchTerm('');
	}, [languageTTS]);

	return (
		<>
			<div className="">
				<button type='button' title={voice.description}
					className='btn btn-outline-dark voice-selection-btn'
					onClick={() => toggleVoiceSelectionModal(true)}
				>
					{voice.label}
				</button>
			</div>

			<ReactModal
				isOpen={showVoiceSelectionModal}
				onAfterOpen={null}
				onRequestClose={() => closeModal()}
				style={customStyles}
				contentLabel="Voice selection modal"
			>
				<div className="close-confirm-modal" onClick={() => closeModal()}>
					<i className="fa-solid fa-xmark"></i>
				</div>
				<div className='confirm-modal-content'>
					<h4 className="modal-title">Вибір голосу читання повідомлення</h4>
				</div>
				<div className="voice-picker-header">
					<label className="col-form-label" htmlFor="voice-search">Пошук</label>
					<input type="text"	placeholder="Назва голосу" className="form-control mb-3"
						value={searchTerm}	onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<div className="voice-options style-scrollbar dividing-line-bottom mb-3">
					{filteredLanguages.map((option, i) => {
						return (
							<label key={i} className="voice-option align-items-center mb-0">
								<div>
									<input type="radio"	id="languageTTS"
										checked={option.voiceID === selectedVoiceId}
										onChange={() => setSelectedVoiceId(option.voiceID)}
										disabled={!isUserVerifiedStatus && !option.voiceID.includes('google')}
									/>
								</div>
								<div className="ml-2 flex-grow-1">
									<div className="font-600" style={{fontWeight: '600'}}>{option.label}</div>
									<div className="light-gray-60" style={{color: '#6C7483'}}>{option.description}</div>
								</div>
								<div className="d-flex align-items-center ml-2">
									{/* <div className="d-flex align-items-center text-muted mr-3"><i className="fa-solid fa-thumbs-up mr-2"></i>0</div> */}
									<button type="button" className="btn p-0 play-voice-btn"
										onClick={(e) => onPlayVoice(e, option.voiceID)}
									>
										<i className="fa-solid fa-circle-play"></i>
									</button>
								</div>
							</label>
						)
					})}
				</div>

				<div className="d-flex justify-content-between voice-selection-action-buttons">
					<button className="btn btn-outline-dark" onClick={() => closeModal()}>
						Скасувати
					</button>
					<button className="btn btn-dark" onClick={() => addVoice()}>
						Додати
					</button>
				</div>
			</ReactModal>
		</>
	);
};

export default VoiceSelection;
