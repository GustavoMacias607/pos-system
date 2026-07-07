const { validateSaleInput } = require('../validators/sale.validator');

const validateSaleData = (req, res, next) => {
    try {
        validateSaleInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateSaleData
};