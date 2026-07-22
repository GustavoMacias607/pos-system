const {
    validateCreateCashRegisterInput,
    validateUpdateCashRegisterInput,
    validateCashRegisterIdParam
} = require('../validators/cashRegister.validator');


const validateCreateCashRegisterData = (req, res, next) => {
    try {
        validateCreateCashRegisterInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

const validateUpdateCashRegisterData = (req, res, next) => {
    try {
        validateUpdateCashRegisterInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

const validateCashRegisterId = (req, res, next) => {
    try {
        validateCashRegisterIdParam(req.params.id);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateCreateCashRegisterData,
    validateUpdateCashRegisterData,
    validateCashRegisterId
};