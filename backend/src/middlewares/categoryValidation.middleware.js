const { validateCategoryInput } = require('../validators/category.validator');

const validateCategoryData = (req, res, next) => {
    try {
        validateCategoryInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateCategoryData
};