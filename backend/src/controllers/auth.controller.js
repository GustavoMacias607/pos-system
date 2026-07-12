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

const setupTwoFactor = asyncHandler(async (req, res) => {
    const result = await authService.setupTwoFactor(req.user.id);

    res.json({
        success: true,
        data: result,
        message: 'Two-factor authentication setup generated successfully'
    });
});

const verifyTwoFactorSetup = asyncHandler(async (req, res) => {
    const result = await authService.verifyTwoFactorSetup(req.user.id, req.body);

    res.json({
        success: true,
        data: result,
        message: 'Two-factor authentication enabled successfully'
    });
});

const verifyTwoFactorLogin = asyncHandler(async (req, res) => {
    const result = await authService.verifyTwoFactorLogin(req.body, {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
    });

    res.json({
        success: true,
        data: result,
        message: 'Login successful'
    });
});

const disableTwoFactor = asyncHandler(async (req, res) => {
    const result = await authService.disableTwoFactor(req.user.id, req.body);

    res.json({
        success: true,
        data: result,
        message: 'Two-factor authentication disabled successfully'
    });
});
module.exports = {
    login,
    refreshAccessToken,
    logout,
    setupTwoFactor,
    verifyTwoFactorSetup,
    verifyTwoFactorLogin,
    disableTwoFactor
};