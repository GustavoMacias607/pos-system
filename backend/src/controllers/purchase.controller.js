const purchaseService = require('../services/purchase.service');
const asyncHandler = require('../utils/asyncHandler');

const getAllPurchases = asyncHandler(async (req, res) => {
    const purchases =
        await purchaseService.getAllPurchases();

    res.json({
        success: true,
        data: purchases
    });
});

const getPurchaseById = asyncHandler(async (req, res) => {
    const purchase =
        await purchaseService.getPurchaseById(
            req.params.id
        );

    res.json({
        success: true,
        data: purchase
    });
});

const createPurchase = asyncHandler(async (req, res) => {
    const purchase =
        await purchaseService.createPurchase(
            req.body,
            req.user.id
        );

    res.status(201).json({
        success: true,
        data: purchase,
        message: 'Purchase created successfully'
    });
});

const cancelPurchase = asyncHandler(async (req, res) => {
    const purchase =
        await purchaseService.cancelPurchase(
            req.params.id
        );

    res.json({
        success: true,
        data: purchase,
        message: 'Purchase cancelled successfully'
    });
});

module.exports = {
    getAllPurchases,
    getPurchaseById,
    createPurchase,
    cancelPurchase
};