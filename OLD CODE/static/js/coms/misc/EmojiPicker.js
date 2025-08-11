import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import React, {useCallback, useState} from 'react';

const EmojiPicker = ({ message, setMessage, width }) => {
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const storedTheme = localStorage.getItem('don-darkTheme') === 'true';

	const onEmojiClick = useCallback((emoji) => {
		setMessage(message + emoji.native);
	}, [message, setMessage]);

	return (
		<div className='position-relative'>
			<div className="emoji-button" onClick={() => setShowEmojiPicker((prev) => !prev)}>
				<i className="fa-regular fa-face-smile"></i>
			</div>

			{showEmojiPicker &&
				<Picker
					data={data}
					theme={storedTheme ? 'dark' : 'light'}
					perLine={width < 575 ? '8' : '9'}
					searchPosition='none'
					locale='uk'
					onEmojiSelect={onEmojiClick}
					onClickOutside={() => setShowEmojiPicker((prev) => !prev)}
				/>
			}
		</div>
	)
}

export default EmojiPicker;
