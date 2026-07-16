const supplierProductService = require(
    '../services/supplierProduct.service'
);
const asyncHandler = require('../utils/asyncHandler');

const getSupplierProducts = asyncHandler(async (req, res) => {
    const supplierProducts =
        await supplierProductService.getSupplierProducts(
            req.params.supplierId
        );

    res.json({
        success: true,
        data: supplierProducts
    });
});

const getSupplierProduct = asyncHandler(async (req, res) => {
    const supplierProduct =
        await supplierProductService.getSupplierProduct(
            req.params.supplierId,
            req.params.productId
        );

    res.json({
        success: true,
        data: supplierProduct
    });
});

const createSupplierProduct = asyncHandler(async (req, res) => {
    const supplierProduct =
        await supplierProductService.createSupplierProduct(
            req.params.supplierId,
            req.body
        );

    res.status(201).json({
        success: true,
        data: supplierProduct,
        message: 'Supplier product relationship created successfully'
    });
});

const updateSupplierProduct = asyncHandler(async (req, res) => {
    const supplierProduct =
        await supplierProductService.updateSupplierProduct(
            req.params.supplierId,
            req.params.productId,
            req.body
        );

    res.json({
        success: true,
        data: supplierProduct,
        message: 'Supplier product relationship updated successfully'
    });
});

const deleteSupplierProduct = asyncHandler(async (req, res) => {
    const supplierProduct =
        await supplierProductService.deleteSupplierProduct(
            req.params.supplierId,
            req.params.productId
        );

    res.json({
        success: true,
        data: supplierProduct,
        message: 'Supplier product relationship deactivated successfully'
    });
});

const activateSupplierProduct = asyncHandler(async (req, res) => {
    const supplierProduct =
        await supplierProductService.activateSupplierProduct(
            req.params.supplierId,
            req.params.productId
        );

    res.json({
        success: true,
        data: supplierProduct,
        message: 'Supplier product relationship activated successfully'
    });
});

module.exports = {
    getSupplierProducts,
    getSupplierProduct,
    createSupplierProduct,
    updateSupplierProduct,
    deleteSupplierProduct,
    activateSupplierProduct
};