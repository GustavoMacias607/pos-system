const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');


const login = asyncHandler(async (req, res) => {
    const result = await authService.login(req.body, {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
    });

    res.json({
        success: true,
        data: result,
        message: 'Login successful'
    });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const result = await authService.refreshAccessToken(req.body);

    res.json({
        success: true,
        data: result,
        message: 'Access token refreshed successfully'
    });
});

const logout = asyncHandler(async (req, res) => {
    await authService.logout(req.body);

    res.json({
        success: true,
        message: 'Logout successful'
    });
});

module.exports = {
    login,
    refreshAccessToken,
    logout
};