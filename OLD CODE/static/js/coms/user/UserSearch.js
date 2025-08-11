import axios from 'axios';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useWindowDimensions} from '../../hooks/useWindowDimensions';

function UserSearch({isMobileDevice}) {
	const [userStatuses, setUserStatuses] = useState([]);
	const [searchValue, setSearchValue] = useState('');
	const [isDropdownVisible, setIsDropdownVisible] = useState(false);
	const width = useWindowDimensions().width;

	const getRandomAvatar = useCallback(() => {
		const topType = ['LongHairStraigh', 'LongHairDreads', 'WinterHat1'].sort(() => 0.5 - Math.random())[0];
		const skinColor = ['Brown', 'Pale', 'Tanned', 'Black'].sort(() => 0.5 - Math.random())[0];
		const eyeType = ['Squint', 'Dizzy', 'Happy'].sort(() => 0.5 - Math.random())[0];
		const clotheType = ['Overall', 'BlazerShirt'].sort(() => 0.5 - Math.random())[0];

		return `https://avataaars.io/?avatarStyle=Circle&topType=${topType}&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=${clotheType}&eyeType=${eyeType}&eyebrowType=Default&mouthType=Default&skinColor=${skinColor}`;

	}, []);

	const fetchAuthors = useCallback(async () => {
		if (!searchValue || searchValue.length < 3) {
			return;
		}

		try {
			const response = await axios.get(`/creators/search?v=${searchValue}`);
			setUserStatuses(response.data.userStatuses);
			setIsDropdownVisible(true);
		} catch (error) {
			console.error('Error:', error);
		}
	}, [searchValue]);

	const handleOutsideClick = useCallback(event => {
		if (!event.target.closest('.dropdown-menu')) {
			setIsDropdownVisible(false);
		}
	}, []);

	useEffect(() => {
		document.addEventListener('click', handleOutsideClick);
		return () => {
			document.removeEventListener('click', handleOutsideClick);
		};
	// eslint-disable-next-line
	}, []);

	const renderUserStatuses = useMemo(() => {
		if (userStatuses.length === 0) {
			return <div className="no-matches">Автора не знайдено <span role="img" aria-label="sad">😢</span></div>;
		}
		return userStatuses.map(d => (
			<a key={d.nickname} className="user-container" href={`/${d.nickname}`} target="_blank" rel="noopener noreferrer">
				<img className="user-image" height="50" width="50" src={d.photo || getRandomAvatar()} alt={d.nickname} />
				<div className="user-label">
					<h3 className="user-name">{d.nickname}</h3>
					<p className="user-description mb-0">{d.description}</p>
				</div>
			</a>
		));
	}, [userStatuses, getRandomAvatar]);

	return (
		<nav className={"search-wrapper-" + (isMobileDevice ? 'mobile' : 'desktop')}>
			<div className="search-container position-relative me-4">

			<div className="input-group d-flex align-items-center flex-nowrap">
				<input
					type="text"
					className="form-control"
					placeholder="Пошук автора"
					value={searchValue}
					onChange={e => setSearchValue(e.target.value)}
					onKeyDown={e => {
						if (e.key === 'Enter') {
							fetchAuthors();
						}
					}}
				/>
				<div className="input-group-append pointer" onClick={() => fetchAuthors()}>
					<img src="/img/home-assets/search.svg" alt="search" />
				</div>
			</div>

			{isDropdownVisible &&
				<div
					className={"dropdown-menu d-block " + (isMobileDevice ? 'mobile-dropdown' : '')}
					style={isMobileDevice ? {left: `calc(${width / 2 - 165}px)` } : {}}
				>
					<div className='user-statuses-container'>
						{renderUserStatuses}
					</div>
				</div>
			}
			</div>
		</nav>
	);
}

export default UserSearch;
