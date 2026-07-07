const PAYMENT_METHODS = {
    CASH: 'CASH',
    CARD: 'CARD',
    TRANSFER: 'TRANSFER'
};

const VALID_PAYMENT_METHODS = Object.values(PAYMENT_METHODS);

module.exports = {
    PAYMENT_METHODS,
    VALID_PAYMENT_METHODS
};