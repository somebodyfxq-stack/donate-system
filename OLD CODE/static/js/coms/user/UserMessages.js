import moment from 'moment';
import 'moment/locale/uk';
import React, {useCallback, useEffect, useRef} from 'react';
import '../../css/userMessages.css';

const UserMessages = ({ messages, userId, scrollAvailable, authorPhoto, userPhoto }) => {
	const ref = useRef(null);

	useEffect(() => {
		setTimeout(() => {
			if (ref.current && scrollAvailable) {
				ref.current.scrollIntoView({behavior: "smooth", block:"end"});
			}
		}, 100)
	}, [messages, scrollAvailable]);

	const groupMessagesByDay = useCallback(() => {
		const groupedMessages = {};

		messages.forEach((message) => {
			const day = moment(message.createdAt).format('YYYY-MM-DD');

			if (!groupedMessages[day]) {
				groupedMessages[day] = [];
			}

			groupedMessages[day].push(message);
		});

		return groupedMessages;
	}, [messages]);

	return (
		<div className="messages" ref={ref}>
			{Object.entries(groupMessagesByDay()).map(([day, messagesByDay]) => (
				<div key={day} className="message-group">
					<div className="day-header text-center">{moment(day).format('DD MMMM, Y')}</div>
					{messagesByDay.map((message) => (
						<div key={message._id}>
							{message.isWelcomeMessage && <div className='welcome-message-bage'>Вітальне повідомлення</div>}
							<div className={`d-flex d-flex-row align-items-end justify-content-${userId === message.userId ? 'end' : 'start'} mb-3`}>
								{userId !== message.userId && <img className='mr-1' alt="author-avatar" src={userPhoto} />}

								<div className={`bg-info text-white message-bubble ${userId === message.userId ? 'is-my-message' : ''}`}>
									<div dangerouslySetInnerHTML={{ __html: message.message }}></div>
									<div className="time text-right m-0">
										<strong>{message.moderNickname ? message.moderNickname : ''}</strong> {moment(message.createdAt).format('HH:mm')}
									</div>
								</div>
								{userId === message.userId &&
									<img className='ml-1' alt="user-avatar" src={authorPhoto} />
								}
							</div>
						</div>
					))}
				</div>
			))}
		</div>
	);
};

export default UserMessages;
