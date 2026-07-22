const AppError = require('../errors/AppError');
const {
    CASH_MANUAL_MOVEMENT_TYPE_VALUES
} = require('../constants/cashMovementTypes');

const validateCreateCashMovementInput = (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new AppError('Cash Movement data is required', 400);
    }
    const cashSessionId = Number(data.cashSessionId);
    if (!Number.isInteger(cashSessionId) || cashSessionId <= 0) {
        throw new AppError(
            'Cash session ID must be a positive integer',
            400
        );
    }

    if (!CASH_MANUAL_MOVEMENT_TYPE_VALUES.includes(data.type)) {
        throw new AppError('Cash movement type is invalid', 400);
    }

    if (typeof data.amount !== 'number' || !Number.isFinite(data.amount) || data.amount <= 0) {
        throw new AppError('Cash movement amount must be a number greater than zero', 400);
    }

    if (typeof data.reason !== 'string') {
        throw new AppError(
            'Cash movement reason must be a string',
            400
        );
    }

    if (data.reason.trim() === '') {
        throw new AppError(
            'Cash movement reason cannot be empty',
            400
        );
    }

    return {
        cashSessionId,
        type: data.type,
        amount: data.amount,
        reason: data.reason.trim()
    };
};

module.exports = {
    validateCreateCashMovementInput
};