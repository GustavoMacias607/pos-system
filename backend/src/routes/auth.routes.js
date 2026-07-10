const express = require('express');
const authController = require('../controllers/auth.controller');
const { validateAuthData } = require('../middlewares/authValidation.middleware');


const router = express.Router();

router.post('/login', validateAuthData, authController.login);

module.exports = router;