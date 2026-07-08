const AppError = require('../errors/AppError');

const validateInventoryAdjustmentInput = (data) => {
    if (!data) {
        throw new AppError('Inventory adjustment data is required', 400);
    }

    if (!Number.isInteger(data.productId)) {
        throw new AppError('Product ID must be an integer', 400);
    }

    if (!Number.isInteger(data.quantity)) {
        throw new AppError('Quantity must be an integer', 400);
    }

    if (data.quantity === 0) {
        throw new AppError('Quantity cannot be zero', 400);
    }

    if (!data.reason) {
        throw new AppError('Reason is required', 400);
    }

    if (typeof data.reason !== 'string') {
        throw new AppError('Reason must be a string', 400);
    }

    if (data.reason.trim() === '') {
        throw new AppError('Reason cannot be empty', 400);
    }
};


const validateStockEntryInput = (data) => {
    if (!data) {
        throw new AppError('Stock entry data is required', 400);
    }

    if (!Number.isInteger(data.productId)) {
        throw new AppError('Product ID must be an integer', 400);
    }

    if (!Number.isInteger(data.quantity)) {
        throw new AppError('Quantity must be an integer', 400);
    }

    if (data.quantity <= 0) {
        throw new AppError('Quantity must be greater than zero', 400);
    }

    if (!data.reason) {
        throw new AppError('Reason is required', 400);
    }

    if (typeof data.reason !== 'string') {
        throw new AppError('Reason must be a string', 400);
    }

    if (data.reason.trim() === '') {
        throw new AppError('Reason cannot be empty', 400);
    }
};

const validateWasteInput = (data) => {
    if (!data) {
        throw new AppError('Waste data is required', 400);
    }

    if (!Number.isInteger(data.productId)) {
        throw new AppError('Product ID must be an integer', 400);
    }

    if (!Number.isInteger(data.quantity)) {
        throw new AppError('Quantity must be an integer', 400);
    }

    if (data.quantity <= 0) {
        throw new AppError('Quantity must be greater than zero', 400);
    }

    if (!data.reason) {
        throw new AppError('Reason is required', 400);
    }

    if (typeof data.reason !== 'string') {
        throw new AppError('Reason must be a string', 400);
    }

    if (data.reason.trim() === '') {
        throw new AppError('Reason cannot be empty', 400);
    }
};



module.exports = {
    validateInventoryAdjustmentInput,
    validateStockEntryInput,
    validateWasteInput
};