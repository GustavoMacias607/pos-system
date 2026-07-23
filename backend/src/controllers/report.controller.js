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

module.exports = {
    getSalesSummary
};