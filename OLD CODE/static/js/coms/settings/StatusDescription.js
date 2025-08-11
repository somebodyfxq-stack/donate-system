import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {ServiceFeeDefault} from '../../enums/PayoutEnums';
import {StatusTerms, UserStatus} from '../../enums/UserStatus';


class StatusDescription extends Component {

    render() {
        const {
            userStatus, status, hasTerms, upgradeAmount, hasDailyLimit, dailyAmount, isModeratedPayouts,
            isAutomatedPayout, hasSupport, hasCustomDevelopment, hasSubscription, monoIntegration
        } = this.props;

		const isCurrentStatus = userStatus === status || (userStatus === UserStatus.business && status === UserStatus.partner);

        return(
			<div className={`col-status ${isCurrentStatus ? 'active' : ''}`}>
				<div className={`active-element w-100 position-absolute fixed-top ${isCurrentStatus ? 'active' : ''}`}></div>
				<div className="title">
					<i className={StatusTerms[status].icon}/>
					<span>{StatusTerms[status].title}</span>
				</div>

				<div className="details">
					{hasTerms && (
						<div className="transition-conditions">
							<div className="status-terms">
								<span>Умови переходу</span>
							</div>
							<div className="d-flex">
								<i className="fas fa-bolt"/>
								<span>Від {upgradeAmount}&nbsp;₴ усіх виплат</span>
							</div>
							<div>
								<i className="fas fa-bolt"/>
								<span>Перевірка адміністратором</span>
							</div>
						</div>
					)}

					<div className="status-terms">
						<span>Переваги</span>
					</div>

					<div className="d-flex">
						<i className="fa-regular fa-circle-check"/>
						<span>Послуги {ServiceFeeDefault}%</span>
					</div>

					<div className="d-flex">
						<i className="fa-regular fa-circle-check"/>
						<span>Донати Visa/Mastercard</span>
					</div>

					<div className="d-flex">
						<i className="fa-regular fa-circle-check"/>
						<span>Криптодонати</span>
					</div>

					{hasDailyLimit && <div className="d-flex">
						<i className="fa-regular fa-circle-check"/>
						<span>{dailyAmount}&nbsp;₴ донатів на добу</span>
					</div>}

					{/*{!hasDailyLimit && <div className="d-flex">*/}
					{/*	<i className="fa-regular fa-circle-check" />*/}
					{/*	<span>*/}
					{/*		Безліміт донатів*/}
					{/*		/!*<br/> {maxAmount}&nbsp;₴ макс. сума одного донату.*!/*/}
					{/*	</span>*/}
					{/*</div>}*/}

					{isModeratedPayouts && <div className="d-flex">
						<i className="fa-regular fa-circle-check"/>
						<span>Модерація виплат</span>
					</div>}

					{isAutomatedPayout && <div className="d-flex">
						<i className="fa-regular fa-circle-check"/>
						<span>Автоматичні виплати</span>
					</div>}

					{monoIntegration && <div className="d-flex">
						<i className="fa-regular fa-circle-check"/>
						<span>Інтеграція з Монобанкою</span>
					</div>}

					{hasSubscription && <div className="d-flex">
						<i className="fa-regular fa-circle-check"/>
						<span>Підписки</span>
					</div>}

					{hasSupport && <div className="d-flex">
						<i className="fa-regular fa-circle-check"/>
						<span>Пріоритетна підтримка</span>
					</div>}

					{hasCustomDevelopment && <div className="d-flex">
						<i className="fa-regular fa-circle-check"/>
						<span>Розробка додаткового функціоналу</span>
					</div>}
				</div>

				{isCurrentStatus && (
					<div className="status-bage-active">
						<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
							<circle cx="2.99902" cy="3" r="3" fill="#3579F6"/>
						</svg>
						<span className='title'>Ваш статус</span>
					</div>
				)}
			</div>
		)
    }

}

StatusDescription.propTypes = {
    userStatus: PropTypes.string,
    status: PropTypes.string.isRequired,
	serviceFee: PropTypes.string,
	hasDailyLimit: PropTypes.bool,
	dailyAmount: PropTypes.string,
	maxAmount: PropTypes.string,
	upgradeAmount: PropTypes.string,
    hasTerms: PropTypes.bool,
    isModeratedPayouts: PropTypes.bool,
    isOccasionalModeratedPayouts: PropTypes.bool,
    isAutomatedPayout: PropTypes.bool,
    hasSupport: PropTypes.bool,
    hasCustomDevelopment: PropTypes.bool
}

export default StatusDescription;
