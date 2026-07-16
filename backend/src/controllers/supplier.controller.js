const supplierService = require('../services/supplier.service');
const asyncHandler = require('../utils/asyncHandler');

const getAllSuppliers = asyncHandler(async (req, res) => {
    const suppliers = await supplierService.getAllSuppliers();

    res.json({
        success: true,
        data: suppliers
    });
});

const getSupplierById = asyncHandler(async (req, res) => {
    const supplier = await supplierService.getSupplierById(req.params.id);

    res.json({
        success: true,
        data: supplier
    });
});

const createSupplier = asyncHandler(async (req, res) => {
    const supplier = await supplierService.createSupplier(req.body);

    res.status(201).json({
        success: true,
        data: supplier,
        message: 'Supplier created successfully'
    });
});



const updateSupplier = asyncHandler(async (req, res) => {
    const supplier = await supplierService.updateSupplier(req.params.id, req.body);

    res.json({
        success: true,
        data: supplier,
        message: 'Supplier updated successfully'
    });
});


const deleteSupplier = asyncHandler(async (req, res) => {
    const supplier = await supplierService.deleteSupplier(req.params.id);

    res.json({
        success: true,
        data: supplier,
        message: 'Supplier deactivated successfully'
    });
});

const activateSupplier = asyncHandler(async (req, res) => {
    const supplier = await supplierService.activateSupplier(req.params.id);

    res.json({
        success: true,
        data: supplier,
        message: 'Supplier activated successfully'
    });
});

module.exports = {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    activateSupplier
};
