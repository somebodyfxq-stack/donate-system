import React from 'react';

const AuthorsToModerateContainer = ({ authors, activeAuthor, setActiveAuthor, getData }) => {
	const authorsModerationEnabled = authors.some(author => author.toggle);

	if (!authors.length || !authorsModerationEnabled) return null;

	return (
		<div className="tabs-button-container">
			<div className="text-disclaimer">
				<span>
					Вас додано як модератора цієї сторінки {authors.length > 1 ? 'авторами' : 'автором'}:
				</span>
				<div className="nav nav-tabs" style={{ padding: 0, margin: 0 }}>
					{authors.map(author => (
						<button
							key={author.userId}
							className={`nav-link ${activeAuthor === author.userId ? 'active' : ''} ${!author.toggle ? 'd-none' : ''}`}
							onClick={() => {
								getData(author.userId);
								setActiveAuthor(author.userId);
							}}
						>
							{author.authorNickname}
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

export default AuthorsToModerateContainer;
