const express = require('express');
const cashRegisterSessionController = require('../controllers/cashRegisterSession.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { USER_ROLES } = require('../constants/userRoles');
const cashMovementController = require('../controllers/cashMovement.controller');
const {
    validateCashMovementSessionId
} = require('../middlewares/cashMovementValidation.middleware');
const {
    validateOpenSessionData,
    validateCloseSessionData,
    validateCashSessionId
} = require('../middlewares/cashRegisterSessionValidation.middleware');

const router = express.Router();

router.use(authenticate);

router.get(
    '/',
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    cashRegisterSessionController.getAllSessions
);

router.get(
    '/current',
    authorizeRoles(
        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR,
        USER_ROLES.EMPLOYEE
    ),
    cashRegisterSessionController.getCurrentSession
);

router.get(
    '/:sessionId/movements',
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    validateCashMovementSessionId,
    cashMovementController.getMovementsBySessionId
);

router.get(
    '/:id',
    authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
    validateCashSessionId,
    cashRegisterSessionController.getSessionById
);

router.post(
    '/open',
    authorizeRoles(
        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR,
        USER_ROLES.EMPLOYEE
    ),
    validateOpenSessionData,
    cashRegisterSessionController.openSession
);

router.patch(
    '/:id/close',
    authorizeRoles(
        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR,
        USER_ROLES.EMPLOYEE
    ),
    validateCashSessionId,
    validateCloseSessionData,
    cashRegisterSessionController.closeSession
);

module.exports = router;
