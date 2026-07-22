const {
    validateOpenSessionInput,
    validateCloseSessionInput,
    validateCashSessionIdParam
} = require('../validators/cashRegisterSession.validator');


const validateOpenSessionData = (req, res, next) => {
    try {
        validateOpenSessionInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};


const validateCloseSessionData = (req, res, next) => {
    try {
        validateCloseSessionInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};


const validateCashSessionId = (req, res, next) => {
    try {
        validateCashSessionIdParam(req.params.id);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateOpenSessionData,
    validateCloseSessionData,
    validateCashSessionId
};