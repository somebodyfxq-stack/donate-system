import React, { useState, useCallback } from 'react';
import '../../css/userStatus.css';
import { api } from '../../services/api';


const AdminUserLinks = props => {
  const [nickname, setNickname] = useState();
  const [users, setUsers] = useState([]);

  const getUsers = async (e, field) => {
    const { value } = e.target;

    setNickname(value);

    if (value.length > 2) {
      const res = await api.getUserLinks({ [field]: value });
      setUsers([]);

      setTimeout(() => {
        setUsers([...res]);
      }, 100)
    }
  }

  const onChange = useCallback((e, userId, field) => {
    const index = users.findIndex(user => user.userId === userId);

    const newUsers = [...users];

    const {value} = e.target;
    newUsers[index].socialNetworks[field] = value;

    setUsers([...newUsers]);
  }, [users])

  const onSaveClick = useCallback((userId) => {
    const user = users.find(user => user.userId === userId);

    api.saveUserLinks(user);
  }, [users])

  const renderSocialLink = useCallback((link, userId) => {
    const user = users.find(user => user.userId === userId);

    return (
      <div className="col-sm-6 mb-4">
        <div className="d-flex justify-content-between align-items-center">

          <label className="col-form-label" htmlFor={link.id}>
            {link.id !== 'trovo' && link.id !== 'custom' &&
              <><i className={`fab fa-${link.id} mr-2`} /> {link.name}</>
            }
            {link.id === 'trovo' && <><i className={`fa-solid fa-t mr-2`} /> {link.name}</>}
            {link.id === 'custom' && <><i className={`fa-solid fa-link mr-2`} /> {link.name}</>}
          </label>

          <input className="form-control" id={link.id}
            placeholder={link.placeholder}
            value={user.socialNetworks?.[link.id]}
            onChange={e => onChange(e, userId, link.id)} />
        </div>
      </div>
    )
  }, [users, onChange]);

  const renderSocialLinks = useCallback((userId) => {
    const socialLinks = [{
      id: 'youtube',
      name: 'Youtube',
      placeholder: 'https://youtube.com'
    }, {
      id: 'twitch',
      name: 'Twitch',
      placeholder: 'https://twitch.tv'
    }, {
      id: 'tiktok',
      name: 'Tiktok',
      placeholder: 'https://tiktok.com'
    }, {
      id: 'facebook',
      name: 'Facebook',
      placeholder: 'https://facebook.com'
    }, {
      id: 'telegram',
      name: 'Telegram',
      placeholder: 'https://t.me'
    }, {
      id: 'discord',
      name: 'Discord',
      placeholder: 'https://discord.com'
    }, {
      id: 'instagram',
      name: 'Instagram',
      placeholder: 'https://instagram.com'
    }, {
      id: 'twitter',
      name: 'Twitter',
      placeholder: 'https://twitter.com'
    }, {
      id: 'trovo',
      name: 'Trovo',
      placeholder: 'https://trovo.live'
    }, {
      id: 'custom',
      name: 'Ваш сайт',
      placeholder: 'https://...'
    }];

    return (
      <div>
        <h3 className="">Медіа-канали і соцмережі</h3>
        <div className="row">
          {renderSocialLink(socialLinks[0], userId)}
          {renderSocialLink(socialLinks[1], userId)}
        </div>
        <div className="row">
          {renderSocialLink(socialLinks[2], userId)}
          {renderSocialLink(socialLinks[3], userId)}
        </div>
        <div className="row">
          {renderSocialLink(socialLinks[4], userId)}
          {renderSocialLink(socialLinks[5], userId)}
        </div>
        <div className="row">
          {renderSocialLink(socialLinks[6], userId)}
          {renderSocialLink(socialLinks[7], userId)}
        </div>
        <div className="row">
          {renderSocialLink(socialLinks[8], userId)}
          {renderSocialLink(socialLinks[9], userId)}
        </div>
      </div>
    )
  }, [renderSocialLink]);

  return (
    <div className="payouts user-status">
      <div className="form-group row mb-lg-4">
        <label htmlFor="nickname" className="col-sm-1 col-form-label-sm mr-3">Nickname:</label>
        <div className="col-sm-3">
          <input id="nickname" type="text" className="form-control form-control-sm"
            value={nickname || ''}
            onChange={(e) => getUsers(e, 'nickname')} />
        </div>
      </div>

      {users.map((user, i) =>
        <div key={i} className="mb-5">
          <div className="vertical-align">
            <a href={`/${user.nickname}`} target="_blank" rel="noopener noreferrer">{user.nickname}</a>
          </div>
          <div>{renderSocialLinks(user.userId)}</div>
          <button className="btn btn-primary" onClick={() => onSaveClick(user.userId)}>Save</button>
        </div>
      )}
    </div>
  )
};

export default AdminUserLinks;
