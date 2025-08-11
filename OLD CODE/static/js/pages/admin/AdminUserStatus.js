import React, {useState} from 'react';
import '../../css/userStatus.css';
import {api} from '../../services/api';

const AdminUserStatus = props => {
    const [nickname, setNickname] = useState();
    const [userPageId, setUserPageId] = useState();
    const [users, setUsers] = useState([]);
    const [sendEmail, setSendEmail] = useState(true);

    const getUsers = async (e, field) => {
        const {value} = e.target;

        if (field === 'nickname') {
            setNickname(value);
        } else {
            setUserPageId(value);
        }

        if (value.length > 2) {
            const res = await api.getUserStatus({[field]: value});

            setUsers(res);
        }
    }

    // const saveDataForUserFromAdmin = useCallback(async (userId, value, field) => {
    //     await api.saveDataForUserFromAdmin({userId, value, field});
    // }, [])

    return <div className="payouts user-status">
        <div className="form-group row mb-lg-4">
            <label htmlFor="nickname" className="col-sm-1 col-form-label-sm mr-3">Nickname:</label>
            <div className="col-sm-3">
                <input id="nickname" type="text" className="form-control form-control-sm"
                       value={nickname || ''}
                       onChange={(e) => getUsers(e, 'nickname')}/>
            </div>
            <label htmlFor="userPageId" className="col-sm-1 col-form-label-sm" style={{minWidth: '100px'}}>UserPageId:</label>
            <div className="col-sm-3">
                    <input id="userPageId" type="text" className="form-control form-control-sm"
                           value={userPageId || ''}
                           onChange={(e) => getUsers(e, 'userPageId')}/>
            </div>
            <div className="col-sm-3 text-right">
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="" id="send-email"
                           defaultChecked={sendEmail}
                           onChange={(e) => setSendEmail(!sendEmail)}/>
                    <label className="form-check-label" htmlFor="send-email">
                        Send email
                    </label>
                </div>
            </div>
        </div>

        {(users.length > 0) &&
        <table className="table table-hover table-responsive-sm vertical-align" style={{fontSize: '0.8rem'}}>
            <thead style={{borderTop: '2px solid #dee2e6', backgroundColor: '#f6f6f6'}}>
            <tr>
                <th className="">Nickname</th>
                <th className="text-left" style={{width: '150px'}}>UserPageId</th>
                <th className="text-center">Created at</th>
            </tr>
            </thead>

            <tbody>
            {users.map((user, i) =>
                <tr id={user.userId} key={user.userId}>
                    <td className="vertical-align">
                        <a href={`/${user.nickname}`} target="_blank" rel="noopener noreferrer">{user.nickname}</a>
                        <a className="pointer" style={{display: 'inline-block', float: 'right'}}
                            href={`/panel-api/userAuth?userId=${user.userId}&nickname=${user.nickname}`}>
                            <i className="fas fa-sign-in-alt"/>
                        </a>
                    </td>
                    <td className="text-left vertical-align">{user.userPageId}</td>
                    <td className="text-center vertical-align">{user.createdAt}</td>
                </tr>
            )}
            </tbody>
        </table>
        }
    </div>
};

export default AdminUserStatus;
