const reportService = require('../services/report.service');
const asyncHandler = require('../utils/asyncHandler');

const getSalesSummary = asyncHandler(async (req, res) => {
    const { from, to } = req.query;

    const summary = await reportService.getSalesSummary(from, to);

    res.status(200).json({
        success: true,
        data: summary
    });
});

const getSalesByPaymentMethod = asyncHandler(async (req, res) => {
    const { from, to } = req.query;

    const report = await reportService.getSalesByPaymentMethod(from, to);

    res.status(200).json({
        success: true,
        data: report
    });
});

const getSalesByDay = asyncHandler(async (req, res) => {
    const { from, to } = req.query;

    const report = await reportService.getSalesByDay(from, to);

    res.status(200).json({
        success: true,
        data: report
    });
});

const getTopSellingProducts = asyncHandler(async (req, res) => {
    const { from, to, limit } = req.query;

    const report = await reportService.getTopSellingProducts(
        from,
        to,
        limit
    );

    res.status(200).json({
        success: true,
        data: report
    });
});

const getLowStockProducts = asyncHandler(async (req, res) => {
    const report = await reportService.getLowStockProducts();

    res.status(200).json({
        success: true,
        data: report
    });
});

const getPurchasesBySupplier = asyncHandler(async (req, res) => {
    const { from, to } = req.query;

    const report = await reportService.getPurchasesBySupplier(from, to);

    res.status(200).json({
        success: true,
        data: report
    });
});

module.exports = {
    getSalesSummary,
    getSalesByPaymentMethod,
    getSalesByDay,
    getTopSellingProducts,
    getLowStockProducts,
    getPurchasesBySupplier
};
