import moment from 'moment';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Accordion, Card} from 'react-bootstrap';
import {ConfettiCanvas} from 'react-raining-confetti';
import {connect} from 'react-redux';

import '../../../css/payouts.css';
import NoDataContainer from '../../../coms/misc/NoDataContainer';
import Spinner from '../../../coms/misc/Spinner';
import {
	BillingMinServiceFee,
	BillStatus,
	BillStatusDisplay,
	BillType,
	DefaultBillStatus
} from '../../../enums/BillingEnums';
import {PaymentSystem} from '../../../enums/PaymentEnums';
import {api} from '../../../services/api';
import BillingTerms from './BillingTerms';


export const BillingBriefAlert = {
	isPaymentRequired: {
		type: 'alert-warning', icon: 'fa-receipt',
		text: () => <span><strong>Новий рахунок</strong> за послуги. Просимо <strong>оплатити вчасно</strong> будь ласка.</span>
	},
	isMergeRequired: {
		type: 'alert-warning', icon: 'fa-yin-yang',
		text: () => <span><strong>Об'єднай</strong> рахунки, щоб <strong>оплатити</strong> один раз.</span>
	}
};

const BillsStatus = {
	noBills: {
		title: 'Рахунків за послуги ще немає', icon: 'fa-regular fa-file-lines',
		text: () => <div>Отримуй донати і підписки на <a
			href="/business/integration" target="_blank" rel="noopener noreferrer">власний бізнес мерчант</a>.</div>
	},
	hasBills: {
		title: 'Усі рахунки оплачено', icon: 'fa-regular fa-file-lines',
		text: () => <div>Нових рахунків немає.</div>
	}
};

const BillingBusinessTerms = [
	{title: 'Послуги', description: 'Повідомлення про донати, отримані на бізнес мерчант.'},
	{title: 'Тариф', description: ({serviceFee, isNoServiceFee}) => {
		return <>
			{serviceFee}% від суми донату. {isNoServiceFee && 'Для твого акаунта 0%. Дякуємо за розвиток українського контенту!'}
		</>
	}},
	{title: 'Бонус', description: ({BillingMinServiceFee}) => {
		return <>
			Пропускаємо рахунок, якщо сума за місяць менша {BillingMinServiceFee} ₴, і відкидаємо копійки.
		</>
	}},
	{title: 'Термін', description: 'Після несплати рахунку протягом 14 днів інтеграція може бути автоматично деактивована.'}
];

const BillingBusiness = ({serviceFee, status, isNoServiceFee}) => {
	const [isLoading, setLoading] = useState(true);
	const [billingInfo, setBillingInfo] = useState({
		newBills: 0, skippedBills: 0, isPaymentRequired: false, isMergeRequired: false, clientBillId: null,
		totalAmount: '0', totalServiceFee: '0'
	});
	const [bills, setBills] = useState([]);
	const [currentAccordionCard, setCurrentAccordionCard] = useState('billing-terms');
	const newBills = bills.filter(bills => bills.status === BillStatus.new || bills.status === BillStatus.skipped);
	const pastBills = bills.filter(bills => bills.status !== BillStatus.new && bills.status !== BillStatus.skipped && !bills.combinedBillId);
	const urlParams = new URLSearchParams(window.location.search);
	const searchId = urlParams.get('id');

	const fetchData = async () => {
		const data = await api.getBilling();
		setLoading(false);

		if (!data) {
			return;
		}

		setBillingInfo(data.billingInfo);
		setBills(data.bills);
	};

	useEffect(() => {
		fetchData().then();
	}, [status]);

	const mergeBills = useCallback(async () => {
		setLoading(true);
		await api.mergeBills();
		fetchData().then();
	}, []);

	const processBill = (clientBillId) => {
		if (!clientBillId) {
			console.log(`Cannot process bill because clientBillId is undefined`);
			return;
		}

		window.location.href = `/user/billing/process/${clientBillId}`;
	}

	const controls = useMemo(() => (
		<div className='billing-info flex-column flex-md-row'>
			<div className='billing-control-item flex-column align-items-start'>
				<span className='light-gray-50'>Загальна сума</span>
				<span className="count">{billingInfo.totalServiceFee} ₴</span>
			</div>
			<div className='billing-control-item align-items-start align-items-lg-center flex-column flex-md-row'>
				<div className='d-flex flex-column'>
					<span className='light-gray-50'>Разом до оплати</span>
					<span className="count">{billingInfo.totalServiceFee} ₴</span>
				</div>
				<div className='billing-buttons flex-lg-row ml-md-4 mt-3 mt-md-0'>
					{billingInfo.isMergeRequired &&
						<button className="btn btn-outline-dark"
								disabled={isLoading}
								onClick={() => mergeBills()}>
							Об’єднати
						</button>
					}
					<button className="btn btn-primary"
							disabled={isLoading || billingInfo.isMergeRequired || !billingInfo.isPaymentRequired || !billingInfo.clientBillId}
							onClick={() => processBill(billingInfo.clientBillId)}>
						Оплатити
					</button>
				</div>
			</div>
		</div>
	), [isLoading, billingInfo, mergeBills]);

	const briefInfo = useMemo(() => {
		const alert = billingInfo.isMergeRequired ?  BillingBriefAlert.isMergeRequired : BillingBriefAlert.isPaymentRequired;

		return (
			<div className={`alert ${alert.type} alert-panel mt-3`} role="alert">
				<div className="d-flex align-items-start">
					<span style={{width: '25px'}}><i className={`fas ${alert.icon}`}></i></span>
					<div>{alert.text()}</div>
				</div>
			</div>
		)
	}, [billingInfo]);

	const renderNoBills = useMemo(() => {
		const status = bills.length > 0 ? BillsStatus.hasBills : BillsStatus.noBills;

		return (
			<div className="section-wrapper mt-3">
				<NoDataContainer title={status.title} text={status.text()} icon={status.icon} />
			</div>
		)
	}, [bills]);

	const renderRow = useCallback((item, i) => (
		<tr key={`${item.pubOrderId}_${i}_${item.createdAt}`}>
			<th scope="row">{i + 1}</th>
			<td className="text-left">{moment(item.createdAt).format('L, LT')}</td>
			<td className="text-left">{item.clientName}</td>
			<td className="text-left text-muted">
				<span title={PaymentSystem[item.source].title}>{item.pubOrderId}</span>
			</td>
			<td className="text-center text-muted">
				<span>{PaymentSystem[item.source].system}</span>
			</td>
			<td className="text-right">{item.amount}</td>
			<td className="text-right">{item.serviceFee}</td>
		</tr>), []);

	const renderTotalRow = useCallback((totalAmount, totalServiceFee) => (
		<tr className="total-row">
			<th scope="row"></th>
			<td className="text-right" colSpan="4">Разом</td>
			<td className="text-right">{totalAmount}</td>
			<td className="text-right">{totalServiceFee}</td>
		</tr>), []);

	const renderTable = useCallback((items, totalAmount, totalServiceFee) => (<div>
		{items && items.length > 0 &&
			<table className="table table-hover table-responsive-md">
				<thead>
				<tr>
					<th scope="col">№</th>
					<th scope="col" className="text-left">Дата</th>
					<th scope="col" className="text-left">Відправник</th>
					<th scope="col" className="text-left">Код</th>
					<th scope="col" className="text-center"></th>
					<th scope="col" className="text-right">Донат</th>
					<th scope="col" className="text-right">Послуги</th>
				</tr>
				</thead>
				<tbody>
				{items.map((item, i) => renderRow(item, i))}
				{renderTotalRow(totalAmount, totalServiceFee)}
				</tbody>
			</table>}
	</div>), [renderRow, renderTotalRow]);

	const toggleAccordionCard = useCallback((card) => {
		const currentCard = currentAccordionCard === card ? currentAccordionCard + '-same-card' : card;

		setCurrentAccordionCard(currentCard);
	}, [currentAccordionCard, setCurrentAccordionCard]);

	const getStatusProperty = useCallback((st, prop) => {
		const status = BillStatusDisplay[st] ? BillStatusDisplay[st] : BillStatusDisplay[DefaultBillStatus];

		return status[prop];
	}, []);

	const renderAccordionHeader = useCallback((item, isPastBills) => (
		<div className="card-header-container flex-column flex-md-row">
			<div className='d-flex align-items-center'>
				{isPastBills &&
					<i className={`billing-status-icon ${getStatusProperty(item.status, 'icon')} icon-${item.status} d-none`}></i>
				}
				<span className="date">{moment(item.period).format('MM.YYYY')}</span>
			</div>
			<span className="payout-id">{item.clientBillId}</span>
			<div className="d-flex align-items-center" style={{ minWidth: '130px' }}>
				{isPastBills && item.type === BillType.combined &&
					<span className="mr-2" title="Об'єднаний рахунок">
						<i className="fas fa-yin-yang badge-combined" />
					</span>}
				<span className={`badge badge-pill badge-${item.status}`}>
					<span className="status">{getStatusProperty(item.status, 'title')}</span>
				</span>
			</div>
			<div className='amount-and-toggle'>
				<span className="amount mr-3">{item.totalServiceFee}</span>
				<span className="toggle mr-0"><i className="fa-solid fa-angle-down"></i></span>
			</div>
		</div>
	), [getStatusProperty]);

	const renderMergedBill = useCallback((item, i) => (
		<Card key={item.clientBillId || i}>
			<Accordion.Toggle
				as={Card.Header}
				eventKey={i + ''}
				onClick={() => toggleAccordionCard(i + '')}
				className={currentAccordionCard === i + '' ? 'expanded' : ''}
			>
				{renderAccordionHeader(item, false)}
			</Accordion.Toggle>
			<Accordion.Collapse eventKey={i + ''}>
				<Card.Body>
					{item.donates?.length > 0 && renderTable(item.donates, item.totalAmount, item.totalServiceFee)}
				</Card.Body>
			</Accordion.Collapse>
		</Card>
	), [renderTable, currentAccordionCard, toggleAccordionCard, renderAccordionHeader]);

	const renderCombinedBill = useCallback((item) => {
		const mergedBills = bills.filter(bill => bill.combinedBillId === item.clientBillId);

		return (
			<Accordion>
				{mergedBills.map((item, i) => renderMergedBill(item, i))}
			</Accordion>
		)
	}, [bills, renderMergedBill]);

	const renderBill = useCallback((item, i) => (
		<Card key={item.clientBillId || i}>
			<Accordion.Toggle
				as={Card.Header}
				eventKey={i + ''}
				onClick={() => toggleAccordionCard(i + '')}
				className={currentAccordionCard === i + '' ? 'expanded' : ''}
			>
				{renderAccordionHeader(item, true)}
			</Accordion.Toggle>
			<Accordion.Collapse eventKey={i + ''}>
				<Card.Body>
					{item.type === BillType.combined && renderCombinedBill(item)}
					{item.donates?.length > 0 && renderTable(item.donates, item.totalAmount, item.totalServiceFee)}
				</Card.Body>
			</Accordion.Collapse>
		</Card>), [renderTable, renderCombinedBill, currentAccordionCard, toggleAccordionCard, renderAccordionHeader]);

	const renderBills = useMemo(() => (
		<section className="payouts-history past-bills">
			<h5>Минулі рахунки </h5>

			<Accordion>
				{pastBills.map((item, i) => renderBill(item, i))}
			</Accordion>
		</section>
	), [pastBills, renderBill]);

	const renderNewBills = useMemo(() => (
		<section className="payouts-history mt-3">
			<Accordion>
				{newBills.map((item, i) => renderBill(item, i))}
			</Accordion>
		</section>
	), [newBills, renderBill]);




	return (
		<div className="payouts">
			<BillingTerms
				terms={BillingBusinessTerms}
				termsArgs={{serviceFee, isNoServiceFee, BillingMinServiceFee}}
				termsHeader={'Умови інтеграції бізнес-мерчанта'}
			/>
			{isLoading ? (
				<div className="section-wrapper d-flex justify-content-center mt-3" style={{height: '325px'}}>
					<Spinner />
				</div>
			) : (
				<>
				{newBills.length === 0 && !isLoading && renderNoBills}

				{newBills.length > 0 && <div className="section-wrapper mt-3">
					<h5>Нові рахунки</h5>
					<span className='light-gray-50'>Об’єднуй рахунки і оплачуй всі одразу.</span>
					{billingInfo.isPaymentRequired && briefInfo}
					{billingInfo.isPaymentRequired && controls}
					{newBills && newBills.length > 0 && renderNewBills}
				</div>}
				</>
			)}
			{searchId && <ConfettiCanvas active={true} fadingMode="LIGHT" stopAfterMs={5000}/>}
			{pastBills && pastBills.length > 0 && <div className="section-wrapper">
				{renderBills}
			</div>}
		</div>
	)
};

function mapStateToProps(state) {
	const {status, serviceFee, isNoServiceFee} = state.config;

	return {status, serviceFee, isNoServiceFee};
}

export default connect(mapStateToProps)(BillingBusiness);
