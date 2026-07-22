const AppError = require('../errors/AppError');

const validateDataObject = (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new AppError('Cash register data is required', 400);
    }
};

const validateName = (name) => {
    if (typeof name !== 'string') {
        throw new AppError('Name must be a string', 400);
    }

    const normalizedName = name.trim();

    if (normalizedName === '') {
        throw new AppError('Name cannot be empty', 400);
    }

    if (normalizedName.length > 100) {
        throw new AppError('Name cannot exceed 100 characters', 400);
    }
};

const validateLocation = (location) => {
    if (location === null) {
        return;
    }

    if (typeof location !== 'string') {
        throw new AppError('Location must be a string or null', 400);
    }

    const normalizedLocation = location.trim();

    if (normalizedLocation === '') {
        throw new AppError('Location cannot be empty', 400);
    }

    if (normalizedLocation.length > 150) {
        throw new AppError('Location cannot exceed 150 characters', 400);
    }
};

const validateCreateCashRegisterInput = (data) => {
    validateDataObject(data);

    if (data.name === undefined) {
        throw new AppError('Name is required', 400);
    }

    validateName(data.name);

    if (data.location !== undefined) {
        validateLocation(data.location);
    }
};

const validateUpdateCashRegisterInput = (data) => {
    validateDataObject(data);

    const allowedFields = ['name', 'location'];
    const hasAtLeastOneField = allowedFields.some((field) =>
        Object.prototype.hasOwnProperty.call(data, field)
    );

    if (!hasAtLeastOneField) {
        throw new AppError('At least one field is required to update cash register', 400);
    }

    if (data.name !== undefined) {
        validateName(data.name);
    }

    if (data.location !== undefined) {
        validateLocation(data.location);
    }
};

const validateCashRegisterIdParam = (value) => {
    if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
        throw new AppError('Cash register ID must be a positive integer', 400);
    }
};

module.exports = {
    validateCreateCashRegisterInput,
    validateUpdateCashRegisterInput,
    validateCashRegisterIdParam
};