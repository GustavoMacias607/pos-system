const express = require('express');
const purchaseController = require('../controllers/purchase.controller');

const {
    validateCreatePurchaseData,
    validatePurchaseId
} = require('../middlewares/purchaseValidation.middleware');

const {
    authenticate,
    authorizeRoles
} = require('../middlewares/auth.middleware');

const { USER_ROLES } = require('../constants/userRoles');

const router = express.Router();

router.get(
    '/',
    authenticate,
    authorizeRoles(
        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR
    ),
    purchaseController.getAllPurchases
);

router.get(
    '/:id',
    authenticate,
    authorizeRoles(
        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR
    ),
    validatePurchaseId,
    purchaseController.getPurchaseById
);

router.post(
    '/',
    authenticate,
    authorizeRoles(
        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR
    ),
    validateCreatePurchaseData,
    purchaseController.createPurchase
);

router.patch(
    '/:id/cancel',
    authenticate,
    authorizeRoles(
        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR
    ),
    validatePurchaseId,
    purchaseController.cancelPurchase
);

module.exports = router;