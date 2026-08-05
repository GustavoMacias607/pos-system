const {
    validateProductInput
} = require('../validators/product.validator');

const validateProductData = (req, res, next) => {
    try {
        validateProductInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateProductData
};
