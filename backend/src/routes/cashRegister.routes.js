const express = require('express');
const cashRegisterController = require('../controllers/cashRegister.controller');
const {
    validateCreateCashRegisterData,
    validateUpdateCashRegisterData,
    validateCashRegisterId
} = require('../middlewares/cashRegisterValidation.middleware');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { USER_ROLES } = require('../constants/userRoles');

const router = express.Router();

router.get(
    '/',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR, USER_ROLES.EMPLOYEE),
    cashRegisterController.getAllCashRegisters
);

router.get(
    '/:id',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR, USER_ROLES.EMPLOYEE),
    validateCashRegisterId,
    cashRegisterController.getCashRegisterById
);

router.post(
    '/',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    validateCreateCashRegisterData,
    cashRegisterController.createCashRegister
);

router.put(
    '/:id',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    validateCashRegisterId,
    validateUpdateCashRegisterData,
    cashRegisterController.updateCashRegister
);

router.delete(
    '/:id',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    validateCashRegisterId,
    cashRegisterController.deactivateCashRegister
);

router.patch(
    '/:id/activate',
    authenticate,
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    validateCashRegisterId,
    cashRegisterController.activateCashRegister
);

module.exports = router;