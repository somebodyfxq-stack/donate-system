import React, {useCallback, useState} from 'react';
import ReactModal from 'react-modal';
import {useWindowDimensions} from '../../hooks/useWindowDimensions';
import {PostType} from '../../models/PostModel';
import {api} from '../../services/api';
import {messageService} from '../../services/messageService';
import moment from 'moment';

import '../../css/post-preview.css';

const replaceImage = 'https://donatello.to/img/userpic-placeholder-02.png';

const customStyles = {
	content: {
		top: 'auto',
		left: '50%',
		right: 'auto',
		bottom: '0',
		marginRight: '-50%',
		padding: '32px 16px',
		borderRadius: '30px 30px 0 0',
		transform: 'translate(-50%, 0)',
		width: '100%',
		minWidth: '100%',
		zIndex: '99',
	}
};

function youtubeParser(url) {
	const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
	const match = url.match(regExp);

	return match && match[7].length === 11 ? match[7] : false;
}

const PostPreview = ({
	post,
	user,
	subscription,
	isUserNews,
	isOpenSeparatePost,
	setSelectedTag,
	updatePostLikes,
	updatePostVotes,
	updatePost,
	postAvailable,
	showInteractContainer
}) => {
	const [showAll, setShowAll] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [pollOption, setPollOption] = useState('');
	const width = useWindowDimensions().width;

	const getPostUrl = useCallback(() => {
		return `${window.location.origin}${post.publicUrl}`;
	}, [post.publicUrl]);

	const showOptions = useCallback((post) => {
		return post.pollOptions.map((option, i) => (
			<div className="form-check pb-2" key={i} onChange={() => setPollOption(option)}>
				<input className="form-check-input" type="radio" name={post.id} id={option + i} value={option} required />
				<label className="form-check-label poll-label" htmlFor={option + i}>
					{option}
				</label>
			</div>
		))
	}, []);

	const getPoll = useCallback((post, poll, i) => {
		const width = ((post.pollData?.[poll]?.counter || 0) * 100) / post.votes || 0;
		const winner = post.pollCompleted && post.highestOption === poll && '🎉';

		return (
			<div key={i}>
				<div className="progress mb-2 position-relative">
					<div
						className="progress-bar"
						role="progressbar"
						style={{ width: `${width.toFixed()}%` }}
						aria-valuenow={width.toFixed()}
						aria-valuemin="0"
						aria-valuemax="100"
					>
						<div className='poll-options'>
							<div>
								{poll}{' '}{post.userOptionSelected === poll && <i className="fa-solid fa-check item-selected-icon ml-1"></i>}{' '}{winner}
								</div>
							<div>
								({post.pollData?.[poll]?.counter || 0}) {width.toFixed()}%
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}, []);

	const handleShare = useCallback(async () => {
		try {
			await navigator.share({
				url: getPostUrl()
			});
		} catch (error) {
			console.error('Error sharing:', error);
		}
		setShowModal(false);
	}, [getPostUrl]);

	const onLikeClick = useCallback(async (post) => {
		const { id: postId } = post;
		const likeStatus = post.currentUserLiked === "liked" ? 'dislike' : 'like';

		const resp = await api.onLikeClick({ postId, likeStatus });

		if (resp.success) {
			updatePostLikes(post.currentUserLiked === 'liked', postId)
		}
	}, [updatePostLikes]);

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(getPostUrl());
			messageService.success('URL скопійовано в буфер обміну');
		} catch (error) {
			console.error('Error copying to clipboard:', error);
		}
		setShowModal(false);
	}, [getPostUrl]);

	const renderItemsShare = useCallback(() => {
		return (
			<>
				<div className='dropdown-item share' onClick={handleCopy}>
					<i className="fa-solid fa-link"></i>
					<span>Копіювати посилання</span>
				</div>
				{navigator.share && (
					<div className='divider-container'>
						<span className='divider-line'></span>
						<span className='divider-text'>або</span>
						<span className='divider-line'></span>
					</div>
				)}
				{navigator.share && (
					<div className='dropdown-item share' onClick={handleShare}>
						<i className="fa-solid fa-arrow-up-from-bracket"></i>
						<span>Поділитися</span>
					</div>
				)}
			</>
		);
	}, [handleCopy, handleShare]);

	const handleTagClick = useCallback((tag) => {
		if (isUserNews) {
			setSelectedTag([tag]);
		}
	}, [isUserNews, setSelectedTag])

	const onSubscribeButtonClick = useCallback(async (tierId) => {
		window.localStorage.setItem('redirectionToNews', window.location.href);

		window.location.href = `/user/subscription/build/${tierId}`;
	}, [])

	const onVoteClick = useCallback(async (pollOption, voteState) => {
		const resp = await api.onVoteClick({
			postId: post.id,
			checkedValue: pollOption,
			voteState,
		});

		if (resp.success) {
			updatePostVotes(resp.data, post.id);
		}
	}, [post, updatePostVotes]);

	const publishTime = typeof post.publishTime === 'string' ? post.publishTime : moment(post.publishTime).format('DD MMMM, HH:mm');

	return (
		<div className={`card news-feed-card radius animate__animated animate__fadeIn ${(isUserNews || isOpenSeparatePost) ? 'user-news' : ''}`}>
			<div className="news-feed-author-info">
				<img src={subscription?.authorData.photo || user?.photo || replaceImage}
					className="news-feed-author" alt="user"
					onError={(e) =>
						e.target.src = replaceImage
					}
				/>
				<div className="author-name">
					<h5><a href={`${window.location.origin}/${subscription?.authorData.nickName || user.nickname}`} target="_blank" rel="noopener noreferrer">
						{subscription?.authorData.nickName || user.nickname}
					</a></h5>
					<span className="time">{publishTime}</span>
				</div>
			</div>
			{(post.coverImage?.url || (!postAvailable && subscription?.authorData?.pageBgImage)) && (
				<div className={`img-container${!postAvailable ? ' blur' : ''}`}>
					<img
						loading="lazy"
						src={post.coverImage?.url || subscription?.authorData?.pageBgImage}
						alt="rectangle"
						onError={(e) =>
							e.target.src = "/img/cover_donatello_01_960_720.png"
						}
					/>
				</div>
			)}
			{post.tags && post.tags.length > 0 && (
				<div className="tags-container">
					{post.tags.map(tag => (
						<span key={tag} className={`tag ${isUserNews && 'user-news-tag'}`} onClick={() => handleTagClick(tag)}>
							{tag}
						</span>
					))}
				</div>
			)}
			<h4 id={post.id} className={`title ${post.postAvailable && 'post-anchor'} ${isUserNews && 'user-news-title'}`}>
				<a href={getPostUrl()} target="_blank" rel="noopener noreferrer">
					<strong>{post.header}</strong>
				</a>
			</h4>

			{postAvailable ?
				<div className={`${isUserNews ? 'post-description' : ''} ${showAll ? 'show-all' : ''}`}>
					<p dangerouslySetInnerHTML={{ __html: post.description }} />

					{post.attachment && (
						<iframe
							id="ytplayer"
							type="text/html"
							width="100%"
							height="300"
							title="youtube"
							src={`https://www.youtube.com/embed/${youtubeParser(post.attachment)}?autoplay=0&origin=https://donatello.to`}
							frameBorder="0"
						></iframe>
					)}
					{post.postType === PostType.poll && post.userVoted && post.pollOptions.map((poll, i) => getPoll(post, poll, i))}
					{post.postType === PostType.poll && !post.userVoted && showOptions(post)}
					{post.postType === PostType.poll && !post.userVoted && !post.pollCompleted && (
						<button className="btn action-button action-button-black"
							onClick={() => onVoteClick(pollOption, 'vote')}
							disabled={!pollOption}
						>
							<span>Голосувати</span>
						</button>
					)}
					{post.postType === PostType.poll && post.userVoted && post.reVote && !post.pollCompleted && (
						<button className="btn action-button action-button-black"
							onClick={() => { updatePost(post.id); onVoteClick(false, 'reVote') }}
						>
							<span>Переголосувати</span>
						</button>
					)}
				</div>
				:
				<div className="available-by-subscription-container">
					<div className="d-flex align-items-center ps-0">
						<div className="content-type mr-3">
							<i className={post.icon || "fa-solid fa-rss"}></i>
						</div>
						<div className="available-by-subscription ms-3">{post.description}</div>
					</div>
					<div className="d-flex align-items-center justify-content-xs-start justify-content-sm-end px-0">
						<button className="btn btn-primary main-donatello-button" disabled={post.isButtonDisabled} onClick={() => onSubscribeButtonClick(post.tierId)}>{post.buttonName}</button>
					</div>
				</div>
			}

			{(post.description.length > 380 || (post.postType === PostType.poll) || (post.attachment && post.description.length > 0)) && isUserNews && (
			<div className="show-all-button" onClick={() => setShowAll(!showAll)}>
				<span className="mr-2">{!showAll ? 'Читати повністю' : 'Читати менше'}</span>
				<i className={`fa-solid ${showAll ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
			</div>)}

			{showInteractContainer && (
				<div className='d-flex justify-content-between'>
					<button className={`btn btn-like like-container ${post.currentUserLiked}`}
						onClick={() => onLikeClick(post)}
						disabled={!postAvailable}
					>
						<i className="fa-regular fa-heart"></i>
						<span>{post.likes}</span>
					</button>

					{width < 576 ? (
						<div className="share-container" onClick={() => setShowModal(true)}>
							<i className="fa-solid fa-arrow-up-from-bracket"></i>
							<span>Поділитися</span>
						</div>
					) : (
						<div className="dropdown dropup">
							<div className="dropdown-toggle share-container" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								<i className="fa-solid fa-arrow-up-from-bracket"></i>
								<span>Поділитися</span>
							</div>
							<div className="dropdown-menu share">
								{renderItemsShare()}
							</div>
						</div>
					)}
				</div>
			)}

			<ReactModal
				isOpen={showModal}
				onAfterOpen={null}
				onRequestClose={() => setShowModal(false)}
				style={customStyles}
				contentLabel="Share post"
			>
				<div className='share-title-mobile'>
					<span>Поділитися</span>
					<i className="fa-solid fa-xmark" onClick={() => setShowModal(false)}></i>
				</div>
				{renderItemsShare()}
			</ReactModal>
		</div>
	);
};

export default PostPreview;
