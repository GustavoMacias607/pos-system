const { validateLoginInput, validateRefreshTokenInput } = require('../validators/auth.validator');

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

module.exports = {
    validateAuthData,
    validateRefreshTokenData
};