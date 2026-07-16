const express = require('express');
const supplierController = require('../controllers/supplier.controller');

const {
    validateCreateSupplierData,
    validateUpdateSupplierData
} = require('../middlewares/supplierValidation.middleware');

const {
    authenticate,
    authorizeRoles
} = require('../middlewares/auth.middleware');

const { USER_ROLES } = require('../constants/userRoles');

const router = express.Router();

router.get(
    '/',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR, USER_ROLES.EMPLOYEE),
    supplierController.getAllSuppliers
);

router.get(
    '/:id',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR, USER_ROLES.EMPLOYEE),
    supplierController.getSupplierById
);

router.post(
    '/',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR, USER_ROLES.EMPLOYEE),
    validateCreateSupplierData,
    supplierController.createSupplier
);

router.put(
    '/:id',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR, USER_ROLES.EMPLOYEE),
    validateUpdateSupplierData,
    supplierController.updateSupplier
);

router.delete(
    '/:id',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    supplierController.deleteSupplier
);

router.patch(
    '/:id/activate',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    supplierController.activateSupplier
);

module.exports = router;