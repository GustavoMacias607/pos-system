const {
    validateCreateClientInput,
    validateUpdateClientInput
} = require('../validators/client.validator');

const validateCreateClientData = (req, res, next) => {
    try {
        validateCreateClientInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

const validateUpdateClientData = (req, res, next) => {
    try {
        validateUpdateClientInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateCreateClientData,
    validateUpdateClientData
};