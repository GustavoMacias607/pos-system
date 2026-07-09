const { USER_ROLE_VALUES } = require('../constants/userRoles');
const AppError = require('../errors/AppError');

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateCreateUserInput = (data) => {
    if (!data || typeof data !== 'object') {
        throw new AppError('User data is required', 400);
    }

    if (data.name === undefined) {
        throw new AppError('Name is required', 400);
    }

    if (typeof data.name !== 'string') {
        throw new AppError('Name must be a string', 400);
    }

    if (data.name.trim() === '') {
        throw new AppError('Name cannot be empty', 400);
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

    if (data.password.length < 6) {
        throw new AppError('Password must have at least 6 characters', 400);
    }

    if (data.role === undefined) {
        throw new AppError('Role is required', 400);
    }

    if (typeof data.role !== 'string') {
        throw new AppError('Role must be a string', 400);
    }

    if (data.role.trim() === '') {
        throw new AppError('Role cannot be empty', 400);
    }

    if (!USER_ROLE_VALUES.includes(data.role)) {
        throw new AppError('Invalid user role', 400);
    }
};

const validateUpdateUserInput = (data) => {
    if (!data || typeof data !== 'object') {
        throw new AppError('User data is required', 400);
    }

    const allowedFields = ['name', 'email', 'password', 'role'];

    const hasAtLeastOneField = allowedFields.some((field) =>
        Object.prototype.hasOwnProperty.call(data, field)
    );

    if (!hasAtLeastOneField) {
        throw new AppError('At least one field is required to update user', 400);
    }

    if (data.name !== undefined) {
        if (typeof data.name !== 'string') {
            throw new AppError('Name must be a string', 400);
        }

        if (data.name.trim() === '') {
            throw new AppError('Name cannot be empty', 400);
        }
    }

    if (data.email !== undefined) {
        if (typeof data.email !== 'string') {
            throw new AppError('Email must be a string', 400);
        }

        if (data.email.trim() === '') {
            throw new AppError('Email cannot be empty', 400);
        }

        if (!isValidEmail(data.email)) {
            throw new AppError('Email format is invalid', 400);
        }
    }

    if (data.password !== undefined) {
        if (typeof data.password !== 'string') {
            throw new AppError('Password must be a string', 400);
        }

        if (data.password.trim() === '') {
            throw new AppError('Password cannot be empty', 400);
        }

        if (data.password.length < 6) {
            throw new AppError('Password must have at least 6 characters', 400);
        }
    }

    if (data.role !== undefined) {
        if (typeof data.role !== 'string') {
            throw new AppError('Role must be a string', 400);
        }

        if (data.role.trim() === '') {
            throw new AppError('Role cannot be empty', 400);
        }

        if (!USER_ROLE_VALUES.includes(data.role)) {
            throw new AppError('Invalid user role', 400);
        }
    }
};

module.exports = {
    validateCreateUserInput,
    validateUpdateUserInput,
};