import React from 'react';
import helpers from '../../utils/helpers';

import '../../css/subscriptions.css';

const TierCardContent = ({tier}) => {
	return (
		<div className="tier-card-content">
			<div className="subscribers">
				<span>Підписників: </span>
				<span>{tier.activeMembers}{tier.isLimitedSubscribers && '/' + tier.limitedSubscribers}</span>
			</div>

			<span className="name">{tier.tierName}</span>
			<span className="price">
				{tier.price}
				<span className="currency">{helpers.getCurrencySign(tier.currency)}</span>
			</span>
			<span className="month">на місяць</span>

			{tier.image?.url && (
				<div className="img-container">
					<img className={tier.largeImage ? 'large-image' : ''} src={tier.image.url} alt="rectangle"/>
				</div>
			)}

			<button className="btn preview-button btn-primary">{tier.buttonName}</button>

			<div className="description">{tier.description}</div>
		</div>
	);
};

export default TierCardContent;
