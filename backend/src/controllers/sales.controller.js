const salesService = require('../services/sales.service');
const asyncHandler = require('../utils/asyncHandler');

const createSale = asyncHandler(async (req, res) => {
    const sale = await salesService.createSale(req.body);

    res.status(201).json({
        success: true,
        data: sale,
        message: 'Sale created successfully'
    });
});

const cancelSale = asyncHandler(async (req, res) => {

    const result = await salesService.cancelSale(req.params.id);

    res.status(200).json({
        success: true,
        data: result,
        message: 'Sale cancelled successfully'
    });

});

const getSales = asyncHandler(async (req, res) => {
    const sales = await salesService.getAllSales(req.query.clientId);

    res.json({
        success: true,
        data: sales
    });
});

const getSale = asyncHandler(async (req, res) => {
    const sale = await salesService.getSaleById(req.params.id);

    res.json({
        success: true,
        data: sale
    });
});

module.exports = {
    createSale,
    cancelSale,
    getSales,
    getSale
};