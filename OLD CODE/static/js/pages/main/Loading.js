import React, { useCallback, useEffect, useState } from 'react';
import {Redirect, Route} from 'react-router-dom';
import moment from 'moment';
import {connect} from 'react-redux';
import { UserRole } from '../profile/Settings';
import {api} from '../../services/api';

const Loading = (props) => {
  const [redirection, setRedirection] = useState('dashboard');
  const [readyToRedirection, setReadyToRedirection] = useState(false);

  const getUserData = useCallback(async () => {
    if (props?.userRoles) {
      const settings = await api.getSettings();

      const isNewlyCreated = moment().diff(moment(settings.createdAt), 'seconds') < 30;
      const userFromDonationPage = localStorage.getItem('noUserSession');
      const redirectionFrom = localStorage.getItem('redirectionFrom');

      localStorage.removeItem('noUserSession');
      localStorage.removeItem('redirectionFrom');

      if (!isNewlyCreated && redirectionFrom && userFromDonationPage) {
        localStorage.removeItem('desiredTierId');
        localStorage.removeItem('desiredTierData');
        window.location.href = redirectionFrom;

        return;
      }

      const onlyUser = props.userRoles.length === 1 && props.userRoles[0] === UserRole.user;

      let link = isNewlyCreated ? 'settings' : 'dashboard';
      
      if (onlyUser && !isNewlyCreated) {
        link = 'my-news';
      }

      setRedirection(link);
      setReadyToRedirection(true);
    }
  }, [props])

  useEffect(() => {
    getUserData();
  }, [getUserData])

  return (
    readyToRedirection ?
      <Route exact path="/panel/loading" render={() => <Redirect to={`/panel/${redirection}`}/>}/>
      :
      null
  )
}

function mapStateToProps(state) {
  const {config} = state;
  const {userRoles, nickname} = config;

  return {userRoles, nickname};
}

export default connect(mapStateToProps)(Loading);

