const AppError = require('../errors/AppError');
const { VALID_PAYMENT_METHODS } = require('../constants/sales.constants');

const validateSaleInput = (data) => {
    if (!data) {
        throw new AppError('Sale data is required', 400);
    }

    const { items, paymentMethod } = data;

    if (!Array.isArray(items)) {
        throw new AppError('Items must be an array', 400);
    }

    if (items.length === 0) {
        throw new AppError('Sale must contain at least one item', 400);
    }

    if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
        throw new AppError('Invalid payment method', 400);
    }

    for (const item of items) {
        if (!item || typeof item !== 'object') {
            throw new AppError('Each item must be an object', 400);
        }

        if (!Number.isInteger(item.productId)) {
            throw new AppError('Product ID must be an integer', 400);
        }

        if (!Number.isInteger(item.quantity)) {
            throw new AppError('Quantity must be an integer', 400);
        }

        if (item.quantity <= 0) {
            throw new AppError('Quantity must be greater than zero', 400);
        }
    }
};

module.exports = {
    validateSaleInput
};