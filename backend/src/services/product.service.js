const productRepository = require('../repositories/product.repository');
const categoryRepository = require('../repositories/category.repository');
const AppError = require('../errors/AppError');

const getAllProducts = async () => {
    return await productRepository.findAll();
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

    return productRepository.create(product);
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



    return updatedProduct;
};

const deleteProduct = async (id) => {
    const product = await productRepository.deactivate(id);

    if (!product) {
        throw new AppError('Product not found', 404);
    }

    return product;
};

const activateProduct = async (id) => {
    const product = await productRepository.activate(id);

    if (!product) {
        throw new AppError('Product not found', 404);
    }

    return product;
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

