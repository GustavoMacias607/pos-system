const express = require('express');
const inventoryController = require('../controllers/inventory.controller');
const { validateInventoryAdjustmentData } = require('../middlewares/inventoryValidation.middleware');

const router = express.Router();

router.get('/movements', inventoryController.getMovements);
router.post('/adjustment', validateInventoryAdjustmentData, inventoryController.createAdjustment);
module.exports = router;