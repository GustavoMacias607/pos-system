const cashMovementService = require('../services/cashMovement.service');
const asyncHandler = require('../utils/asyncHandler');

const createCashMovement = asyncHandler(async (req, res) => {
    const movement = await cashMovementService.createCashMovement(
        req.body,
        req.user
    );

    res.status(201).json({
        message: 'Cash movement created successfully',
        data: movement
    });
});

const getMovementsBySessionId = asyncHandler(async (req, res) => {
    const sessionId = Number(req.params.sessionId);

    const movements =
        await cashMovementService.getMovementsBySessionId(sessionId);

    res.status(200).json({
        data: movements
    });
});

module.exports = {
    createCashMovement,
    getMovementsBySessionId
};