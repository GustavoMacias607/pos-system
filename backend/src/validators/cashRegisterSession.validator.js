const AppError = require('../errors/AppError');

const validateDataObject = (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new AppError('Cash session data is required', 400);
    }
};

const validateMoneyAmount = (value, fieldName) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new AppError(`${fieldName} must be a finite number`, 400);
    }

    if (value < 0) {
        throw new AppError(`${fieldName} must be greater than or equal to zero`, 400);
    }

    const decimalDifference = Math.abs(value * 100 - Math.round(value * 100));

    if (decimalDifference > 1e-8) {
        throw new AppError(`${fieldName} must have at most two decimal places`, 400);
    }
};

const validateOptionalNotes = (value, fieldName) => {
    if (value === undefined || value === null) {
        return;
    }

    if (typeof value !== 'string') {
        throw new AppError(`${fieldName} must be a string`, 400);
    }

    if (value.trim() === '') {
        throw new AppError(`${fieldName} cannot be empty`, 400);
    }

    if (value.length > 500) {
        throw new AppError(`${fieldName} must not exceed 500 characters`, 400);
    }
};

const validateOpenSessionInput = (data) => {
    validateDataObject(data);

    if (data.cashRegisterId === undefined) {
        throw new AppError('Cash register ID is required', 400);
    }

    if (!Number.isInteger(data.cashRegisterId) || data.cashRegisterId <= 0) {
        throw new AppError('Cash register ID must be a positive integer', 400);
    }

    if (data.openingAmount === undefined) {
        throw new AppError('Opening amount is required', 400);
    }

    validateMoneyAmount(data.openingAmount, 'Opening amount');
    validateOptionalNotes(data.openingNotes, 'Opening notes');
};

const validateCloseSessionInput = (data) => {
    validateDataObject(data);

    if (data.closingAmount === undefined) {
        throw new AppError('Closing amount is required', 400);
    }

    validateMoneyAmount(data.closingAmount, 'Closing amount');
    validateOptionalNotes(data.closingNotes, 'Closing notes');
};

const validateCashSessionIdParam = (value) => {
    if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
        throw new AppError('Cash session ID must be a positive integer', 400);
    }
};

module.exports = {
    validateOpenSessionInput,
    validateCloseSessionInput,
    validateCashSessionIdParam
};