const {
    validateCreateSupplierInput,
    validateUpdateSupplierInput
} = require('../validators/supplier.validator');

const validateCreateSupplierData = (req, res, next) => {
    try {
        validateCreateSupplierInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

const validateUpdateSupplierData = (req, res, next) => {
    try {
        validateUpdateSupplierInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateCreateSupplierData,
    validateUpdateSupplierData
};