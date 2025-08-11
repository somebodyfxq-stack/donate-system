import React, {useCallback, useEffect, useState} from 'react';
import {connect} from 'react-redux';
import EmojiPicker from '../../coms/misc/EmojiPicker';
import UserMessages from '../../coms/user/UserMessages';
import {useWindowDimensions} from '../../hooks/useWindowDimensions';
import {api} from '../../services/api';

import '../../css/userMessages.css';

const replaceImage = '/img/userpic-placeholder-02.png';

const UserSubscriptions = ({ userId, photo }) => {
  const [allChats, setAllChats] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatOpened, setChatOpened] = useState(false);
  const [chatSelected, setChatSelected] = useState({});
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [showChatRightPart, setShowChatRightPart] = useState(true);
  const [showChatLeftPart, setShowChatLeftPart] = useState(true);
  const width = useWindowDimensions().width;
  const isMobileScreen = width < 576;

  const getMyChats = useCallback(async () => {
    const resp = await api.getAllChats();

    if (resp.success) {
      setAllChats([...resp.chats]);
    }
  }, []);

  const markChatAsRead = useCallback(async (chatId) => {
    await api.markChatAsRead({ chatId });

		allChats.forEach(chat => {
			if (chat.chatId === chatId) {
				chat.isClientRead = true;
			}
			return chat
		});

		setAllChats([...allChats]);
  }, [allChats]);

  const onChatClick = useCallback(async (chat) => {
    const { createdAt, availableTill, chatId } = chat;
    const resp = await api.getChatMessages({ createdAt, availableTill, chatId });

    if (resp.success) {
      setChatMessages([...resp.messages].reverse());
      setChatOpened(true);
      setChatSelected({ ...chat });

      setTimeout(() => {
        if (!chat.isClientRead) {
          markChatAsRead(chat.chatId);
        }
      }, 4000)// 4 seconds
    }

		if (isMobileScreen) {
			setShowChatRightPart(prevState => !prevState);
			setShowChatLeftPart(prevState => !prevState);
		}
  }, [markChatAsRead, isMobileScreen]);

  const onMessageChanged = useCallback((e) => {
    setMessage(e.target.value);
  }, []);

  const sendMessage = useCallback(async () => {
    const { chatId } = chatSelected;
    const resp = await api.saveChatMessage({ chatId, message });

    if (resp.success) {
      setChatMessages([...chatMessages, resp.chatMessage]);
      setMessage('');
    }

  }, [chatSelected, message, chatMessages]);

  useEffect(() => {
    getMyChats();
  }, [getMyChats]);

	useEffect(() => {
		if (isMobileScreen) {
			setShowChatRightPart(false);
		} else {
			setShowChatRightPart(true);
			setShowChatLeftPart(true);
		}
	}, [width, isMobileScreen]);

	const handleClick = () => {
		setShowChatRightPart(prevState => !prevState);
		setShowChatLeftPart(prevState => !prevState);
	};

	const userList = useCallback((user, i) => (
		<div key={i} className={'sub-item chat ' + (chatSelected.chatId === user.chatId ? 'active' : '')} onClick={() => onChatClick(user)}>
			<img alt="user-avatar" src={user.authorData.photo || replaceImage} onError={() => replaceImage} />

			<div className="author-nickname">
				<a href={`${window.location.hash}/${user.authorData.nickName}/news`} target="_blank" rel="noopener noreferrer">
					{user.authorData.nickName}
				</a>
				<br/>
				<span>Рівень: {user.tierName}</span>
			</div>

			{!user.isClientRead && <span className='new-messages-notification'></span>}
		</div>
	), [onChatClick, chatSelected]);

	const renderNoMassages = useCallback(() => (
		<div className='d-flex flex-column align-items-center no-messages'>
			<i className='fa-regular fa-envelope'></i>
			<h5 className='text-center my-3'><strong>{allChats.length === 0 ? 'У вас ще немає повідомлень' : 'Ваші повідомлення'}</strong></h5>
			<span>
				{allChats.length === 0 ?
					'Тут будуть відображатись вітальні повідомлення та розсилки від кріейторів, на яких ви підписані та ваші переписки з ними'
					:
					'Оберіть автора в списку зліва, щоб переглянути повідомлення'
				}
			</span>
		</div>
	), [allChats]);

	return (
		<section className="my-messages my-subscriptions user-messages-section">
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

										<input
											id="search"
											type="text"
											className="form-control w-100"
											placeholder='Пошук'
											onChange={(e) => setSearch(e.target.value.trim())}
											value={search}
										/>
									</div>
								</div>
							)}

							<div className="client-name-column">
								{allChats.map((user, i) => {
									if (search) {
										if (user.tierName.toLowerCase().indexOf(search.toLowerCase()) !== -1 ||
											user.authorData.nickName.toLowerCase().indexOf(search.toLowerCase()) !== -1) {
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
											<img alt="user-avatar" src={chatSelected.authorData?.photo || replaceImage} onError={() => replaceImage} />
										</div>
										<span>{chatSelected.authorData?.nickName}</span>
									</div>
									<div className="users-chat-container">
										<UserMessages
											messages={chatMessages}
											userId={userId}
											scrollAvailable={true}
											userPhoto={chatSelected.authorData?.photo}
											authorPhoto={photo}
										/>
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

function mapStateToProps(state) {
  const { userId, photo } = state.config;

  return { userId, photo };
}

export default connect(mapStateToProps)(UserSubscriptions);
