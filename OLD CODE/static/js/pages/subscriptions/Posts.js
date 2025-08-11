import moment from 'moment';
import 'moment/locale/uk';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import ReactModal from 'react-modal';
import {connect} from 'react-redux';
import PageNavigationTabs from '../../coms/misc/PageNavigationTabs';

import PostItem from '../../coms/post/PostItem';
import PostPreview from '../../coms/post/PostPreview';

import {PostStatus, PostType} from '../../models/PostModel';
import {api} from '../../services/api';
import {messageService} from '../../services/messageService';
import {confirmRemoveModal} from '../../utils/confirmRemoveModal';
import helpers from '../../utils/helpers';

import '../../css/posts.css';

const whatsNewModalStyles = {
	content: {
		top: '50px',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		borderRadius: '15px',
		transform: 'translate(-50%, 0%)',
		zIndex: '99',
		height: '90%'
	}
};

const publishPostModalStyles = {
	content: {
		top: '30%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		borderRadius: '15px',
		transform: 'translate(-50%, 0%)',
		padding: '30px 40px 48px 40px',
		width: '100%',
		maxWidth: '550px',
		zIndex: '99'
	}
};

const IconType = {
	video: 'fa-solid fa-video',
	audio: 'fa-solid fa-headphones',
	blog: 'fa-solid fa-pen',
	image: 'fa-regular fa-image',
	poll: 'fa-solid fa-square-poll-horizontal',
};

const postTypes = [
	{
		id: 'blog',
		description: 'Пост для блогу',
		icon: 'fa-solid fa-pen'
	},
	{
		id: 'video',
		description: 'Відео',
		icon: 'fa-solid fa-video'
	},
	{
		id: 'poll',
		description: 'Голосування',
		icon: 'fa-solid fa-bars-progress'
	}
];

const tabs = [
	{
		id: 1,
		route: 'publications',
		title: 'Публікації'
	}, {
		id: 2,
		route: 'drafts',
		title: 'Чернетки'
	},
	{
		id: 3,
		route: 'blocked',
		title: 'Заблоковані'
	}
];

const POSTS_PER_PAGE = 20;

ReactModal.setAppElement('#root');

const Posts = ({ nickname, photo }) => {
	const [allTiers, setAllTiers] = useState([]);
	const [allPosts, setAllPosts] = useState([]);
	const [allTags, setAllTags] = useState([]);
	const [currentPost, setCurrentPost] = useState({});
	const [previewPost, setPreviewPost] = useState({});
	const [onCreate, setOnCreate] = useState(false);
	const [isModalVisible, setModalVisible] = useState(false);
	const [isModalOpen, toggleModalOpen] = useState(false);
	const [isPublishPostModalVisible, setPublishPostModalVisible] = useState(false);
	const [itemToRemove, setItemToRemove] = useState(null);
	const [activeTab, setActiveTab] = useState(tabs[0].id);
	const [postType, setPostType] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = POSTS_PER_PAGE;

	const sortPosts = useCallback(async (postRecords) => {
		postRecords.sort((a, b) => {
			if (moment(a.publishTime).isAfter(b.publishTime)) {
				return -1;
			}
			if (moment(a.publishTime).isBefore(b.publishTime)) {
				return 1;
			}
			return 0;
		});

		let allTags = [];

		postRecords.forEach(post => {
			allTags.push(...post.tags)
		})

		allTags = new Set(allTags);

		setAllTags([...allTags]);
		setAllPosts([...postRecords]);
	}, [])

	const getAllPosts = useCallback(async () => {
		const data = await api.getAllUserPosts();

		sortPosts(data.postRecords);
		setAllTiers([...data.tierRecords]);
	}, [sortPosts]);

	useEffect(() => {
		getAllPosts();
	}, [getAllPosts])

	const onAdd = useCallback((type) => {
		setPostType(type);
		setCurrentPost({});
		setOnCreate(true);
	}, []);

	const onCancel = useCallback(() => {
		setCurrentPost({});
		setOnCreate(false);
	}, []);

	const onPostSave = useCallback(async (e, postData) => {
		e.preventDefault();

		if (postData.tags.length > 0) {
			postData.tags = postData.tags.split(', ');
			postData.tags = [...new Set(postData.tags)];
		} else {
			postData.tags = [];
		}

		const data = await api.saveUserPost(postData);

		if (!data.success) {
			messageService.success(data.message || 'Ой, щось пішло не так');
			return;
		}

		setOnCreate(false);
		sortPosts(data.postRecords);

		const currentPost = data.postRecords.find(post => post.urlName === postData.urlName);

		if (postData.postStatus === PostStatus.active) {
			setCurrentPost({...currentPost});
			setPublishPostModalVisible(true);
		} else {
			setCurrentPost({});
		}

		messageService.success('Збережено');
	}, [sortPosts]);

	const onEdit = useCallback((item) => {
		if (item.attachment) {
			setPostType('video');
		} else {
			setPostType(item.postType);
		}

		setCurrentPost({ ...item });
		setOnCreate(true);
	}, []);

	const onPreview = useCallback((item) => {
		let tags = item.tags;

		if (typeof tags === 'string') {
			tags = tags.split(', ').map(tag => tag.trim());
		}

		const updatedItem = { ...item, tags };
		setPreviewPost(updatedItem);
		setModalVisible(true);
	}, []);

	const onDelete = useCallback(async (postId) => {
		const data = await api.removeUserPost(postId);
		sortPosts(data.postRecords);

		messageService.success('Видалено');
		toggleModalOpen(false);
	}, [sortPosts]);

	const onPaused = useCallback((e, item) => {
		const newPostStatus = item.postStatus === PostStatus.active ? PostStatus.paused : PostStatus.active;
		const joinedTags = item.tags.join(', ');
		const updatedPost = { ...item, postStatus: newPostStatus, tags: joinedTags };

		onPostSave(e, updatedPost);
	}, [onPostSave]);

	const getEndTime = useCallback((item) => {
		if (item.postType !== PostType.poll) return;
		let endTime = 'Завершено';
		let remark = '';
		let highestAmount = 0;

		if (moment(item.endTime).isAfter(moment())) {
			endTime = 'Триває до: ' + moment(item.endTime).format('DD.MM.YYYY, HH:mm');
		} else {
			item.pollOptions.forEach(poll => {
				if (item.optionMap?.[poll]?.length > highestAmount) {
					highestAmount = item.optionMap?.[poll].length;
					remark = poll;
				}
			})

			if (remark) {
				remark = ` - ${remark} (${highestAmount} голосів)`;
			}
		}

		return endTime + remark;
	}, []);

	const getBadge = useCallback((item) => {
		let reason = '';
		let color = '';
		if (moment(item.publishTime).isAfter(moment())) {
			reason = 'Заплановано на';
			color = 'scheduled';
		}

		if (item.postStatus === PostStatus.paused) {
			reason = 'Деактивовано';
			color = 'paused';
		}

		if (item.postStatus === PostStatus.draft) {
			reason = 'Чернетка';
			color = 'paused';
		}

		if (item.postModerationStatus === "blocked") {
			reason = 'Заблоковано модератором';
			color = 'paused';
		}

		return (
			<div className={`post-date ${color}`}>
				<span className="mr-1">{reason ? reason : 'Опубліковано'}</span>
				{(item.postStatus === PostStatus.active && item.postModerationStatus !== "blocked") && (
					<span className="">{moment(item.publishTime).format('DD.MM.YYYY, HH:mm')}</span>
				)}
			</div>
		)
	}, []);

	const activePosts = useMemo(() => allPosts.filter(post => post.postStatus !== PostStatus.draft && post.postModerationStatus !== "blocked"), [allPosts]);
	const draftPosts = useMemo(() => allPosts.filter(post => post.postStatus === PostStatus.draft && post.postModerationStatus !== "blocked"), [allPosts]);
	const blockedPosts = useMemo(() => allPosts.filter(post => post.postModerationStatus === "blocked"), [allPosts]);

	const totalPages = Math.ceil(activePosts.length / postsPerPage);

	const paginatedPosts = useMemo(() => {
		const startIndex = (currentPage - 1) * postsPerPage;
		const endIndex = startIndex + postsPerPage;

		return activePosts.slice(startIndex, endIndex);
	}, [activePosts, currentPage, postsPerPage]);

	const changePage = useCallback((pageNumber) => {
		setCurrentPage(pageNumber);
	}, []);

	const GetPosts = ({ allPosts, onPreview, onEdit, onPaused, toggleModalOpen, setItemToRemove, IconType, PostType, getEndTime, getBadge }) => {
		const memoizedPosts = useMemo(() => {
			return allPosts.map((item, index) => (
				<div key={item._id} className="post-item">
					<div className='post-type-icon'>
						<i className={IconType[item.attachment ? PostType.video : item.postType]}></i>
					</div>
					<div className='post-actions-buttons'>
						<div className='action-button pointer'>
							<i className="fa-solid fa-magnifying-glass" title="Переглянути" onClick={() => onPreview(item, index)}></i>
						</div>

						<div className="dropdown action-button ml-1">
							<div className="dropdown-toggle pointer" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								<i className="fa-solid fa-ellipsis"></i>
							</div>
							<div className="dropdown-menu dropdown-menu-right">
								<div className="dropdown-item" onClick={() => onEdit(item)}>
									<div className='icon'>
										<i className="fa-regular fa-pen-to-square"></i>
									</div>
									<span>Редагувати</span>
								</div>

								{(item.postStatus !== PostStatus.draft && item.postModerationStatus !== "blocked" && !moment(item.publishTime).isAfter(moment())) && (
									<div id='onPaused' className='dropdown-item' onClick={(e) => onPaused(e, item)}>
										<div className='icon'>
											<i className={`fa-regular ${item.postStatus === 'active' ? 'fa-eye-slash' : 'fa-eye'}`}></i>
										</div>
										<span>{item.postStatus === 'active' ? 'Деактивувати' : 'Активувати'}</span>
									</div>
								)}

								{item.postModerationStatus !== "blocked" && (
									<div className='dropdown-item'
										onClick={() => {
											toggleModalOpen(true);
											setItemToRemove(item._id);
										}}
									>
										<div className='icon'>
											<i className="fas fa-trash-alt"></i>
										</div>
										<span>Видалити</span>
									</div>
								)}
							</div>
						</div>
					</div>
					<div className="post-item-container">
						{item.coverImage?.url ? (
							<div className="post-image">
								<img src={item.coverImage?.url} alt="coverImage" />
								{item.postType === PostType.poll && <div className='poll-end-time'>
									{getEndTime(item)}
								</div>}
							</div>
						) : (
							<div className='no-post-image'>
								<i className="fa-regular fa-image"></i>
								{item.postType === PostType.poll && <div className='poll-end-time'>
									{getEndTime(item)}
								</div>}
							</div>
						)}
						<div className='post-description-container'>
							{getBadge(item)}

							<h5>{item.header}</h5>

							<div className='post-description'>
								{item.description.replace(/<\/?[^>]+(>|$)/g, "")}
							</div>

							<div className='post-tags'>
								<div className='d-flex flex-wrap'>
									{item.tags && item.tags.map((tag, i) => (
										<div key={i} className='post-tag'>{tag}</div>
									))}
								</div>
								<div className='post-actions d-flex'>
									<div className='d-flex mr-3'>
										<i className="fa-regular fa-heart mr-2" title="Вподобано"></i>
										<span>{item.likes.length}</span>
									</div>
									<div className='d-flex'>
										<i className="fas fa-eye mr-2" title="Переглянуто"></i>
										<span>{item.seen.length}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			));
		}, [allPosts, onPreview, onEdit, onPaused, toggleModalOpen, setItemToRemove, IconType, PostType, getEndTime, getBadge]);

		return <>{memoizedPosts}</>;
	};

	const handleButtonClick = useCallback(() => {
		setActiveTab(tabs[0].id)
		setPublishPostModalVisible(false);
	}, []);

	const renderPublishPostModal = useCallback(() => {
		return (
			<div className='publish-post-modal'>
				<i className="fa-solid fa-xmark close-modal"
					onClick={() => {
						setPublishPostModalVisible(false);
						setCurrentPost({});
					}}></i>
				<div className='text-center'>
					<i className={`fa-regular ${moment(currentPost.publishTime).isAfter(moment()) ? 'fa-calendar' : 'fa-circle-check'} icon`}></i>
				</div>
				<h5>{moment(currentPost.publishTime).isAfter(moment()) ? "Публікацію заплановано" : "Опубліковано!"}</h5>
				{moment(currentPost.publishTime).isAfter(moment()) && (
					<div className='scheduled-time'>
						Ваша публікація буде опублікована {moment(currentPost.publishTime).format('DD.MM.YYYY, HH:mm')}. Ви можете відредагувати дату та час за потреби.
					</div>
				)}
				<div className='share-post'>
					{moment(currentPost.publishTime).isAfter(moment()) ? (
						"Посилання буде активним після публікування, його можна також знайти в налаштуваннях публікації."
					) : (
						"Поділіться публікацією з підписниками. Посилання можна також знайти в налаштуваннях публікації"
					)}
				</div>
				<div className='post-url'>
					<input className='form-control' type="text"
						value={helpers.buildPostPageUrl(currentPost._id, currentPost.urlName)} readOnly></input>
					<i className="far fa-copy icon mb-0 ml-2" title="Скопіювати посилання"
						onClick={() => helpers.copyText(helpers.buildPostPageUrl(currentPost._id, currentPost.urlName))}></i>
				</div>
				<div className='text-center'>
					<button className='btn btn-dark' onClick={handleButtonClick}>До публікацій</button>
				</div>
			</div>
		);
	}, [currentPost, handleButtonClick]);

	return (
		<div className='posts'>
			{!onCreate && (
				<div className='posts-wrapper'>
					<div className='post-type'>
						<h5>Створити публікацію</h5>
						<div className='row'>
							{postTypes.map((postType) => (
								<div key={postType.id} className='col-12 col-md-4'>
									<div className='post-create-btn' onClick={() => onAdd(postType.id)}>
										<i className={postType.icon}></i>
										<span>{postType.description}</span>
									</div>
								</div>
							))}
						</div>
					</div>

					<PageNavigationTabs
						tabs={tabs}
						activeTab={activeTab}
						setActiveTab={setActiveTab}
						urlPath='posts'
					/>

					{activeTab === 1 && !onCreate && (
						<>
							{allPosts.length !== 0 ? (
								<GetPosts
									allPosts={paginatedPosts}
									onPreview={onPreview}
									onEdit={onEdit}
									onPaused={onPaused}
									toggleModalOpen={toggleModalOpen}
									setItemToRemove={setItemToRemove}
									IconType={IconType}
									PostType={PostType}
									getEndTime={getEndTime}
									getBadge={getBadge}
								/>
							) : (
								<div className='no-posts'>
									<i className='fa-regular fa-file-lines'></i>
									<h5 className='text-center my-3'><strong>У вас ще немає публікацій</strong></h5>
									<span>Створіть свою першу публікацію та розкажіть підписникам чим ви займаєтесь</span>
								</div>
							)}
						</>
					)}

					{activeTab === 2 && !onCreate &&
						<GetPosts
							allPosts={draftPosts}
							onPreview={onPreview}
							onEdit={onEdit}
							onPaused={onPaused}
							toggleModalOpen={toggleModalOpen}
							setItemToRemove={setItemToRemove}
							IconType={IconType}
							PostType={PostType}
							getEndTime={getEndTime}
							getBadge={getBadge}
						/>
					}

					{activeTab === 3 && !onCreate &&
						<GetPosts
							allPosts={blockedPosts}
							onPreview={onPreview}
							onEdit={onEdit}
							onPaused={onPaused}
							toggleModalOpen={toggleModalOpen}
							setItemToRemove={setItemToRemove}
							IconType={IconType}
							PostType={PostType}
							getEndTime={getEndTime}
							getBadge={getBadge}
						/>
					}

					{activeTab === 1 && totalPages > 1 && (
						<div className='pagination'>
						{[...Array(totalPages)].map((_, i) => (
							<button
								key={i + 1}
								onClick={() => changePage(i + 1)}
								className={`btn page-button ${currentPage === i + 1 ? 'active' : ''}`}
							>
								{i + 1}
							</button>
						))}
						</div>
					)}
				</div>
			)}

			{confirmRemoveModal({
				confirm: () => onDelete(itemToRemove),
				cancel: () => toggleModalOpen(false),
				title: 'Видалити публікацію',
				text: 'Публікацію не можна відновити після видалення',
				isModalOpen
			})}

			{onCreate && (
				<PostItem
					post={currentPost}
					allTiers={allTiers}
					onPostSave={onPostSave}
					onCancel={onCancel}
					allTags={allTags}
					postType={postType}
					postTypes={postTypes}
					onPreview={onPreview}
				/>
			)}

			<ReactModal
				isOpen={isModalVisible}
				onRequestClose={() => setModalVisible(false)}
				style={whatsNewModalStyles}
				contentLabel="Post Preview"
			>
				<PostPreview post={previewPost} user={{ nickname, photo }} postAvailable={true} showInteractContainer={false} />
			</ReactModal>

			<ReactModal
				isOpen={isPublishPostModalVisible}
				onRequestClose={() => {
					setPublishPostModalVisible(false);
					setCurrentPost({});
				}}
				style={publishPostModalStyles}
				contentLabel="Publish post"
			>
				{isPublishPostModalVisible && renderPublishPostModal()}
			</ReactModal>
		</div>
	)
}

function mapStateToProps(state) {
	const { nickname, photo } = state.config;

	return { nickname, photo };
}

export default connect(mapStateToProps)(Posts);
