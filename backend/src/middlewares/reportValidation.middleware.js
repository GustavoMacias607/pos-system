const {
    validateReportDateRangeQuery,
    validateTopSellingProductsQuery
} = require('../validators/report.validator');

const validateReportDateRangeQueryData = (req, res, next) => {
    try {
        validateReportDateRangeQuery(req.query);
        next();
    } catch (error) {
        next(error);
    }
};

const validateTopSellingProductsQueryData = (req, res, next) => {
    try {
        validateTopSellingProductsQuery(req.query);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateReportDateRangeQueryData,
    validateTopSellingProductsQueryData
};
