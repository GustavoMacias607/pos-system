const express = require('express');
const reportController = require('../controllers/report.controller');
const {
    validateSalesSummaryQueryData
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
    validateSalesSummaryQueryData,
    reportController.getSalesSummary
);

module.exports = router;