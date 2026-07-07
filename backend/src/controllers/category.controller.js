const categoryService = require('../services/category.service');
const asyncHandler = require('../utils/asyncHandler');

const getCategories = asyncHandler(async (req, res) => {
    const categories = await categoryService.getAllCategories();

    res.json({
        success: true,
        data: categories
    });
});

const getCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.getCategoryById(req.params.id);

    res.json({
        success: true,
        data: category
    });
});

const createCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.createCategory(req.body);

    res.status(201).json({
        success: true,
        data: category
    });
});

const updateCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.updateCategory(req.params.id, req.body);

    res.json({
        success: true,
        data: category
    });
});

const deleteCategory = asyncHandler(async (req, res) => {
    const result = await categoryService.deleteCategory(req.params.id);

    res.json({
        success: true,
        data: result,
        message: 'Category deactivated successfully'
    });
});

const activateCategory = asyncHandler(async (req, res) => {
    const result = await categoryService.activateCategory(req.params.id);

    res.json({
        success: true,
        data: result,
        message: 'Category activated successfully'
    });
});

module.exports = {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    activateCategory
};