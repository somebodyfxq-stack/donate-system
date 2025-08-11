import React from 'react';
import {AuthProvider} from '../../enums/AuthProvider';

function UserAuthLink({ provider, auth, one, onAuth }) {
	const { id, name, linked } = auth;
	const title = AuthProvider[provider].title;

	return (
		<div className="col-sm-6 col-md-4 px-0 px-sm-2">
			<div className='auth-link-wrapper'>
				<span
					className={`service ${name ? 'active' : ''}`}
					title={`${title}${id ? `: ${id}` : ''}`}
				>
					<img src={`/img/logos/logo-${provider}.svg`} alt={title} width="48" height="48" />
				</span>

				<span className={`service-name ${linked ? '' : 'text-muted'}`}>
					{linked && name ? name : title}
				</span>

				<button
					className={`btn ${linked ? 'btn-secondary' : 'btn-dark'}`}
					disabled={one && linked}
					onClick={() => onAuth(provider, !linked)}
				>
					{linked ? "Від'єднати" : 'Приєднати'}
				</button>
			</div>
		</div>
	);
}

export default UserAuthLink;
