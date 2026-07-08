const AppError = require('../errors/AppError');
const { VALID_MOVEMENT_TYPES } = require('../constants/inventory.constants');

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


const validateInventoryMovementFilters = (filters) => {
    const normalizedFilters = {};

    if (filters.type !== undefined) {
        if (!VALID_MOVEMENT_TYPES.includes(filters.type)) {
            throw new AppError('Invalid movement type', 400);
        }

        normalizedFilters.type = filters.type;
    }

    if (filters.productId !== undefined) {
        const productId = Number(filters.productId);

        if (!Number.isInteger(productId) || productId <= 0) {
            throw new AppError('Product ID must be a positive integer', 400);
        }

        normalizedFilters.productId = productId;
    }

    return normalizedFilters;
};


module.exports = {
    validateInventoryAdjustmentInput,
    validateStockEntryInput,
    validateWasteInput,
    validateInventoryMovementFilters
};