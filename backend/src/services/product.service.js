const productRepository = require('../repositories/product.repository');
const categoryRepository = require('../repositories/category.repository');
const AppError = require('../errors/AppError');

const getAllProducts = async () => {
    return productRepository.findAll();
};

const getProductById = async (id) => {
    const product = await productRepository.findById(id);

    if (!product) {
        throw new AppError('Product not found', 404);
    }

    return product;
};

const createProduct = async (product) => {
    const existingProduct = await productRepository.findByName(product.name);

    if (existingProduct) {
        throw new AppError('Product already exists', 409);
    }

    await validateCategoryIfProvided(product.categoryId);

    const createdProduct = await productRepository.create(product);

    return productRepository.findById(createdProduct.id);
};

const updateProduct = async (id, product) => {
    const existingProduct = await productRepository.findByName(product.name);

    if (existingProduct && existingProduct.id !== Number(id)) {
        throw new AppError('Product name already exists', 409);
    }

    await validateCategoryIfProvided(product.categoryId);

    const updatedProduct = await productRepository.update(id, product);

    if (!updatedProduct) {
        throw new AppError('Product not found', 404);
    }

    return productRepository.findById(updatedProduct.id);
};

const deleteProduct = async (id) => {
    const deactivatedProduct = await productRepository.deactivate(id);

    if (!deactivatedProduct) {
        throw new AppError('Product not found', 404);
    }

    return productRepository.findById(deactivatedProduct.id);
};

const activateProduct = async (id) => {
    const activatedProduct = await productRepository.activate(id);

    if (!activatedProduct) {
        throw new AppError('Product not found', 404);
    }

    return productRepository.findById(activatedProduct.id);
};

const validateCategoryIfProvided = async (categoryId) => {
    if (categoryId === undefined || categoryId === null) {
        return;
    }

    const category = await categoryRepository.findById(categoryId);

    if (!category) {
        throw new AppError('Category not found', 404);
    }

    if (!category.active) {
        throw new AppError('Category is inactive', 409);
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    activateProduct
};
