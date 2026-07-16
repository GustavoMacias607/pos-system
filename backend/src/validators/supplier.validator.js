const { isValidEmail } = require('./common.validator');
const AppError = require('../errors/AppError');

const validateCreateSupplierInput = (data) => {

    if (!data || typeof data !== 'object') {
        throw new AppError('Supplier data is required', 400);
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
    if (data.contactName !== undefined) {
        if (typeof data.contactName !== 'string') {
            throw new AppError('Contact name must be a string', 400);
        }

        if (data.contactName.trim() === '') {
            throw new AppError('Contact name cannot be empty', 400);
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

    if (data.phone !== undefined) {
        if (typeof data.phone !== 'string') {
            throw new AppError('Phone must be a string', 400);
        }

        if (data.phone.trim() === '') {
            throw new AppError('Phone cannot be empty', 400);
        }
    }

    if (data.address !== undefined) {
        if (typeof data.address !== 'string') {
            throw new AppError('Address must be a string', 400);
        }

        if (data.address.trim() === '') {
            throw new AppError('Address cannot be empty', 400);
        }
    }
}

const validateUpdateSupplierInput = (data) => {
    if (!data || typeof data !== 'object') {
        throw new AppError('Supplier data is required', 400);
    }

    const allowedFields = ['name', 'contactName', 'email', 'phone', 'address'];

    const hasAtLeastOneField = allowedFields.some((field) =>
        Object.prototype.hasOwnProperty.call(data, field)
    );

    if (!hasAtLeastOneField) {
        throw new AppError('At least one field is required to update supplier', 400);
    }

    if (data.name !== undefined) {
        if (typeof data.name !== 'string') {
            throw new AppError('Name must be a string', 400);
        }

        if (data.name.trim() === '') {
            throw new AppError('Name cannot be empty', 400);
        }
    }

    if (data.contactName !== undefined) {
        if (typeof data.contactName !== 'string') {
            throw new AppError('Contact name must be a string', 400);
        }

        if (data.contactName.trim() === '') {
            throw new AppError('Contact name cannot be empty', 400);
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

    if (data.phone !== undefined) {
        if (typeof data.phone !== 'string') {
            throw new AppError('Phone must be a string', 400);
        }

        if (data.phone.trim() === '') {
            throw new AppError('Phone cannot be empty', 400);
        }
    }

    if (data.address !== undefined) {
        if (typeof data.address !== 'string') {
            throw new AppError('Address must be a string', 400);
        }

        if (data.address.trim() === '') {
            throw new AppError('Address cannot be empty', 400);
        }
    }
};

module.exports = {
    validateCreateSupplierInput,
    validateUpdateSupplierInput
};