import React, {useEffect, useState} from 'react';
import '../../css/gif-search.css';

const TENOR_API_KEY = 'AIzaSyAPKw8dwY58Gtqavf_NwLFBzXOvnGZgx5A';
const TENOR_GIF_LIMIT = 16;

const TenorGifSearch = props => {
	const limitGifDefault = TENOR_GIF_LIMIT;
	const [searchQuery, setSearchQuery] = useState('');
	const [gifData, setGifData] = useState([]);
	const [limitGif, setLimitGif] = useState(limitGifDefault);

	useEffect(() => {
		if (searchQuery === '') {
			props.setShowStandardImages(true);
			setGifData([])
		} else {
			props.setShowStandardImages(false);
		}
	}, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

	const handleInputChange = e => {
		setSearchQuery(e.target.value);
	};

	const httpGetAsync = async theUrl => {
		try {
			const response = await fetch(theUrl);
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error fetching data:', error);
			return null;
		}
	};

	const searchGif = (limit) => {
		const apiKey = TENOR_API_KEY;
		const search_url = `https://tenor.googleapis.com/v2/search?q=${searchQuery}&key=${apiKey}&limit=${limit}`;

		httpGetAsync(search_url)
			.then(response_objects => {
				if (response_objects) {
					setGifData(response_objects.results);
				} else {
					setGifData([]);
				}
			})
			.catch(error => {
				console.error('Error handling search:', error);
				setGifData([]);
			});
	};

	const handleSearch = (e) => {
		e.preventDefault();
		e.stopPropagation();
		searchGif(limitGifDefault);
		setLimitGif(limitGifDefault);
	};

	const handleMoreClick = () => {
		setLimitGif(prevLimit => prevLimit + limitGifDefault);
		searchGif(limitGif + limitGifDefault);
	}

	const handleGifClick = gif => {
		const isGifSelected = props.selectedGif && props.selectedGif.id === gif.id;

		if (isGifSelected) {
			props.onClick(null);
		} else {
			props.onClick(gif);
			localStorage.setItem("lastSelectedTenorGif", JSON.stringify(gif));
		}

		props.updateSelectButtonDisabled(isGifSelected);
	};

	return (
		<>
			<form onSubmit={handleSearch}>
				<div className="input-group search-gif-input">
					<input
						type="search"
						className="form-control border-right-0 border"
						value={searchQuery}
						onChange={handleInputChange}
						placeholder="Пошук анімацій в бібліотеці Tenor"
					/>
					<span className="input-group-append">
						<button type="submit" className="btn btn-outline-secondary search-gif-button border-left-0 border">
							<i className="fa fa-search"></i>
						</button>
					</span>
				</div>
			</form>
			{gifData.length > 0 && (
				<div className='search-gif-wrapper'>
					<div className="search-gif-container">
						{gifData.map(gif => (
							<div
								key={gif.id}
								className="gif-container"
								onClick={() => {
									handleGifClick(gif);
								}}
							>
								<img src={gif.media_formats.nanogif.url} alt={gif.itemurl} className="search-gif-image" />

								<div className={`checked-item ${props.selectedGif?.id === gif.id ? 'active' : ''}`}>
									<i className="fa-solid fa-check"></i>
								</div>
							</div>
						))}
					</div>
					<div className="d-flex my-3">
						<button
							className='btn btn-primary mx-auto'
							disabled={limitGif >= 50}
							onClick={() => handleMoreClick()}
						>
							Більше GIF
						</button>
					</div>
				</div>
			)}
		</>
	);
};

export default TenorGifSearch;
