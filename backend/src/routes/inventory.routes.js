const express = require('express');
const inventoryController = require('../controllers/inventory.controller');

const {
    validateInventoryAdjustmentData,
    validateStockEntryData,
    validateWasteData
} = require('../middlewares/inventoryValidation.middleware');

const router = express.Router();

router.get('/movements', inventoryController.getMovements);
router.post('/adjustment', validateInventoryAdjustmentData, inventoryController.createAdjustment);
router.post('/stock-entry', validateStockEntryData, inventoryController.createStockEntry);
router.post('/waste', validateWasteData, inventoryController.createWaste);

module.exports = router;