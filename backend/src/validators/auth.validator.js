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

const validateRefreshTokenInput = (data) => {
    if (!data || typeof data !== 'object') {
        throw new AppError('Refresh token data is required', 400);
    }

    if (data.refreshToken === undefined) {
        throw new AppError('Refresh token is required', 400);
    }

    if (typeof data.refreshToken !== 'string') {
        throw new AppError('Refresh token must be a string', 400);
    }

    if (data.refreshToken.trim() === '') {
        throw new AppError('Refresh token cannot be empty', 400);
    }
};

const validateTwoFactorTokenInput = (data) => {
    if (!data || typeof data !== 'object') {
        throw new AppError('Two-factor token data is required', 400);
    }

    if (data.token === undefined) {
        throw new AppError('Two-factor token is required', 400);
    }

    if (typeof data.token !== 'string') {
        throw new AppError('Two-factor token must be a string', 400);
    }

    if (data.token.trim() === '') {
        throw new AppError('Two-factor token cannot be empty', 400);
    }

    if (!/^\d{6}$/.test(data.token)) {
        throw new AppError('Two-factor token must be a 6-digit code', 400);
    }
};

const validateTwoFactorLoginInput = (data) => {
    if (!data || typeof data !== 'object') {
        throw new AppError('Two-factor login data is required', 400);
    }

    if (data.userId === undefined) {
        throw new AppError('User id is required', 400);
    }

    if (!Number.isInteger(data.userId) || data.userId <= 0) {
        throw new AppError('User id must be a positive integer', 400);
    }

    const hasToken = data.token !== undefined;
    const hasBackupCode = data.backupCode !== undefined;

    if (!hasToken && !hasBackupCode) {
        throw new AppError('Two-factor token or backup code is required', 400);
    }

    if (hasToken && hasBackupCode) {
        throw new AppError('Use either two-factor token or backup code, not both', 400);
    }

    if (hasToken) {
        if (typeof data.token !== 'string') {
            throw new AppError('Two-factor token must be a string', 400);
        }

        if (data.token.trim() === '') {
            throw new AppError('Two-factor token cannot be empty', 400);
        }

        if (!/^\d{6}$/.test(data.token)) {
            throw new AppError('Two-factor token must be a 6-digit code', 400);
        }
    }

    if (hasBackupCode) {
        if (typeof data.backupCode !== 'string') {
            throw new AppError('Backup code must be a string', 400);
        }

        if (data.backupCode.trim() === '') {
            throw new AppError('Backup code cannot be empty', 400);
        }

        if (!/^[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}$/.test(data.backupCode)) {
            throw new AppError('Backup code must have format XXXX-XXXX', 400);
        }
    }
};

module.exports = {
    validateLoginInput,
    validateRefreshTokenInput,
    validateTwoFactorTokenInput,
    validateTwoFactorLoginInput
};