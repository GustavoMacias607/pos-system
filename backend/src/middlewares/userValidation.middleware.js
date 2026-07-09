const { validateCreateUserInput, validateUpdateUserInput } = require('../validators/user.validator');


const validateCreateUserData = (req, res, next) => {
    try {
        validateCreateUserInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

const validateUpdateUserData = (req, res, next) => {
    try {
        validateUpdateUserInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateCreateUserData,
    validateUpdateUserData
};