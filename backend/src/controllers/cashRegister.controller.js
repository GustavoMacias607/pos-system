const cashRegisterService = require('../services/cashRegister.service');
const asyncHandler = require('../utils/asyncHandler');

const getAllCashRegisters = asyncHandler(async (req, res) => {
    const cashRegisters = await cashRegisterService.getAllCashRegisters();

    res.json({
        success: true,
        data: cashRegisters
    });
});

const getCashRegisterById = asyncHandler(async (req, res) => {
    const cashRegister = await cashRegisterService.getCashRegisterById(req.params.id);

    res.json({
        success: true,
        data: cashRegister
    });
});

const createCashRegister = asyncHandler(async (req, res) => {
    const cashRegister = await cashRegisterService.createCashRegister(req.body);

    res.status(201).json({
        success: true,
        data: cashRegister,
        message: 'Cash register created successfully'
    });
});

const updateCashRegister = asyncHandler(async (req, res) => {
    const cashRegister = await cashRegisterService.updateCashRegister(
        req.params.id,
        req.body
    );

    res.json({
        success: true,
        data: cashRegister,
        message: 'Cash register updated successfully'
    });
});

const deactivateCashRegister = asyncHandler(async (req, res) => {
    const cashRegister = await cashRegisterService.deactivateCashRegister(req.params.id);

    res.json({
        success: true,
        data: cashRegister,
        message: 'Cash register deactivated successfully'
    });
});

const activateCashRegister = asyncHandler(async (req, res) => {
    const cashRegister = await cashRegisterService.activateCashRegister(req.params.id);

    res.json({
        success: true,
        data: cashRegister,
        message: 'Cash register activated successfully'
    });
});

module.exports = {
    getAllCashRegisters,
    getCashRegisterById,
    createCashRegister,
    updateCashRegister,
    deactivateCashRegister,
    activateCashRegister
};