import React, {useCallback, useEffect, useMemo, useState} from 'react';
import ReactModal from 'react-modal';
import SelectComponent from '../../coms/misc/CustomSelect';
import PostPreview from '../../coms/post/PostPreview';
import {api} from '../../services/api';
import {messageService} from '../../services/messageService';

const NUM_POSTS_TO_SHOW = 4;

const customStyles = {
	content: {
		top: '0',
		left: 'auto',
		right: '0',
		bottom: 'auto',
		padding: '32px',
		borderRadius: '20px 0 0 20px',
		width: '438px',
		height: '100%',
		zIndex: '99',
	}
};

const sortItems = [
	{
		label: 'Спочатку нові',
		id: 'newest'
	},
	{
		label: 'Спочатку старі',
		id: 'oldest'
	},
	{
		label: 'Популярні',
		id: 'popular'
	}
];

const replaceImage = 'https://donatello.to/img/userpic-placeholder-02.png';

const UserNews = () => {
	const [posts, setPosts] = useState([]);
	const [sortingOption, setSortingOption] = useState('newest');
	const [selectedTag, setSelectedTag] = useState([]);
	const [selectedUsers, setSelectedUsers] = useState([]);
	const [selectedSubscription, setSelectedSubscription] = useState(false);
	const [numPostsToShow, setNumPostsToShow] = useState(NUM_POSTS_TO_SHOW);
	const [showModal, setShowModal] = useState(false);
	const [allSubscriptions, setAllSubscriptions] = useState([]);
	const [mySubscriptions, setMySubscriptions] = useState([]);
	const [uniqueAuthorUserIds, setUniqueAuthorUserIds] = useState([]);
	const [filteredPosts, setFilteredPosts] = useState([]);

	const getPosts = useCallback(async () => {
		try {
			const data = await api.getAllActivePostsForUserNews();

			if (data) {
				setAllSubscriptions(data.allAuthors);
				setMySubscriptions(data.mySubscriptions);
				setPosts(data.postRecords);
			} else {
				console.log('No data received from the API');
			}
		} catch (error) {
			console.error('Error fetching posts:', error);
		}
	}, [setPosts]);

	const markPostAsViewed = useCallback(async (postId) => {
		await api.setPostSeen({ postId });
	}, []);

	const observer = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const postId = entry.target.id;
				const post = posts.find(post => post.id === postId);

				if (post && post.seen.includes(post.viewerId)) {
					observer.unobserve(entry.target);
					return;
				}

				markPostAsViewed(postId);
				observer.unobserve(entry.target);
			}
		});
	}, { threshold: 0.75, delay: 7000 });

	const observePostPreviews = useCallback(() => {
		const postPreviews = document.querySelectorAll('.post-anchor');
		postPreviews.forEach(postPreview => {
			observer.observe(postPreview);
		});
	}, [observer]);

	useEffect(() => {
		observePostPreviews();
		return () => {
			observer.disconnect();
		};
	}, [observePostPreviews, observer]);

	useEffect(() => {
		getPosts();
	}, [getPosts]);

	useEffect(() => {
		const uniqueIds = new Set();

		allSubscriptions.forEach(item => {
			uniqueIds.add(item.authorData.authorUserId);
		});

		setUniqueAuthorUserIds(Array.from(uniqueIds));
	}, [allSubscriptions]);

	useEffect(() => {
		setFilteredPosts(posts);
	}, [posts, uniqueAuthorUserIds]);

	const filterPosts = useCallback(() => {
		let filtered = filteredPosts;

		if (selectedTag.length > 0) {
			filtered = filtered.filter((post) => {
				return selectedTag.some((tag) => post.tags.includes(tag));
			});
		}

		if (selectedSubscription) {
			filtered = filtered.filter((post) => mySubscriptions.includes(post.authorId));
		}

		if (selectedUsers.length > 0) {
			filtered = filtered.filter((post) => selectedUsers.includes(post.authorId));
		}

		if (sortingOption === 'newest') {
			filtered = filtered.sort((a, b) => new Date(b.publishTimeUnix) - new Date(a.publishTimeUnix));
		} else if (sortingOption === 'oldest') {
			filtered = filtered.sort((a, b) => new Date(a.publishTimeUnix) - new Date(b.publishTimeUnix));
		} else if (sortingOption === 'popular') {
			filtered = filtered.sort((a, b) => b.likes - a.likes);
		}

		return filtered;
	}, [filteredPosts, selectedTag, selectedUsers, sortingOption, mySubscriptions, selectedSubscription]);

	const sortedAndFilteredPosts = useMemo(() => filterPosts(), [filterPosts]);

	const setSelectItem = useCallback((id) => {
		setSortingOption(id);
	}, []);

	const loadMorePosts = useCallback(() => {
		setNumPostsToShow(prevNumPostsToShow => prevNumPostsToShow + NUM_POSTS_TO_SHOW);
	}, []);

	const memoizedTags = useMemo(() => {
		const uniqueTags = new Set();

		filteredPosts.forEach(post => {
			post.tags.forEach(tag => {
				uniqueTags.add(tag);
			});
		});

		return [...uniqueTags];
	}, [filteredPosts]);

	const memoizedAuthors = useMemo(() => {
		const uniqueAuthorData = new Set();
		const result = allSubscriptions.filter(item => {
			if (!uniqueAuthorData.has(item.authorData.authorUserId)) {
				uniqueAuthorData.add(item.authorData.authorUserId);
				return true;
			}
			return false;
		});

		return [...result]
	}, [allSubscriptions]);

	const updatePostLikes = useCallback((isLiked, postId) => {
		filteredPosts.forEach(post => {
			if (post.id === postId) {
				if (!isLiked) {
					post.likes = post.likes + 1;
					post.currentUserLiked = 'liked';
					messageService.success('Вподобано');
				} else {
					post.likes = post.likes - 1;
					post.currentUserLiked = '';
				}
			}
			return post;
		})

		setFilteredPosts([...filteredPosts]);
	}, [filteredPosts])

	const updatePostVotes = useCallback((data, postId) => {
		filteredPosts.forEach(post => {
			if (post.id === postId) {
				post.pollOptions.forEach(option => {
					let counter = data.optionMap?.[option].length || 0;

					if (post?.pollData?.[option]) {
						post.pollData[option].width = ((counter || 0) * 100) / data.votes || 0;
						post.pollData[option].counter = counter;
					}
				})

				post.votes = data.votes;
				post.userVoted = false;

				if (post.pollOptions.includes(data.userOptionSelected)) {
					post.userVoted = true;
					post.userOptionSelected = data.userOptionSelected;
				}
			}
			return post;
		})

		setFilteredPosts([...filteredPosts]);
	}, [filteredPosts])

	const updatePost = useCallback((postId) => {
		filteredPosts.forEach(post => {
			if (post.id === postId) {
				post.userVoted = false;
			}
			return post;
		})

		setFilteredPosts([...filteredPosts]);
	}, [filteredPosts])

	const deleteTag = useCallback((tag) => {
		const selectedTagAfterDelete = selectedTag.filter((item) => item !== tag);
		setSelectedTag(selectedTagAfterDelete);
	}, [selectedTag]);

	const renderSelectedTag = useCallback(() => {
		return (
			<div className='d-flex mb-3 flex-wrap'>
				{selectedTag.map((tag, index) => (
					<div key={index} className='badge badge-dark d-flex align-items-center mr-2 mb-2 animate__animated animate__fadeIn'>
						{tag}
						<i className="fa-solid fa-xmark news-filter-delete-tag" onClick={() => deleteTag(tag)}></i>
					</div>
				))}
			</div>
		)
	}, [selectedTag, deleteTag])

	const renderFilters = useCallback(() => {
		const handleTagChange = (e) => {
			const tag = e.target.value;
			setSelectedTag((prevSelectedTag) => [...prevSelectedTag, tag]);
		};

		const handleUserCheckboxChange = (e) => {
			const userId = e.target.id;
			if (e.target.checked) {
				setSelectedUsers((prevSelectedUsers) => [...prevSelectedUsers, userId]);
			} else {
				setSelectedUsers((prevSelectedUsers) =>
					prevSelectedUsers.filter((user) => user !== userId)
				);
			}
		};

		const handleFilterSubmit = (e) => {
			e.preventDefault();
			filterPosts();
			setShowModal(false);
		};

		const handleFilterReset = () => {
			setSelectedTag([]);
			setSelectedUsers([]);
			setSelectedSubscription(false);
			setShowModal(false);
		};

		return (
			<form className='news-filter' onSubmit={(e) => handleFilterSubmit(e)}>
				<div className='overflow-auto'>
					<div className="form-group">
						<label className="label-class" htmlFor="tagSelect">Теги</label>
						<select
							className="form-control"
							id="tagSelect"
							value={selectedTag}
							onChange={handleTagChange}
						>
							<option value="">Оберіть теги ...</option>
							{memoizedTags.map((tag, index) => {
								if (!selectedTag.includes(tag)) {
									return (
										<option key={index} value={tag}>
											{tag}
										</option>
									)
								}
								return null;
							})};
						</select>
					</div>

					{renderSelectedTag()}

					<label className="label-class">Мої підписки</label>
					<div className="form-check news-filter-author news-filter-subscription">
						<input
							type="checkbox"
							className="form-check-input news-filter-checkbox"
							id="news-filter-subscription"
							checked={selectedSubscription}
							onChange={(e) => setSelectedSubscription(e.target.checked)}
						/>
						<label className="ml-3 mb-0 news-filter-author-info" htmlFor="news-filter-subscription">
							Тільки мої підписки
						</label>
					</div>

					<label className="label-class">Автори</label>
					{memoizedAuthors.map(author => (
						<div key={author.authorData.authorUserId} className="form-check news-filter-author">
							<input
								type="checkbox"
								className="form-check-input news-filter-checkbox"
								id={author.authorData.authorUserId}
								checked={selectedUsers.includes(author.authorData.authorUserId)}
								onChange={handleUserCheckboxChange}
							/>
							<label htmlFor={author.authorData.authorUserId} className="mb-0 news-filter-author-info">
								<img src={author.authorData.photo}
									alt="user-avatar"
									onError={(e) =>
										e.target.src = replaceImage
									}
								/>
								{author.authorData.nickName}
							</label>
						</div>
					))}
				</div>

				<div className='news-filter-buttons d-flex justify-content-between pt-4'>
					<button type="button" className="btn btn-light" onClick={handleFilterReset}>
						Скинути фільтри
					</button>

					<button type="submit" className="btn btn-primary">
						Фільтрувати
					</button>
				</div>
			</form>
		);
	}, [memoizedTags, memoizedAuthors, selectedTag, selectedUsers, filterPosts, renderSelectedTag, selectedSubscription]);

	const isFiltered = selectedTag.length !== 0 || selectedUsers.length !== 0 || selectedSubscription;

	return (
		<div className='news-feed-wrapper'>
			<div className="form-group d-flex justify-content-between">
				<button
					type='button'
					className='btn btn-light'
					onClick={() => setShowModal(true)}
				>
					<span className='position-relative'>
						<i className="fa-solid fa-bars mr-2"></i>
						{isFiltered && <span className="filter-notification"></span>}
					</span>
					Фільтри
				</button>

				<SelectComponent
					options={sortItems}
					value={sortItems.find((item) => item.id === sortingOption)}
					setSelectItem={setSelectItem}
				/>
			</div>

			{renderSelectedTag()}

			<div className="news-feed-container">
				{sortedAndFilteredPosts
					.slice(0, numPostsToShow)
					.map(post => (
						<PostPreview
							key={post.id}
							post={post}
							subscription={allSubscriptions.find(item => item.authorData.authorUserId === post.authorId)}
							isUserNews={true}
							postAvailable={post.postAvailable}
							showInteractContainer={true}
							setSelectedTag={setSelectedTag}
							updatePostLikes={updatePostLikes}
							updatePostVotes={updatePostVotes}
							updatePost={updatePost}
						/>
					))
				}

				{numPostsToShow < sortedAndFilteredPosts.length && (
					<div
						className="show-more-posts-button d-flex justify-content-center align-items-baseline mt-0"
						onClick={loadMorePosts}
					>
						<span className='mr-2'>Більше</span>
						<i className='fa-solid fa-chevron-down'></i>
					</div>
				)}
			</div>

			<ReactModal
				isOpen={showModal}
				onAfterOpen={null}
				onRequestClose={() => setShowModal(false)}
				style={customStyles}
				contentLabel="Filter options"
			>
				<div className='filter-news-title'>
					<span>Фільтри</span>
					<i className="fa-solid fa-xmark" onClick={() => setShowModal(false)}></i>
				</div>
				{renderFilters()}
			</ReactModal>

		</div>
	);
};

export default UserNews;
