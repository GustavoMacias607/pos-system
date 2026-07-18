
const {
    validateCreatePurchaseInput,
    validatePurchaseIdParam
} = require('../validators/purchase.validator');



const validateCreatePurchaseData = (req, res, next) => {
    try {
        validateCreatePurchaseInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};



const validatePurchaseId = (req, res, next) => {
    try {
        validatePurchaseIdParam(req.params.id);
        next();
    } catch (error) {
        next(error);
    }
};


module.exports = {
    validateCreatePurchaseData,
    validatePurchaseId
};