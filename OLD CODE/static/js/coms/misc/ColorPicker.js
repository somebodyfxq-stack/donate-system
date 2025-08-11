import React, {useCallback, useEffect, useState} from 'react';
import {SketchPicker} from 'react-color';

const ColorPicker = ({ onChange, color: initialColor }) => {
	const [color, setColor] = useState(initialColor);
	const [displayColorPicker, setDisplayColorPicker] = useState(false);

	useEffect(() => {
		setColor(initialColor);
	}, [initialColor]);

	const handleClick = useCallback(() => {
		setDisplayColorPicker((prevDisplay) => !prevDisplay);
	}, []);

	const handleClose = useCallback(() => {
		setDisplayColorPicker(false);
	}, []);

	const handleChange = useCallback((color) => {
		setColor(color.hex);
		onChange(color.hex);
	}, [onChange]);

	const styles = {
		colorBox: {
			width: '30px',
			height: '30px',
			borderRadius: '50%',
			backgroundColor: color,
			border: '1px solid #c5c5c5',
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
	};

	return (
		<div>
			<div style={styles.colorBox} onClick={handleClick} />
			{displayColorPicker ? (
				<div style={styles.popover}>
					<div style={styles.cover} onClick={handleClose} />
					<SketchPicker color={color} onChange={handleChange} />
				</div>
			) : null}
		</div>
	);
};

export default ColorPicker;
