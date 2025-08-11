class DonateModel {
    id = '';
    orderId = '';
    clientName = '';
    clientEmail = '';
    goalWidgetId = '';
    message = '';
    amount = '';
    currency = 'UAH';
    source = 'manual';
    isPublished = false;
    createdAt = new Date();
    avatar = 'https://www.gravatar.com/avatar/9de09c5f29ef715bd9558a50e9204bac?s=40&d=identicon';
    isPaidFee = false;
    paidAmount = '';
}

export default DonateModel;
