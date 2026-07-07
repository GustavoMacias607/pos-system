const express = require('express');
const categoryController = require('../controllers/category.controller');
const { validateCategoryData } = require('../middlewares/categoryValidation.middleware');

const router = express.Router();

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);
router.post('/', validateCategoryData, categoryController.createCategory);
router.put('/:id', validateCategoryData, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);
router.patch('/:id/activate', categoryController.activateCategory);

module.exports = router;