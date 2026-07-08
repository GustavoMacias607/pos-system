const { validateInventoryAdjustmentInput } = require('../validators/inventory.validator');

const validateInventoryAdjustmentData = (req, res, next) => {
    try {
        validateInventoryAdjustmentInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateInventoryAdjustmentData
};