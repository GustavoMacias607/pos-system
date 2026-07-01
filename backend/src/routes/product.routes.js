const express = require('express');
const productController = require('../controllers/product.controller');
const { validateProductData } = require('../middlewares/productValidation.middleware');

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.post('/', validateProductData, productController.createProduct);
router.put('/:id', validateProductData, productController.updateProduct);
router.patch('/:id/activate', productController.activateProduct);
router.delete('/:id', productController.deleteProduct);
module.exports = router; 