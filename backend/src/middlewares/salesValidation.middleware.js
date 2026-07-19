const {
    validateSaleInput,
    validateClientIdQuery
} = require('../validators/sale.validator');

const validateSaleData = (req, res, next) => {
    try {
        validateSaleInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

const validateSalesQuery = (req, res, next) => {
    try {
        if (req.query.clientId !== undefined) {
            validateClientIdQuery(req.query.clientId);
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateSaleData,
    validateSalesQuery
};