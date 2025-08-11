import React, {useEffect, useState} from 'react';
import '../../../css/payouts.css';
import {ConfettiCanvas} from 'react-raining-confetti';
import BillingBalance from '../../../coms/billing/BillingBalance';
import BillingStats from '../../../coms/billing/BillingStats';
import BillsGrid from '../../../coms/billing/BillsGrid';
import {api} from '../../../services/api';


const BillingPlan = () => {
	const [loading, setLoading] = useState(false);
	const [hasBillingCard, setHasBillingCard] = useState(false);
	const [billingPlan, setBillingPlan] = useState({});
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(20);
	const [total, setTotal] = useState(0);
	const [content, setContent] = useState([]);
	const urlParams = new URLSearchParams(window.location.search);
	const searchId = urlParams.get('id');

	const fetchData = async (page, size) => {
		setLoading(true);
		const data = await api.getBillingPlan({page, size});
		setLoading(false);

		if (!data) {
			return;
		}

		setHasBillingCard(data.hasBillingCard);
		setBillingPlan(data.billingPlan);
		setPage(data.page || 0);
		setSize(data.size || 20);
		setTotal(data.total || 0);
		setContent(data.content || []);
	};

	useEffect(() => {
		fetchData(page, size).then();
	}, [page, size]);

	return <div>
		{!loading && <div className="payouts billing billing-plan">
			{<section className="" style={{marginTop: '0px'}}>
				<div className="row">
					<div className="col-12 col-md-5">
						<BillingBalance loading={loading}
										balance={billingPlan.balance}
										hasBillingCard={hasBillingCard}
										onUpdate={() => fetchData()}/>
					</div>

					<div className="col-12 col-md-7">
						<BillingStats billingPlan={billingPlan}/>
					</div>
				</div>
			</section>}
			{<section className="new-payout" style={{marginTop: '0px'}}>
				<BillsGrid content={content} page={page} size={size} total={total} isSearchOn={false}
						   onPageChange={(page) => setPage(page)}/>
			</section>}
		</div>}

		{searchId && <ConfettiCanvas active={true} fadingMode="LIGHT" stopAfterMs={5000}/>}
	</div>;
};

export default BillingPlan;
