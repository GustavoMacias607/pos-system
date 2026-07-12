const express = require('express');
const authController = require('../controllers/auth.controller');
const {
    validateAuthData,
    validateRefreshTokenData,
    validateTwoFactorTokenData,
    validateTwoFactorLoginData
} = require('../middlewares/authValidation.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/login', validateAuthData, authController.login);
router.post('/refresh', validateRefreshTokenData, authController.refreshAccessToken);
router.post('/logout', validateRefreshTokenData, authController.logout);

router.post('/2fa/setup', authenticate, authController.setupTwoFactor);
router.post(
    '/2fa/verify-setup',
    authenticate,
    validateTwoFactorTokenData,
    authController.verifyTwoFactorSetup
);
router.post(
    '/2fa/verify-login',
    validateTwoFactorLoginData,
    authController.verifyTwoFactorLogin
);

router.post(
    '/2fa/disable',
    authenticate,
    validateTwoFactorTokenData,
    authController.disableTwoFactor
);


module.exports = router;