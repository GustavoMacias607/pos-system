const express = require('express');
const cashRegisterSessionController = require('../controllers/cashRegisterSession.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { USER_ROLES } = require('../constants/userRoles');

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
    '/:id',
    authorizeRoles(
        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR
    ),
    cashRegisterSessionController.getSessionById
);

router.post(
    '/open',
    authorizeRoles(
        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR,
        USER_ROLES.EMPLOYEE
    ),
    cashRegisterSessionController.openSession
);

router.patch(
    '/:id/close',
    authorizeRoles(
        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR,
        USER_ROLES.EMPLOYEE
    ),
    cashRegisterSessionController.closeSession
);

module.exports = router;
