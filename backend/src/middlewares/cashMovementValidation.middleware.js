const {
    validateCreateCashMovementInput
} = require('../validators/cashMovement.validator');
const {
    validateCashSessionIdParam
} = require('../validators/cashRegisterSession.validator');

const validateCreateCashMovementData = (req, res, next) => {
    try {
        req.body = validateCreateCashMovementInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

const validateCashMovementSessionId = (req, res, next) => {
    try {
        validateCashSessionIdParam(req.params.sessionId);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateCreateCashMovementData,
    validateCashMovementSessionId
};