const express = require('express');
const productController = require('../controllers/product.controller');
const { validateProductData } = require('../middlewares/productValidation.middleware');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { USER_ROLES } = require('../constants/userRoles');

const router = express.Router();

router.get(
    '/',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR, USER_ROLES.EMPLOYEE),
    productController.getProducts
);

router.get(
    '/:id',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR, USER_ROLES.EMPLOYEE),
    productController.getProduct
);

router.post(
    '/',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    validateProductData,
    productController.createProduct
);

router.put(
    '/:id',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    validateProductData,
    productController.updateProduct
);

router.patch(
    '/:id/activate',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    productController.activateProduct
);

router.delete(
    '/:id',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    productController.deleteProduct
);

module.exports = router;