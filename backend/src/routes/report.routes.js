const express = require('express');
const reportController = require('../controllers/report.controller');
const {
    validateReportDateRangeQueryData,
    validateTopSellingProductsQueryData
} = require('../middlewares/reportValidation.middleware');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { USER_ROLES } = require('../constants/userRoles');

const router = express.Router();

router.get(
    '/sales-summary',
    authenticate,
    authorizeRoles(
        USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR
    ),
    validateReportDateRangeQueryData,
    reportController.getSalesSummary
);

router.get(
    '/sales-by-payment-method',
    authenticate,
    authorizeRoles(
        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR
    ),
    validateReportDateRangeQueryData,
    reportController.getSalesByPaymentMethod
);

router.get(
    '/sales-by-day',
    authenticate,
    authorizeRoles(
        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR
    ),
    validateReportDateRangeQueryData,
    reportController.getSalesByDay
);

router.get(
    '/top-selling-products',
    authenticate,
    authorizeRoles(
        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR
    ),
    validateTopSellingProductsQueryData,
    reportController.getTopSellingProducts
);

router.get(
    '/low-stock-products',
    authenticate,
    authorizeRoles(
        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR
    ),
    reportController.getLowStockProducts
);

router.get(
    '/purchases-by-supplier',
    authenticate,
    authorizeRoles(
        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR
    ),
    validateReportDateRangeQueryData,
    reportController.getPurchasesBySupplier
);

module.exports = router;
