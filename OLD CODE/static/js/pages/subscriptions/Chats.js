import React, {useCallback, useEffect, useState} from 'react';
import EmojiPicker from '../../coms/misc/EmojiPicker';
import UserMessages from '../../coms/user/UserMessages';
import AuthorsToModerateContainer from '../../coms/misc/AuthorsToModerateContainer';
import {useWindowDimensions} from '../../hooks/useWindowDimensions';
import {api} from '../../services/api';
import helpers from '../../utils/helpers';

import '../../css/messages.css';

const replaceImage = 'https://donatello.to/img/userpic-placeholder-02.png';

const moderationType = 'messages';

const Chats = ({ userId, photo }) => {
  const [allChats, setAllChats] = useState([]);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatSelected, setChatSelected] = useState({});
  const [chatOpened, setChatOpened] = useState(false);
  const [search, setSearch] = useState('');
  const [showChatRightPart, setShowChatRightPart] = useState(true);
  const [showChatLeftPart, setShowChatLeftPart] = useState(true);
  const [authors, setAuthors] = useState([]);
  const [activeAuthor, setActiveAuthor] = useState('');
  const [authorId, setAuthorId] = useState('');

  const width = useWindowDimensions().width;
  const isMobileScreen = width < 576;

  const queryParams = new URLSearchParams(window.location.search);
  const clientUserIdFromQueryParams = queryParams.get('id') || '';

  const getData = useCallback(async (authorId) => {
    const { data } = await api.getPossibleChats(authorId, moderationType);

	if (authorId) {
		setAuthorId(authorId);
	}

    setAllChats([...data.allSubscribers]);
  }, []);

  const getAuthorsToModerate = useCallback(async () => {
	const resp = await api.getAuthorsToModerate(moderationType);

	setAuthors([...resp.data]);
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  useEffect(() => {
	getAuthorsToModerate();
  }, [getAuthorsToModerate]);

  const onMessageChanged = useCallback((e) => {
	const message = e.target.value;
    setMessage(message);
  }, []);

  const markChatAsRead = useCallback(async (data) => {
    await api.markChatAsRead(data);

		allChats.forEach(chat => {
			if (chat.chatId === data.chatId) {
				chat.isAuthorRead = true;
			}
			return chat
		});

		setAllChats([...allChats]);
  }, [allChats]);

  const onChatClick = useCallback(async (chat) => {
    const { clientUserId, authorUserId, chatId, isAuthorRead } = chat;
    const resp = await api.getChat({ clientUserId, authorUserId, authorId, moderationType });

    if (resp.success) {
      setChatSelected({ ...chat });
      setChatMessages([...resp.messages].reverse());

      setChatOpened(true);

      setTimeout(() => {
        if (!isAuthorRead) {
          markChatAsRead({chatId, isAuthor: true});
        }
      }, 4000)// 4 seconds
    }

	if (isMobileScreen) {
		setShowChatRightPart(prevState => !prevState);
		setShowChatLeftPart(prevState => !prevState);
	}
  }, [markChatAsRead, isMobileScreen, authorId]);

  useEffect(() => {
	if (clientUserIdFromQueryParams !== '' && allChats.length > 0) {
		const chat = allChats.find(chat => chat.clientUserId === clientUserIdFromQueryParams);
		chat && onChatClick(chat);
	}
  }, [clientUserIdFromQueryParams, allChats, onChatClick]);

  const sendMessage = useCallback(async () => {
    const { clientUserId, authorUserId } = chatSelected;
	const moderId = authorId ? userId : '';

    const resp = await api.saveChatMessage({ clientUserId, authorUserId, message, authorId, moderationType, moderId });

    if (resp.success) {
      setChatMessages([...chatMessages, resp.chatMessage]);
      setMessage('');
    }

  }, [chatSelected, message, chatMessages, authorId, userId]);

  const userList = useCallback((user, i) => (
    <div key={i} className={'sub-item chat ' + (chatSelected.clientUserId === user.clientUserId ? 'active' : '')} onClick={() => onChatClick(user)}>
      <img alt="user-avatar" src={user.photo || replaceImage} onError={() => replaceImage} />
      <div className="author-nickname">
        <div className='client-name'>{user.clientName}</div>
        <span>{user.tierName} {helpers.getCurrencySign(user.currency)}{user.amount}</span>
      </div>

	  {!user.isAuthorRead && <span className='new-messages-notification'></span>}
    </div>
  ), [onChatClick, chatSelected]);

	useEffect(() => {
		if (isMobileScreen) {
			setShowChatRightPart(false);
		} else {
			setShowChatRightPart(true);
			setShowChatLeftPart(true);
		}
	}, [width, isMobileScreen]);

	const renderNoMassages = useCallback(() => (
		<div className='d-flex flex-column align-items-center no-messages'>
			<i className='fa-regular fa-envelope'></i>
			<h5 className='text-center my-3'><strong>{allChats.length === 0 ? 'У вас ще немає підписників' : 'Розпочніть чат'}</strong></h5>
			<span>
				{allChats.length === 0 ?
					'Ви зможете розпочати чат, коли у вас з’явиться перший підписник'
					:
					'Оберіть підписника в списку зліва, щоб надіслати повідомлення'
				}
			</span>
		</div>
	), [allChats]);

	const handleClick = () => {
		setShowChatRightPart(prevState => !prevState);
		setShowChatLeftPart(prevState => !prevState);
	};

	return (
    <section className="my-messages my-subscriptions user-messages-section">
		{authors.length !== 0 && (
			<div className='p-3'>
				<AuthorsToModerateContainer
					authors={authors}
					activeAuthor={activeAuthor}
					setActiveAuthor={setActiveAuthor}
					getData={getData}
				/>
			</div>
		)}
		{allChats.length === 0 ? renderNoMassages() : (
			<div className='d-flex'>
				{showChatLeftPart && (
					<div className='user-messages-left-part'>
						{allChats.length !== 0 && (
							<div className="search-field">
								<div className="input-group d-flex align-items-center flex-nowrap">
									<div className="input-group-append mr-2">
										<img src="/img/home-assets/search.svg" alt="search" />
									</div>

									<input id="search" type="text" className="form-control w-100"
										placeholder='Пошук' value={search}
										onChange={(e) => setSearch(e.target.value.trim())}
									/>
								</div>
							</div>
						)}

						<div className="client-name-column">
							{allChats.map((user, i) => {
								if (search) {
									if (user.tierName.toLowerCase().indexOf(search.toLowerCase()) !== -1 ||
										user.clientName.toLowerCase().indexOf(search.toLowerCase()) !== -1) {
										return userList(user, i);
									}
									return <React.Fragment key={i}></React.Fragment>;
								}

								return userList(user, i);
							})}
						</div>
					</div>
				)}
				{showChatRightPart && (
					<div className='user-messages-right-part'>
						{!chatOpened && allChats.length !== 0 && renderNoMassages()}

						{chatOpened && (
							<>
							<div className='about-author-container'>
								{isMobileScreen && (
									<button className='btn' type="button" onClick={() => handleClick()}>
										<i className="fa-solid fa-arrow-left"></i>
									</button>
								)}
								<div className='about-author'>
									<img alt="user-avatar" src={chatSelected.photo || replaceImage} onError={() => replaceImage} />
								</div>
								<span>{chatSelected.clientName}</span>
							</div>

							<div className="users-chat-container">
								{chatMessages.length === 0 ? (
									<div className='d-flex flex-column align-items-center no-messages'>
										<h6>Повідомлень ще немає</h6>
										<span>Надішліть перше повідомлення</span>
									</div>
								) : (
									<UserMessages
										messages={chatMessages}	userId={activeAuthor || userId} scrollAvailable={true}
										userPhoto={chatSelected.photo} authorPhoto={photo}
									/>
								)}
							</div>

							<div className='text-editor-wrapper d-flex align-items-center'>
								<div className="input-group d-flex align-items-center flex-nowrap">
									<input
										id="message"
										type="text"
										value={message}
										className="form-control w-100"
										placeholder='Ваше повідомлення'
										onChange={(e) => onMessageChanged(e)}
										onKeyDown={(e) => {
											if (e.key === 'Enter' && message.trim()) {
												sendMessage();
											}
										}}
									/>

									<EmojiPicker message={message} setMessage={setMessage} width={width} />
								</div>

								<button
									className="btn send-message-button ml-2"
									disabled={!message.trim()}
									onClick={sendMessage}
								>
									<i className="fa-solid fa-arrow-up"></i>
								</button>
							</div>
							</>
						)}
					</div>
				)}
			</div>
		)}
    </section>
	);
};

export default Chats;
