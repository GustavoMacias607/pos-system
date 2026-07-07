const AppError = require('../errors/AppError');

const validateCategoryInput = (data) => {
    if (!data) {
        throw new AppError('Category data is required', 400);
    }
    if (!data.name) {
        throw new AppError('Category name is required', 400);
    }
    if (typeof data.name !== 'string') {
        throw new AppError('Category name must be a string', 400);
    }
    if (data.name.trim() === '') {
        throw new AppError('Category name cannot be empty', 400);
    }
    if (data.description && typeof data.description !== 'string') {
        throw new AppError('Category description must be a string', 400);
    }
}

module.exports = {
    validateCategoryInput
};