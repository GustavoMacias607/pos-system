const express = require('express');
const authController = require('../controllers/auth.controller');
const {
    validateAuthData,
    validateRefreshTokenData
} = require('../middlewares/authValidation.middleware');


const router = express.Router();

router.post('/login', validateAuthData, authController.login);
router.post('/refresh', validateRefreshTokenData, authController.refreshAccessToken);
router.post('/logout', validateRefreshTokenData, authController.logout);

module.exports = router;