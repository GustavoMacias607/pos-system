const {
    validateLoginInput,
    validateRefreshTokenInput,
    validateTwoFactorTokenInput,
    validateTwoFactorLoginInput,
    validateGoogleLoginInput
} = require('../validators/auth.validator');

const validateAuthData = (req, res, next) => {
    try {
        validateLoginInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

const validateRefreshTokenData = (req, res, next) => {
    try {
        validateRefreshTokenInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

const validateTwoFactorTokenData = (req, res, next) => {
    try {
        validateTwoFactorTokenInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

const validateTwoFactorLoginData = (req, res, next) => {
    try {
        validateTwoFactorLoginInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

const validateGoogleLoginData = (req, res, next) => {
    try {
        validateGoogleLoginInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};


module.exports = {
    validateAuthData,
    validateRefreshTokenData,
    validateTwoFactorTokenData,
    validateTwoFactorLoginData,
    validateGoogleLoginData
};