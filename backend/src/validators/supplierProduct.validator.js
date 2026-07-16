const AppError = require('../errors/AppError');

const hasOwnProperty = (data, field) => {
    return Object.prototype.hasOwnProperty.call(data, field);
};

const validateSupplierProductCode = (value) => {
    if (value === null) {
        return;
    }

    if (typeof value !== 'string') {
        throw new AppError(
            'Supplier product code must be a string or null',
            400
        );
    }

    if (value.trim() === '') {
        throw new AppError(
            'Supplier product code cannot be empty',
            400
        );
    }
};

const validateUnitCost = (value) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new AppError('Unit cost must be a valid number', 400);
    }

    if (value < 0) {
        throw new AppError('Unit cost cannot be negative', 400);
    }
};

const validateCreateSupplierProductInput = (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new AppError('Supplier product data is required', 400);
    }

    if (data.productId === undefined) {
        throw new AppError('Product ID is required', 400);
    }

    if (!Number.isInteger(data.productId) || data.productId <= 0) {
        throw new AppError(
            'Product ID must be a positive integer',
            400
        );
    }

    if (data.unitCost === undefined) {
        throw new AppError('Unit cost is required', 400);
    }

    validateUnitCost(data.unitCost);

    if (data.supplierProductCode !== undefined) {
        validateSupplierProductCode(data.supplierProductCode);
    }
};

const validateUpdateSupplierProductInput = (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new AppError('Supplier product data is required', 400);
    }

    const allowedFields = [
        'supplierProductCode',
        'unitCost'
    ];

    const hasAtLeastOneField = allowedFields.some((field) =>
        hasOwnProperty(data, field)
    );

    if (!hasAtLeastOneField) {
        throw new AppError(
            'At least one field is required to update supplier product',
            400
        );
    }

    if (hasOwnProperty(data, 'supplierProductCode')) {
        validateSupplierProductCode(data.supplierProductCode);
    }

    if (hasOwnProperty(data, 'unitCost')) {
        validateUnitCost(data.unitCost);
    }
};

const validatePositiveIntegerParam = (value, fieldName) => {
    const normalizedValue = String(value);

    if (!/^[1-9]\d*$/.test(normalizedValue)) {
        throw new AppError(
            `${fieldName} must be a positive integer`,
            400
        );
    }
};

module.exports = {
    validateCreateSupplierProductInput,
    validateUpdateSupplierProductInput,
    validatePositiveIntegerParam
};