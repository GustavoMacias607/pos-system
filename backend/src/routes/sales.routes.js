const express = require('express');
const salesController = require('../controllers/sales.controller');
const { validateSaleData } = require('../middlewares/salesValidation.middleware');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { USER_ROLES } = require('../constants/userRoles');

const router = express.Router();

router.get(
    '/',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    salesController.getSales
);

router.post(
    '/',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR, USER_ROLES.EMPLOYEE),
    validateSaleData,
    salesController.createSale
);

router.get(
    '/:id',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    salesController.getSale
);

router.post(
    '/:id/cancel',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    salesController.cancelSale
);

module.exports = router;