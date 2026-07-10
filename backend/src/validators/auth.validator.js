const AppError = require('../errors/AppError');
const { isValidEmail } = require('./common.validator');

const validateLoginInput = (data) => {
    if (!data || typeof data !== 'object') {
        throw new AppError('Login data is required', 400);
    }

    if (data.email === undefined) {
        throw new AppError('Email is required', 400);
    }

    if (typeof data.email !== 'string') {
        throw new AppError('Email must be a string', 400);
    }

    if (data.email.trim() === '') {
        throw new AppError('Email cannot be empty', 400);
    }

    if (!isValidEmail(data.email)) {
        throw new AppError('Email format is invalid', 400);
    }

    if (data.password === undefined) {
        throw new AppError('Password is required', 400);
    }

    if (typeof data.password !== 'string') {
        throw new AppError('Password must be a string', 400);
    }

    if (data.password.trim() === '') {
        throw new AppError('Password cannot be empty', 400);
    }
};

module.exports = {
    validateLoginInput
};