import React from 'react';
import {formatCurrencyWithoutCents} from '../../utils/utils';

function BillingStats({billingPlan}) {
	return <div className="section-wrapper section-wrapper-top">
		<div className="row mt-2">
			<div className="col-6 col-lg-3 mb-4">
				<div className="text-center">
					<i className="fas fa-message billing-icon mb-3" style={{fontSize: '40px'}} />
					<div className="text-muted small">Повідомлення</div>
					<div className="fw-bold mt-3">
						{billingPlan?.totalDonates || ``}
					</div>
				</div>
			</div>
			<div className="col-6 col-lg-3 mb-4">
				<div className="text-center">
					<i className="fas fa-heart billing-icon mb-3" style={{fontSize: '40px'}} />
					<div className="text-muted small">Донати</div>
					<div className="fw-bold mt-3">
						{billingPlan?.totalAmount &&
							<span>{formatCurrencyWithoutCents(billingPlan.totalAmount)}<span className="text-muted small">₴</span></span>}
					</div>
				</div>
			</div>
			<div className="col-6 col-lg-3 mb-4">
				<div className="text-center">
					<i className="fas fa-arrow-up billing-icon mb-3" style={{fontSize: '40px'}} />
					<div className="text-muted small">Поповнення</div>
					<div className="fw-bold mt-3">
						{billingPlan?.totalDebit &&
							<span>{formatCurrencyWithoutCents(billingPlan.totalDebit)}<span className="text-muted small">₴</span></span>}
					</div>
				</div>
			</div>
			<div className="col-6 col-lg-3 mb-4">
				<div className="text-center">
					<i className="fas fa-arrow-down billing-icon mb-3" style={{fontSize: '40px'}} />
					<div className="text-muted small">Послуги</div>
					<div className="fw-bold mt-3">
						{billingPlan?.totalCredit &&
							<span>{formatCurrencyWithoutCents(billingPlan.totalCredit)}<span className="text-muted small">₴</span></span>}
					</div>
				</div>
			</div>
		</div>
	</div>
}

export default BillingStats;
