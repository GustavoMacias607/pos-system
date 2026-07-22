const express = require('express');
const cashMovementController = require('../controllers/cashMovement.controller');
const {
    validateCreateCashMovementData
} = require('../middlewares/cashMovementValidation.middleware');
const {
    authenticate,
    authorizeRoles
} = require('../middlewares/auth.middleware');
const { USER_ROLES } = require('../constants/userRoles');

const router = express.Router();

router.post(
    '/',
    authenticate,
    authorizeRoles(
        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR,
        USER_ROLES.EMPLOYEE
    ),
    validateCreateCashMovementData,
    cashMovementController.createCashMovement
);

module.exports = router;