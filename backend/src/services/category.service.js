const categoryRepository = require('../repositories/category.repository');
const { validateCategoryInput } = require('../validators/category.validator');
const AppError = require('../errors/AppError');

const getAllCategories = async () => {
    return categoryRepository.findAll();
}

const getCategoryById = async (id) => {
    const category = await categoryRepository.findById(id);

    if (!category) {
        throw new AppError('Category not found', 404);
    }
    return category;
}

const createCategory = async (category) => {
    validateCategoryInput(category);

    const existingCategory = await categoryRepository.findByName(category.name);

    if (existingCategory) {
        throw new AppError('Category already exists', 409);
    }
    return await categoryRepository.create(category);
}

const updateCategory = async (id, category) => {
    validateCategoryInput(category);
    const existingCategory = await categoryRepository.findByName(category.name);

    if (existingCategory && existingCategory.id !== Number(id)) {
        throw new AppError('Category name already exists', 409);
    }

    const updatedCategory = await categoryRepository.update(id, category);

    if (!updatedCategory) {
        throw new AppError('Category not found', 404);
    }

    return updatedCategory;
};

const deleteCategory = async (id) => {
    const category = await categoryRepository.deactivate(id);
    if (!category) {
        throw new AppError('Category not found', 404);
    }
    return category;
}

const activateCategory = async (id) => {
    const category = await categoryRepository.activate(id);
    if (!category) {
        throw new AppError('Category not found', 404);
    }
    return category;
}

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    activateCategory
}