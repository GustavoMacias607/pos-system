const productService = require('../services/product.service');
const asyncHandler = require('../utils/asyncHandler');

const getProducts = asyncHandler(async (req, res) => {
    const products = await productService.getAllProducts();
    res.json({
        success: true,
        data: products
    });
});

const getProduct = asyncHandler(async (req, res) => {
    const product = await productService.getProductById(req.params.id);

    res.json({
        success: true,
        data: product
    });
});


const createProduct = asyncHandler(async (req, res) => {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
        success: true,
        data: product
    });
});

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);
    res.json({
        success: true,
        data: product
    });


});

const deleteProduct = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const product = await productService.deleteProduct(id);

    res.status(200).json({
        success: true,
        data: product,
        message: 'Product deleted successfully'
    });

});

const activateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await productService.activateProduct(id);
    res.status(200).json({
        success: true,
        data: product,
        message: 'Product activated successfully'
    });

});


module.exports = {
    getProducts,
    createProduct,
    getProduct,
    updateProduct,
    deleteProduct,
    activateProduct
};
