const { validateLoginInput } = require('../validators/auth.validator');

const validateAuthData = (req, res, next) => {
    try {
        validateLoginInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateAuthData
}