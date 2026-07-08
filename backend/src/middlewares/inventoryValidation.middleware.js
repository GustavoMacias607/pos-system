const { validateInventoryAdjustmentInput, validateStockEntryInput, validateWasteInput } = require('../validators/inventory.validator');

const validateInventoryAdjustmentData = (req, res, next) => {
    try {
        validateInventoryAdjustmentInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

const validateStockEntryData = (req, res, next) => {
    try {
        validateStockEntryInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

const validateWasteData = (req, res, next) => {
    try {
        validateWasteInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateInventoryAdjustmentData,
    validateStockEntryData,
    validateWasteData
};