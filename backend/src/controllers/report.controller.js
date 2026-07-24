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

module.exports = {
    getSalesSummary,
    getSalesByPaymentMethod
};
