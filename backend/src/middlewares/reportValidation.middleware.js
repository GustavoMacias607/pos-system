const {
    validateSalesSummaryQuery
} = require('../validators/report.validator');

const validateSalesSummaryQueryData = (req, res, next) => {
    try {
        validateSalesSummaryQuery(req.query);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateSalesSummaryQueryData
};