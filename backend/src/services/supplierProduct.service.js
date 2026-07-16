const supplierProductRepository = require(
    '../repositories/supplierProduct.repository'
);
const supplierRepository = require('../repositories/supplier.repository');
const productRepository = require('../repositories/product.repository');
const AppError = require('../errors/AppError');

const {
    validateCreateSupplierProductInput,
    validateUpdateSupplierProductInput
} = require('../validators/supplierProduct.validator');

const hasOwnProperty = (data, field) => {
    return Object.prototype.hasOwnProperty.call(data, field);
};

const normalizeSupplierProductCode = (value) => {
    if (value === undefined || value === null) {
        return null;
    }

    return value.trim();
};

const getSupplierProducts = async (supplierId) => {
    const supplier = await supplierRepository.findById(supplierId);

    if (!supplier) {
        throw new AppError('Supplier not found', 404);
    }

    return supplierProductRepository.findAllBySupplierId(supplierId);
};

const getSupplierProduct = async (supplierId, productId) => {
    const supplier = await supplierRepository.findById(supplierId);

    if (!supplier) {
        throw new AppError('Supplier not found', 404);
    }

    const supplierProduct =
        await supplierProductRepository.findBySupplierAndProduct(
            supplierId,
            productId
        );

    if (!supplierProduct) {
        throw new AppError(
            'Supplier product relationship not found',
            404
        );
    }

    return supplierProduct;
};

const createSupplierProduct = async (supplierId, data) => {
    validateCreateSupplierProductInput(data);

    const supplier = await supplierRepository.findById(supplierId);

    if (!supplier) {
        throw new AppError('Supplier not found', 404);
    }

    if (!supplier.active) {
        throw new AppError('Supplier is inactive', 409);
    }

    const product = await productRepository.findById(data.productId);

    if (!product) {
        throw new AppError('Product not found', 404);
    }

    if (!product.active) {
        throw new AppError('Product is inactive', 409);
    }

    const existingSupplierProduct =
        await supplierProductRepository.findBySupplierAndProduct(
            supplierId,
            data.productId
        );

    if (existingSupplierProduct) {
        throw new AppError(
            'Supplier product relationship already exists',
            409
        );
    }

    const normalizedCode = normalizeSupplierProductCode(
        data.supplierProductCode
    );

    if (normalizedCode !== null) {
        const supplierProductWithCode =
            await supplierProductRepository.findBySupplierAndCode(
                supplierId,
                normalizedCode
            );

        if (supplierProductWithCode) {
            throw new AppError(
                'Supplier product code already exists',
                409
            );
        }
    }

    const supplierProductData = {
        supplierId,
        productId: data.productId,
        supplierProductCode: normalizedCode,
        unitCost: data.unitCost
    };

    return supplierProductRepository.create(supplierProductData);
};

const updateSupplierProduct = async (
    supplierId,
    productId,
    data
) => {
    validateUpdateSupplierProductInput(data);

    const existingSupplierProduct = await getSupplierProduct(
        supplierId,
        productId
    );

    const hasSupplierProductCode = hasOwnProperty(
        data,
        'supplierProductCode'
    );

    const hasUnitCost = hasOwnProperty(data, 'unitCost');

    const normalizedCode = hasSupplierProductCode
        ? normalizeSupplierProductCode(data.supplierProductCode)
        : existingSupplierProduct.supplier_product_code;

    if (hasSupplierProductCode && normalizedCode !== null) {
        const supplierProductWithCode =
            await supplierProductRepository.findBySupplierAndCode(
                supplierId,
                normalizedCode
            );

        if (
            supplierProductWithCode &&
            supplierProductWithCode.id !== existingSupplierProduct.id
        ) {
            throw new AppError(
                'Supplier product code already exists',
                409
            );
        }
    }

    const updatedSupplierProductData = {
        supplierProductCode: normalizedCode,
        unitCost: hasUnitCost
            ? data.unitCost
            : Number(existingSupplierProduct.unit_cost)
    };

    return supplierProductRepository.update(
        supplierId,
        productId,
        updatedSupplierProductData
    );
};

const deleteSupplierProduct = async (
    supplierId,
    productId
) => {
    await getSupplierProduct(supplierId, productId);

    return supplierProductRepository.deactivate(
        supplierId,
        productId
    );
};

const activateSupplierProduct = async (
    supplierId,
    productId
) => {
    const supplier = await supplierRepository.findById(supplierId);

    if (!supplier) {
        throw new AppError('Supplier not found', 404);
    }

    if (!supplier.active) {
        throw new AppError('Supplier is inactive', 409);
    }

    const product = await productRepository.findById(productId);

    if (!product) {
        throw new AppError('Product not found', 404);
    }

    if (!product.active) {
        throw new AppError('Product is inactive', 409);
    }

    const supplierProduct =
        await supplierProductRepository.findBySupplierAndProduct(
            supplierId,
            productId
        );

    if (!supplierProduct) {
        throw new AppError(
            'Supplier product relationship not found',
            404
        );
    }

    return supplierProductRepository.activate(
        supplierId,
        productId
    );
};

module.exports = {
    getSupplierProducts,
    getSupplierProduct,
    createSupplierProduct,
    updateSupplierProduct,
    deleteSupplierProduct,
    activateSupplierProduct
};