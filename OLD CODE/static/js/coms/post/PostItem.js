import slugify from '@sindresorhus/slugify';

import 'react-datepicker/dist/react-datepicker.css';
import {Editor} from '@tinymce/tinymce-react';

import uk from 'date-fns/locale/uk';
import moment from 'moment';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import DatePicker from 'react-datepicker';
import Switch from 'react-switch';
import PostModel, {PostStatus, PostType} from '../../models/PostModel';
import {api} from '../../services/api';
import {messageService} from '../../services/messageService';
import helpers from '../../utils/helpers';
import SelectComponent from '../misc/CustomSelect';

import '../../css/tier.css';
import '../../css/textEditor.css';
import {fileUpload} from '../misc/UploadComponent';
import {Modal} from '../modal/Modal';

const audienceOptions = [
	{ id: 'everyone', label: 'Публічний (усі користувачі)' },
	{ id: 'allSubscribers', label: 'Лише для підписників' },
	{ id: 'separateLevels', label: 'Для окремих рівнів підписки' }
];

const PostItem = ({ post, allTiers, onPostSave, onCancel, allTags, postType, postTypes, onPreview }) => {
	const [formData, setFormData] = useState(post._id ? post : new PostModel({audience: allTiers.length > 0 ? ['allSubscribers'] : ['everyone'] }));
	const [postSeenBy, setPostSeenBy] = useState([]);
	const [postLikedBy, setPostLikedBy] = useState([]);
	const [visible, setModalVisible] = useState(false);
	const [selectedAudience, setSelectedAudience] = useState(
		formData.audience[0] === 'allSubscribers' || formData.audience[0] === 'everyone'
			? formData.audience
			: ['separateLevels']
	);
	const isScheduledPublishTime = moment(post.publishTime).isAfter(moment());
	const [scheduledPublishTime, setScheduledPublishTime] = useState(isScheduledPublishTime);
	const editorRef = useRef(null);
	const audienceValue = audienceOptions.find(option => option.id === selectedAudience[0]);
	const currentPostType = postTypes.find(type => type.id === postType);
	const replaceImage = 'https://donatello.to/img/userpic-placeholder-02.png';
	const newPublishTime =  post.postStatus === PostStatus.draft ? Date.now() : null;

	const getPostDetails = useCallback(async (seen, likes) => {
		const resp = await api.getPostDetails({seen, likes});
		setPostSeenBy(resp.viewers);
		setPostLikedBy(resp.likers);
	}, []);

	useEffect(() => {
		if (post._id) {
			post.tags = post.tags?.join(', ') || '';
			setFormData({ ...post });

			if (post.seen.length > 0 || post.likes.length > 0) {
				getPostDetails(post.seen, post.likes);
			}
		}
	}, [post, getPostDetails]);

	useEffect(() => {
		const initialAudience = formData.audience[0] === 'allSubscribers' || formData.audience[0] === 'everyone'
			? formData.audience
			: ['separateLevels'];
		setSelectedAudience(initialAudience);
	}, [formData.audience]);

	useEffect(() => {
		if (!post._id) {
			setFormData({ ...formData, postType: currentPostType.id })
		}
	}, [post, currentPostType.id]); // eslint-disable-line react-hooks/exhaustive-deps

	const setSelectItem = useCallback((id) => {
		setFormData(prevFormData => ({
			...prevFormData,
			audience: id !== 'separateLevels' ? [id] : [],
		}));
	}, []);

	const postPreview = useCallback(() => {
		const newFormData = { ...formData };

		if (editorRef.current) {
			newFormData.description = editorRef.current.getContent();
		}

		setFormData({ ...newFormData });

		onPreview(newFormData);
	}, [formData, onPreview]);

	const setSelected = useCallback((e, items) => {
		const { fileType, gcName, name, url, id, _id, path } = items.images?.find(el => el.selected);
		const coverImage = { fileType, gcName, name, url: url || path, id: _id || id };

		setFormData({ ...formData, coverImage });
	}, [formData]);

	const onRemoveElement = useCallback(() => {
		const newFormData = { ...formData };

		newFormData.coverImage = {};

		setFormData({ ...newFormData });
	}, [formData]);

	const onTagClick = useCallback((tag) => {
		const newFormData = { ...formData };
		const separator = newFormData.tags.length > 0 ? ', ' : '';

		newFormData.tags = `${newFormData.tags}${separator}${tag}`;

		setFormData({ ...newFormData });
	}, [formData]);

	const onAddClick = useCallback(() => {
		const newFormData = { ...formData };

		if (newFormData.pollOptions && newFormData.pollOptions.length >= 10) {
			messageService.error(`Не більше 10 варіантів`);
			return;
		}

		newFormData.pollOptions.push('');

		setFormData({ ...newFormData });
	}, [formData]);

	const customImageUploader = useCallback((blobInfo) => new Promise((resolve) => {
		setFormData((prevFormData) => {
			const newFormData = { ...prevFormData };
			const attachmentsId = [...newFormData.attachmentsId];

			const e = {
				target: {
					files: [blobInfo.blob()],
					recordType: 'postImage',
				}
			};

			fileUpload(e, 'postData', 'postImage', (_, __, response) => {
				attachmentsId.push(response._id);

				setFormData({ ...newFormData, attachmentsId });
				resolve(response.url);
			});

			return newFormData;
		});
	}), []);


	const onRemoveClick = useCallback((i) => {
		const newFormData = { ...formData };

		newFormData.pollOptions.splice(i, 1);

		if (newFormData.pollOptions.length === 0) {
			newFormData.pollOptions.push('');
		}

		setFormData({ ...newFormData });
	}, [formData]);

	const onChangePoll = useCallback((e, i) => {
		const newFormData = { ...formData };

		newFormData.pollOptions[i] = e.target.value;

		setFormData({ ...newFormData });
	}, [formData]);

	const setPostLabel = useCallback((e) => {
		const value = e.target.value;
		const urlName = slugify(value);

		setFormData({ ...formData, header: value, urlName: urlName });
	}, [formData]);

	const onCheckboxChange = useCallback((e, i) => {
		const newFormData = { ...formData };

		if (e.target.checked) {
			if (e.target.value === 'everyone' || e.target.value === 'allSubscribers') {
				newFormData.audience = [e.target.value];
			} else {
				newFormData.audience.push(e.target.value);
			}
		} else {
			newFormData.audience = newFormData.audience.filter(aud => aud !== e.target.value);
		}

		setFormData({ ...newFormData });
	}, [formData]);

	const postSave = useCallback((e, type, time) => {
		const newFormData = { ...formData };

		newFormData.postStatus = type;

		if (time) {
			newFormData.publishTime = time;
		}

		if (!scheduledPublishTime && isScheduledPublishTime) {
			newFormData.publishTime = Date.now();
		}

		if (editorRef.current) {
			newFormData.description = editorRef.current.getContent();
		}

		if (newFormData.audience.includes('everyone') || newFormData.audience.includes('allSubscribers')) {
			// do nothing - fix later.
		} else {
			const audienceMap = [];

			// clear audience if user remove tier
			allTiers.forEach(tier => {
				newFormData.audience.forEach(audience => {
					if (tier._id === audience) {
						audienceMap.push(audience);
					}
				})
			});

			newFormData.audience = [...audienceMap];
		}

		onPostSave(e, newFormData);
	}, [formData, onPostSave, allTiers, scheduledPublishTime, isScheduledPublishTime]);

	return (
		<div className="create-post">
			<form
				onKeyPress={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
					}
				}}
			>
				<div className='current-post-type'>
					<i className={currentPostType.icon}></i>
					<h5 className='mb-0'>{currentPostType.description}</h5>
				</div>

				{post.postModerationStatus === "blocked" && (
					<div className='post-blocked-by-moderator'>
						<div className='warning'>
							<i className="fa-solid fa-triangle-exclamation text-warning mr-2"></i>
							<span className='text-warning'>Заблоковано модератором</span>
						</div>
						<div className='description'>
							Ви можете відредагувати публікацію і відправити її на перегляд модератору
						</div>
					</div>
				)}

				<div className="form-group row mb-lg-4">
					<label htmlFor="header" className="col-sm-3 col-form-label">Заголовок</label>
					<div className="col-sm-9">
						<input id="header" type="text" className="form-control" required
							onChange={(e) => setPostLabel(e)}
							value={formData.header}
							placeholder='Вкажіть назвy'
						/>
					</div>
				</div>

				<div className="form-group row mb-lg-4">
					<label className="col-sm-3 col-form-label">Опис</label>
					<div className="col-sm-9">
						<Editor
							apiKey="etuu2rb14ou5rdt5glgjh4iikx6xt59z52bwgg80dq3gutjg"
							onInit={(evt, editor) => editorRef.current = editor}
							initialValue={formData.description || ''}
							init={{
								selector: 'textarea#basic-example',
								language: 'uk',
								height: 500,
								images_upload_handler: customImageUploader,
								plugins: [
									'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
									'anchor', 'searchreplace', 'visualblocks', 'fullscreen',
									'insertdatetime', 'media', 'table', 'help', 'wordcount'
								],
								toolbar: 'undo redo | blocks | ' +
									'bold italic image backcolor | alignleft aligncenter ' +
									'alignright alignjustify | bullist numlist outdent indent |' +
									'removeformat | help',
								content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }'
							}}
						/>
					</div>
				</div>

				{(formData.attachment || formData.postType === PostType.video) && (
					<div className="form-group row mb-4">
						<label htmlFor="attachment" className="col-sm-3 col-form-label">YouTube посилання</label>
						<div className="col-sm-9">
							<input id="attachment" type="text" className="form-control"
								onChange={(e) => setFormData({ ...formData, attachment: e.target.value })}
								value={formData.attachment}
								placeholder="https://www.youtube.com/watch..."
							/>
						</div>
					</div>
				)}

				{formData.postType === PostType.poll && (
					<div className="form-group row mb-lg-4 poll">
						<label htmlFor="pollOptions" className="col-sm-3 col-form-label">Варіанти відповіді</label>
						<div className="col-sm-8 col-md-6">
							{formData.userVoted?.length > 0 && (
								<span className="form-text gray-text mb-2">
									Зміна варіантів заборонена, оскільки вже
									проголосувало {formData.userVoted?.length} осіб
								</span>
							)}
							{formData.pollOptions.map((option, i) => (
								<div key={i} className="row mb-2 poll-row">
									<div className="col-10 pr-1">
										<input id="pollOptions" type="text" className="form-control"
											onChange={(e) => onChangePoll(e, i)}
											value={option}
											placeholder={`Варіант ${i + 1}`}
											required
											disabled={formData.userVoted?.length > 0}
										/>
									</div>
									{formData.userVoted?.length === 0 && formData.pollOptions.length > 1 && (
										<div className="col-2 d-flex justify-content-between align-items-center p-0">
											<i className="fas fa-trash-alt" onClick={() => onRemoveClick(i)} />
										</div>
									)}
								</div>
							))}
							<button className='btn btn-outline-dark poll-options-add' type='button'
								disabled={formData.userVoted?.length > 0}
								onClick={onAddClick}
							>
								<span>Додати</span>
								<i className="fa-solid fa-plus"></i>
							</button>
						</div>
					</div>
				)}

				{formData.postType === PostType.poll && (
					<div className="form-group row mb-4">
						<label htmlFor="endTime" className="col-sm-3 col-form-label">Час завершення опитування</label>
						<div className="row" style={{ marginLeft: "15px" }}>
							<DatePicker
								selected={moment(formData.endTime)._d}
								onChange={(endTime) => setFormData({ ...formData, endTime })}
								showTimeSelect
								timeIntervals={15}
								dateFormat="yyyy-MM-dd HH:mm:ss"
								timeFormat="HH:mm"
								className="form-control"
								locale={uk}
							/>
						</div>
					</div>
				)}

				{formData.postType === PostType.poll && (
					<div className="form-group row mb-4">
						<label htmlFor="reVote" className="col-sm-3 col-form-label">
							Дозволити переголосування
						</label>
						<div className="col-sm-4">
							<Switch id="reVote"
								checked={formData.reVote}
								onChange={(reVote) => setFormData({ ...formData, reVote })}
								height={24}
								width={45}
								onColor="#3579F6"
							/>
						</div>
					</div>
				)}

				<div className="form-group row mb-4">
					<label htmlFor="tags" className="col-sm-3 col-form-label">Теги</label>
					<div className="col-sm-9">
						<textarea id="tags" className="form-control"
							value={formData.tags}
							placeholder="Додайте теги починаючи з “#”"
							onChange={(e) => setFormData({ ...formData, tags: e.target.value })} />
						{allTags.length === 0 ? (
							<div className="tags-container form-text">
								<div onClick={() => onTagClick('#огляд')} className="post-tag pointer">#огляд</div>
								<div onClick={() => onTagClick('#розіграш')} className="post-tag pointer">#розіграш</div>
								<div onClick={() => onTagClick('#щось_цікаве')} className="post-tag pointer">#щось_цікаве</div>
							</div>
						) : (
							<div className="tags-container form-text">
								{allTags.map((tag, i) => <div key={i} className="post-tag pointer"
									onClick={() => onTagClick(tag)}>{tag}</div>)}
							</div>
						)}
					</div>
				</div>

				<div className="form-group row mb-4">
					<label htmlFor="coverImage" className="col-sm-3 col-form-label">
						Обкладинка
					</label>

					<div className="col-sm-9">
						{formData.coverImage?.url && (
							<>
								<img id="coverImage" alt={formData.coverImage.name}	src={formData.coverImage.url} className="animation" />
								<div className="delete-item-button">
									<span className='image-name'>{formData.coverImage.name}</span>
									<i className="fas fa-trash-alt" onClick={() => onRemoveElement('coverImage')}></i>
								</div>
							</>
						)}

						<button className='btn btn-dark' type='button' onClick={() => setModalVisible(true)}>Обрати картинку</button>
					</div>
				</div>

				<div className="form-group row mb-4 border-top">
					<label htmlFor="audience" className="col-sm-3 col-form-label">Доступ</label>
					<div className="col-sm-9">

						<SelectComponent
							options={audienceOptions}
							value={audienceValue}
							setSelectItem={setSelectItem}
						/>

						{selectedAudience.includes('separateLevels') && (
							<div>
								{allTiers.map(item => (
									<div key={item._id} className="form-check tier-item">
										<input
											className="form-check-input"
											type="checkbox"
											value={item._id}
											id={item._id}
											onChange={e => onCheckboxChange(e)}
											checked={formData.audience.includes(item._id)}
										/>
										<label className="form-check-label" htmlFor={item._id}>
											{item.tierName}
										</label>
									</div>
								))}
							</div>
						)}

						{selectedAudience.includes('everyone') && <span className="form-text gray-text mt-2">
							Ваш пост будуть бачити всі, хто відвідує вашу сторінку на Donatello
						</span>}
						{selectedAudience.includes('allSubscribers') && <span className="form-text gray-text mt-2">
							Ваш пост будуть бачити лише ваші підписники
						</span>}
					</div>
				</div>

				<div className="form-group row mb-4">
					<label htmlFor="publishTime" className="col-sm-3 col-form-label">Дата та час публікації</label>
					<div className="col-sm-9">
						<div className='d-flex justify-content-between pt-2'>
							<span className='gray-text mr-3'>Тут ви можете запланувати дату та час коли б ви хотіли опублікувати пост</span>
							<Switch
								id="scheduledPublishTime"
								className="mt-1"
								onChange={(checked) => setScheduledPublishTime(checked)}
								checked={scheduledPublishTime}
								height={24}
								width={45}
								onColor="#3579F6"
							/>
						</div>

						{scheduledPublishTime && (
							<div>
								<DatePicker
									selected={moment(formData.publishTime)._d}
									onChange={(publishTime) => setFormData({ ...formData, publishTime: publishTime || formData.publishTime })}
									showTimeSelect
									timeIntervals={15}
									dateFormat="yyyy-MM-dd HH:mm:ss"
									timeFormat="HH:mm"
									className="form-control w-auto mt-2"
									locale={uk}
								/>
							</div>
						)}
					</div>
				</div>

				{formData._id && (
					<div className="form-group row mb-4">
						<label htmlFor="postUrl" className="col-sm-3 col-form-label">
							Посилання на публікацію
						</label>
						<div className="col-sm-9">
							<div className='link-to-post'>
								<input id="postUrl" type="text" className="form-control"
									value={formData._id ? helpers.buildPostPageUrl(formData._id, formData.urlName) : ''} readOnly />

								<i className="far fa-copy" data-toggle="tooltip" data-placement="top" title="Скопіювати посилання"
									onClick={() => formData._id && helpers.copyText(helpers.buildPostPageUrl(formData._id, formData.urlName))} />
							</div>
						</div>
					</div>
				)}

				{post._id && (
					<div className="form-group row mb-4 border-top">
						<label htmlFor="postUrl" className="col-sm-3 col-form-label">
							Перегляди
						</label>
						<div className="col-sm-9 post-actions pt-2">
							<div className='d-flex align-items-center overflow-auto'>
								<i className="fas fa-eye mr-2" title="Переглянуто"></i>
								<span>{formData.seen.length}</span>
								{postSeenBy.map((viewer, i) => (
									<div key={i} className="d-flex align-items-center ml-2">
										<img className="subscriber-image" alt="user-avatar"
											src={viewer.photo || replaceImage}
											onError={() => replaceImage}></img>
										<span>{viewer.clientName}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				{post._id && (
					<div className="form-group row mb-4">
						<label htmlFor="postUrl" className="col-sm-3 col-form-label">
							Вподобання
						</label>
						<div className="col-sm-9 post-actions pt-2">
							<div className='d-flex align-items-center overflow-auto'>
								<i className="fa-regular fa-heart mr-2" title="Вподобано"></i>
								<span>{formData.likes.length}</span>
								{postLikedBy.map((viewer, i) => (
									<div key={i} className="d-flex align-items-center ml-2">
										<img className="subscriber-image" alt="user-avatar"
											src={viewer.photo || replaceImage}
											onError={() => replaceImage}></img>
										<span>{viewer.clientName}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				<div className="form-group row mb-lg-4 border-top">
					<div className="col-sm-12 d-flex justify-content-between action-buttons">
						<button className="btn btn-outline-dark mr-3" onClick={onCancel}>
							Скасувати
						</button>

						<div className="btn-group dropup">
							<button type="button" className="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								Опублікувати
							</button>
							<div className="dropdown-menu dropdown-menu-right">
								<div className="dropdown-item" onClick={(e) => postSave(e, PostStatus.active, newPublishTime)}>
									<div className='icon'>
										{scheduledPublishTime ? (
											<i className="fa-regular fa-calendar"></i>
										) : (
											<i className="fa-solid fa-location-arrow"></i>
										)}
									</div>
									{post.postModerationStatus === "blocked" ? (
										<span>Відправити на модерацію</span>
									) : (
										scheduledPublishTime ? (
											<span>Опублікувати в обраний час</span>
										) : (
											<span>Опублікувати зараз</span>
										)
									)}
								</div>
								<div className="dropdown-item" onClick={() => postPreview(formData)}>
									<div className='icon'>
										<i className="fa-regular fa-eye"></i>
									</div>
									<span>Попередній перегляд</span>
								</div>
								{post.postModerationStatus !== "blocked" && (
									<div className="dropdown-item" onClick={(e) => postSave(e, PostStatus.draft, false)}>
										<div className='icon'>
											<i className="fa-solid fa-file-arrow-down"></i>
										</div>
										<span>Зберегти чернетку</span>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</form>

			{visible && (
				<Modal
					isOpen={visible}
					toggleModal={() => setModalVisible(false)}
					multiselect={false}
					userFileType={'subscription'}
					rowOpened="images"
					saveSelectedMedia={(e, items) => {
						setSelected(e, items);
						setModalVisible(false);
					}}
					selectedItems={{ images: [formData.coverImage?.id || null] }}
				/>
			)}
		</div>
	);
};

export default PostItem;
