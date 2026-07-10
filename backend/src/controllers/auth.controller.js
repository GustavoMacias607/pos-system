const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');

const login = asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);

    res.json({
        success: true,
        data: result,
        message: 'Login successful'
    });
});

module.exports = {
    login
};