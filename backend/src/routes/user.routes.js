const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { USER_ROLES } = require('../constants/userRoles');
const {
    validateCreateUserData,
    validateUpdateUserData
} = require('../middlewares/userValidation.middleware');

const router = express.Router();

router.get(
    '/',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN),
    userController.getUsers
);

router.get(
    '/:id',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN),
    userController.getUser
);

router.post(
    '/',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN),
    validateCreateUserData,
    userController.createUser
);

router.put(
    '/:id',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN),
    validateUpdateUserData,
    userController.updateUser
);

router.delete(
    '/:id',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN),
    userController.deleteUser
);

router.patch(
    '/:id/activate',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN),
    userController.activateUser
);

module.exports = router;