const AppError = require('../errors/AppError');

const validateProductInput = (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new AppError('Product data is required', 400);
    }

    if (data.name === undefined) {
        throw new AppError('Product name is required', 400);
    }

    if (typeof data.name !== 'string') {
        throw new AppError('Product name must be a string', 400);
    }

    if (data.name.trim() === '') {
        throw new AppError('Product name cannot be empty', 400);
    }

    if (
        data.description !== undefined &&
        data.description !== null &&
        typeof data.description !== 'string'
    ) {
        throw new AppError(
            'Product description must be a string or null',
            400
        );
    }

    if (data.price === undefined) {
        throw new AppError('Product price is required', 400);
    }

    if (typeof data.price !== 'number' || !Number.isFinite(data.price)) {
        throw new AppError(
            'Product price must be a valid number',
            400
        );
    }

    if (data.price < 0) {
        throw new AppError('Product price cannot be negative', 400);
    }

    if (data.stock === undefined) {
        throw new AppError('Product stock is required', 400);
    }

    if (!Number.isInteger(data.stock)) {
        throw new AppError('Product stock must be an integer', 400);
    }

    if (data.stock < 0) {
        throw new AppError('Product stock cannot be negative', 400);
    }

    if (data.categoryId !== undefined && data.categoryId !== null) {
        if (!Number.isInteger(data.categoryId) || data.categoryId <= 0) {
            throw new AppError(
                'Product category ID must be a positive integer',
                400
            );
        }
    }
};

module.exports = {
    validateProductInput
};
