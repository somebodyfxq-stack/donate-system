import {DonatelloSystemStatus} from '../enums/PaymentEnums';

export const ContractType = {
	individual: 'individual',
	fop: 'fop'
}

class SystemDonatelloModel {
    enabled = false;
	status = DonatelloSystemStatus.inactive.status;
	fullName = '';
	ipn = '';
	iban = '';
	phone = '';
	email = '';
	stepFormDone = false;
	isOfferAccepted = false;
	offerAcceptedIp = '';
	offerAcceptedDate = null;
	isSignedByDonatello = false;
	isSignedByClient = false;
	contractId = '';
	contractType = ContractType.individual;
	contractExternalId = '';
	contractExternalUrl = '';
}

export default SystemDonatelloModel;
