const express = require('express');
const inventoryController = require('../controllers/inventory.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { USER_ROLES } = require('../constants/userRoles');

const {
    validateInventoryAdjustmentData,
    validateStockEntryData,
    validateWasteData
} = require('../middlewares/inventoryValidation.middleware');

const router = express.Router();

router.get(
    '/movements',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    inventoryController.getMovements
);

router.get(
    '/low-stock',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR, USER_ROLES.EMPLOYEE),
    inventoryController.getLowStockProducts
);

router.post(
    '/adjustment',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    validateInventoryAdjustmentData,
    inventoryController.createAdjustment
);

router.post(
    '/stock-entry',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    validateStockEntryData,
    inventoryController.createStockEntry
);

router.post(
    '/waste',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    validateWasteData,
    inventoryController.createWaste
);

module.exports = router;