const AppError = require('../errors/AppError');

const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const isRealDate = (value) => {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
};

const validateSalesSummaryQuery = (data) => {
    if (!data || typeof data !== 'object') {
        throw new AppError('Sales summary query is required', 400);
    }
    if (data.from === undefined) {
        throw new AppError('From date is required', 400);
    }

    if (typeof data.from !== 'string') {
        throw new AppError('From date must be a string', 400);
    }

    if (!DATE_FORMAT_REGEX.test(data.from)) {
        throw new AppError('From date must use YYYY-MM-DD format', 400);
    }

    if (!isRealDate(data.from)) {
        throw new AppError('From date is invalid', 400);
    }

    if (data.to === undefined) {
        throw new AppError('To date is required', 400);
    }

    if (typeof data.to !== 'string') {
        throw new AppError('To date must be a string', 400);
    }

    if (!DATE_FORMAT_REGEX.test(data.to)) {
        throw new AppError('To date must use YYYY-MM-DD format', 400);
    }

    if (!isRealDate(data.to)) {
        throw new AppError('To date is invalid', 400);
    }

    if (data.from > data.to) {
        throw new AppError('From date cannot be after to date', 400);
    }
};

module.exports = {
    validateSalesSummaryQuery
};