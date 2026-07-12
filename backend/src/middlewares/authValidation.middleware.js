const {
    validateLoginInput,
    validateRefreshTokenInput,
    validateTwoFactorTokenInput,
    validateTwoFactorLoginInput
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

module.exports = {
    validateAuthData,
    validateRefreshTokenData,
    validateTwoFactorTokenData,
    validateTwoFactorLoginData
};