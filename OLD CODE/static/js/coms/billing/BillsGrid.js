import React from 'react';
import {BillStatus, BillType} from '../../enums/BillingEnums';
import GridPagination from '../misc/GridPagination';

function BillsGrid({content, page, size, total, isSearchOn, onPageChange}) {

	return <div className="section-wrapper donates" style={{minHeight: '220px'}}>
		<div className="row">
			<div className="col-12">
				<div className="table-responsive">
					<table className="table">
						<thead>
						<tr>
							<th className="text-center" style={{width: '25%'}}>Дата</th>
							<th className="text-center" style={{width: '10%'}}>Повідомлення</th>
							<th className="text-right" style={{width: '10%'}}>Донати</th>
							<th className="text-right" style={{width: '190px'}}></th>
							<th className="text-right" style={{width: '100px'}}>Сума</th>
							<th className=""></th>
						</tr>
						</thead>
						<tbody>
						{content.map((bill, index) => (
							<tr key={bill.clientBillId || index}>
								<td className="text-center">
									{bill.period}
								</td>
								<td className="text-center">
									<span className="badge badge-number">{bill.totalDonates}</span>
								</td>
								<td className="text-right">
									{bill.type === BillType.charge && <span>
											{bill.totalAmount}
										</span>}
								</td>
								<td className="text-right">
									{bill.type === BillType.charge && bill.status !== BillStatus.resolved &&
										<span className="badge badge-pill badge-charge">
											Послуги
										</span>
									}
									{bill.type === BillType.charge && bill.status === BillStatus.resolved &&
										<span className="badge badge-pill badge-resolved">
											Благодійність
										</span>
									}
									{[BillType.topup, BillType.card, BillType.transfer].includes(bill.type) &&
										<span className={`badge badge-pill ` + (bill.status === BillStatus.reversed ? `badge-warning` : `badge-completed`)}>
											{bill.status === BillStatus.reversed ? `Повернення` : `Поповнення`}
										</span>
									}
								</td>
								<td className="text-right">
									<span className={bill.status === BillStatus.resolved ? 'text-muted' : ''}>
										{bill.type === BillType.charge ? '-' : ''}{bill.totalServiceFee}
									</span>
								</td>
								<td className="text-right" style={{width: '20px'}}>
									{bill.type === BillType.charge && bill.status !== BillStatus.resolved &&
										<i className="fas fa-arrow-down text-danger"/>
									}
									{bill.type === BillType.charge && bill.status === BillStatus.resolved &&
										<i className="fas fa-heart" style={{color: '#9b59b6'}}/>
									}
									{[BillType.topup, BillType.card].includes(bill.type) &&
										<i className={bill.status === BillStatus.reversed ? `fas fa-rotate-left text-warning` : `fas fa-arrow-up text-success`}/>
									}

									{bill.type === BillType.transfer &&
										<i className="fas fa-arrow-up-from-bracket text-success"/>
									}
								</td>
							</tr>
						))}
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<GridPagination page={page} size={size} total={total} isSearchOn={false} onPageChange={onPageChange}/>
	</div>;
}

export default BillsGrid;
