const asyncHandler = require('../utils/asyncHandler');
const inventoryService = require('../services/inventory.service');

const getMovements = asyncHandler(async (req, res) => {
    const movements = await inventoryService.getAllMovements();
    res.json({
        success: true,
        data: movements
    });
});

const createAdjustment = asyncHandler(async (req, res) => {
    const result = await inventoryService.createAdjustment(req.body);

    res.status(201).json({
        success: true,
        data: result,
        message: 'Inventory adjustment created successfully'
    });
});

module.exports = {
    getMovements,
    createAdjustment
};