const asyncHandler = require('../utils/asyncHandler');
const inventoryService = require('../services/inventory.service');

const getMovements = asyncHandler(async (req, res) => {
    const movements = await inventoryService.getAllMovements(req.query);
    res.json({
        success: true,
        data: movements
    });
});

const getLowStockProducts = asyncHandler(async (req, res) => {
    const products = await inventoryService.getLowStockProducts();

    res.json({
        success: true,
        data: products
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

const createStockEntry = asyncHandler(async (req, res) => {
    const result = await inventoryService.createStockEntry(req.body);

    res.status(201).json({
        success: true,
        data: result,
        message: 'Stock entry created successfully'
    })
})

const createWaste = asyncHandler(async (req, res) => {
    const result = await inventoryService.createWaste(req.body);

    res.status(201).json({
        success: true,
        data: result,
        message: 'Waste movement created successfully'
    });
});

module.exports = {
    getMovements,
    getLowStockProducts,
    createAdjustment,
    createStockEntry,
    createWaste
};