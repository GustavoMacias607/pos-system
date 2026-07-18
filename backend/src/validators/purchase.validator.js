const AppError = require('../errors/AppError');

const validatePositiveInteger = (value, fieldName) => {
    if (!Number.isInteger(value) || value <= 0) {
        throw new AppError(
            `${fieldName} must be a positive integer`,
            400
        );
    }
};

const validateCreatePurchaseInput = (data) => {
    if (
        !data
        || typeof data !== 'object'
        || Array.isArray(data)
    ) {
        throw new AppError('Purchase data is required', 400);
    }

    if (data.supplierId === undefined) {
        throw new AppError('Supplier ID is required', 400);
    }

    validatePositiveInteger(data.supplierId, 'Supplier ID');

    if (
        data.invoiceNumber !== undefined
        && data.invoiceNumber !== null
    ) {
        if (typeof data.invoiceNumber !== 'string') {
            throw new AppError(
                'Invoice number must be a string',
                400
            );
        }

        const invoiceNumber = data.invoiceNumber.trim();

        if (invoiceNumber === '') {
            throw new AppError(
                'Invoice number cannot be empty',
                400
            );
        }

        if (invoiceNumber.length > 100) {
            throw new AppError(
                'Invoice number cannot exceed 100 characters',
                400
            );
        }
    }

    if (data.tax !== undefined) {
        if (
            typeof data.tax !== 'number'
            || !Number.isFinite(data.tax)
            || data.tax < 0
        ) {
            throw new AppError(
                'Tax must be a non-negative number',
                400
            );
        }
    }

    if (data.notes !== undefined && data.notes !== null) {
        if (typeof data.notes !== 'string') {
            throw new AppError('Notes must be a string', 400);
        }

        if (data.notes.trim() === '') {
            throw new AppError('Notes cannot be empty', 400);
        }
    }

    if (!Array.isArray(data.items) || data.items.length === 0) {
        throw new AppError(
            'At least one purchase item is required',
            400
        );
    }

    const productIds = new Set();

    data.items.forEach((item, index) => {
        if (
            !item
            || typeof item !== 'object'
            || Array.isArray(item)
        ) {
            throw new AppError(
                `Item at index ${index} must be an object`,
                400
            );
        }

        if (item.productId === undefined) {
            throw new AppError(
                `Product ID is required for item at index ${index}`,
                400
            );
        }

        validatePositiveInteger(
            item.productId,
            `Product ID for item at index ${index}`
        );

        if (productIds.has(item.productId)) {
            throw new AppError(
                'Products cannot be repeated in a purchase',
                400
            );
        }

        productIds.add(item.productId);

        if (item.quantity === undefined) {
            throw new AppError(
                `Quantity is required for item at index ${index}`,
                400
            );
        }

        validatePositiveInteger(
            item.quantity,
            `Quantity for item at index ${index}`
        );

        if (item.unitCost === undefined) {
            throw new AppError(
                `Unit cost is required for item at index ${index}`,
                400
            );
        }

        if (
            typeof item.unitCost !== 'number'
            || !Number.isFinite(item.unitCost)
            || item.unitCost < 0
        ) {
            throw new AppError(
                `Unit cost for item at index ${index} must be a non-negative number`,
                400
            );
        }
    });
};

const validatePurchaseIdParam = (value) => {
    if (
        typeof value !== 'string'
        || !/^[1-9]\d*$/.test(value)
    ) {
        throw new AppError(
            'Purchase ID must be a positive integer',
            400
        );
    }
};

module.exports = {
    validateCreatePurchaseInput,
    validatePurchaseIdParam
};