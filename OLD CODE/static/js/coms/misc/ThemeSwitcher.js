import React, {useCallback, useState} from 'react';
import {api} from '../../services/api';
import helpers from '../../utils/helpers';

function ThemeSwitcher() {
	const storedTheme = localStorage.getItem('don-darkTheme');
	const [theme, setTheme] = useState(storedTheme === 'true');

	const toggleSwitch = useCallback( newTheme => {
			helpers.toggleDarkTheme(newTheme);
			setTheme(newTheme);
			api.updateSettings({ darkTheme: newTheme });
		},[]
	);

	return (
		<div className="theme-switcher">
			{!theme ?
				(<span id="darkTheme" onClick={() => toggleSwitch(!theme)}>
					<i className="fa-solid fa-moon"></i>
				</span> )
			:
				(<span id="lightTheme" onClick={() => toggleSwitch(!theme)}>
					<i className="fa-solid fa-sun"></i>
				</span>)
			}
		</div>
	);
}

export default ThemeSwitcher;
