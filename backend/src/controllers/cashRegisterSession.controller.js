const cashRegisterSessionService = require('../services/cashRegisterSession.service');
const asyncHandler = require('../utils/asyncHandler');

const getAllSessions = asyncHandler(async (req, res) => {
    const result = await cashRegisterSessionService.getAllSessions();

    res.json({
        success: true,
        data: result
    });
});

const getSessionById = asyncHandler(async (req, res) => {
    const result = await cashRegisterSessionService.getSessionById(req.params.id);

    res.json({
        success: true,
        data: result
    });
});

const getCurrentSession = asyncHandler(async (req, res) => {
    const result = await cashRegisterSessionService.getCurrentSession(req.user.id);

    res.json({
        success: true,
        data: result
    });
});

const openSession = asyncHandler(async (req, res) => {
    const result = await cashRegisterSessionService.openSession(
        req.body,
        req.user.id
    );

    res.status(201).json({
        success: true,
        data: result,
        message: 'Cash session opened successfully'
    });
});

const closeSession = asyncHandler(async (req, res) => {
    const result = await cashRegisterSessionService.closeSession(
        req.params.id,
        req.body,
        req.user
    );

    res.status(200).json({
        success: true,
        data: result,
        message: 'Cash session closed successfully'
    });
});

module.exports = {
    getAllSessions,
    getSessionById,
    getCurrentSession,
    openSession,
    closeSession
};