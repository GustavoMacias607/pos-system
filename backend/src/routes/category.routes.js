const express = require('express');
const categoryController = require('../controllers/category.controller');
const { validateCategoryData } = require('../middlewares/categoryValidation.middleware');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { USER_ROLES } = require('../constants/userRoles');

const router = express.Router();

router.get(
    '/',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR, USER_ROLES.EMPLOYEE),
    categoryController.getCategories
);

router.get(
    '/:id',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR, USER_ROLES.EMPLOYEE),
    categoryController.getCategory
);

router.post(
    '/',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    validateCategoryData,
    categoryController.createCategory
);

router.put(
    '/:id',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    validateCategoryData,
    categoryController.updateCategory
);

router.delete(
    '/:id',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    categoryController.deleteCategory
);

router.patch(
    '/:id/activate',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    categoryController.activateCategory
);

module.exports = router;