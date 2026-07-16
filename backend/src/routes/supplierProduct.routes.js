const express = require('express');
const supplierProductController = require(
    '../controllers/supplierProduct.controller'
);

const {
    validateCreateSupplierProductData,
    validateUpdateSupplierProductData,
    validateSupplierProductParams
} = require(
    '../middlewares/supplierProductValidation.middleware'
);

const {
    authenticate,
    authorizeRoles
} = require('../middlewares/auth.middleware');

const { USER_ROLES } = require('../constants/userRoles');

const router = express.Router({
    mergeParams: true
});

router.get(
    '/',
    authenticate,
    authorizeRoles(
        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR,
        USER_ROLES.EMPLOYEE
    ),
    validateSupplierProductParams,
    supplierProductController.getSupplierProducts
);

router.get(
    '/:productId',
    authenticate,
    authorizeRoles(
        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR,
        USER_ROLES.EMPLOYEE
    ),
    validateSupplierProductParams,
    supplierProductController.getSupplierProduct
);

router.post(
    '/',
    authenticate,
    authorizeRoles(
        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR
    ),
    validateSupplierProductParams,
    validateCreateSupplierProductData,
    supplierProductController.createSupplierProduct
);

router.put(
    '/:productId',
    authenticate,
    authorizeRoles(
        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR
    ),
    validateSupplierProductParams,
    validateUpdateSupplierProductData,
    supplierProductController.updateSupplierProduct
);

router.delete(
    '/:productId',
    authenticate,
    authorizeRoles(
        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR
    ),
    validateSupplierProductParams,
    supplierProductController.deleteSupplierProduct
);

router.patch(
    '/:productId/activate',
    authenticate,
    authorizeRoles(
        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR
    ),
    validateSupplierProductParams,
    supplierProductController.activateSupplierProduct
);

module.exports = router;