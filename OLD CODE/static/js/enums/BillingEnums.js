export const BillingSystem = {liqpay: 'liqpay', fondy: 'fondy'};

export const DefaultBillingSystem = BillingSystem.liqpay;

export const BillStatus = {
	new: 'new',                 // new: default bill status for newly created bill
	skipped: 'skipped',         // skipped: bill skipped due to small amount of service fee (fee will be included in the next bill)
	merged: 'merged',           // merged: bill is merged to the newer one
	review: 'review',           // review: user has sent appeal which should be reviewed by moderator. doesn't block mono feature in next month
	processing: 'processing',   // processing: bill was sent to the billing system
	completed: 'completed',     // completed: bill was successfully paid
	resolved: 'resolved',       // resolved: bill treated by donatello as paid one after user appeal (charity reason etc.)
	canceled: 'canceled',       // canceled: bill was canceled due to some reason
	reversed: 'reversed',       // reversed: bill reversed on system side and money returned to the client
	failure: 'failure'          // failure: bill payment failed due to some reason (e.g. rejected by anti-fraud)
};

export const DefaultBillStatus = BillStatus.new;

export const BillStatusDisplay = {
	new: {type: 'new', title: 'Новий', icon: 'fa-regular fa-file-lines'},
	skipped: {type: 'skipped', title: 'Пропуск', icon: 'fa-solid fa-rotate-right'},
	merged: {type: 'merged', title: `З'єднаний`, icon: 'fa-solid fa-yin-yang'},
	review: {type: 'review', title: 'Розглядається', icon: 'fa-solid fa-magnifying-glass'},
	processing: {type: 'processing', title: 'Виконується', icon: 'fa-regular fa-hourglass-half'},
	completed: {type: 'completed', title: 'Виконаний', icon: 'fa-regular fa-circle-check'},
	resolved: {type: 'resolved', title: 'Благодійність', icon: 'fa-regular fa-heart'},
	canceled: {type: 'canceled', title: 'Скасований', icon: 'fa-regular fa-circle-xmark'},
	reversed: {type: 'reversed', title: 'Повернення', icon: 'fa-regular fa-solid fa-rotate-left'},
	failure: {type: 'failure', title: 'Помилка', icon: 'fa-solid fa-circle-exclamation'}
};

export const BillType = {
	base: 'base',               // base: usual bill type
	combined: 'combined',       // combined: special bill combines previous unpaid bills (they should be marked as "merged")
	card: 'card',               // card: technical bill order type to save user card token details
	topup: 'topup',             // topup: adding funds to user account
	transfer: 'transfer',       // transfer: transfer funds from payouts to billing balance
	charge: 'charge'            // charge: charge funds from user account
};

export const DefaultBillType = BillType.base;

export const BillingTerms = {none: 'none', pending: 'pending', accept: 'accept', reject: 'reject', cancel: 'cancel'};
export const BillingPlans = {fixed: 'fixed', flex: 'flex'};
export const BillingPlansDisplay = {fixed: {name: 'fixed', title: 'Фіксований тариф'}, flex: {name: 'flex', title: 'Гнучкий тариф'}};
export const DefaultBillingPlan = BillingPlans.fixed;
export const BillingPlanDays = 60;

export const BillingMinServiceFee = 50;
export const BillingMaxCreditAmount = 50;
export const BillingCardChargeAmount = 5;
