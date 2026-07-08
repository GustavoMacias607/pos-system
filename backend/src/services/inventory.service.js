const pool = require('../config/database');
const inventoryRepository = require('../repositories/inventory.repository');
const productRepository = require('../repositories/product.repository');
const { validateInventoryAdjustmentInput, validateStockEntryInput, validateWasteInput, validateInventoryMovementFilters } = require('../validators/inventory.validator');
const AppError = require('../errors/AppError');

const getAllMovements = async (filters) => {
    const normalizedFilters = validateInventoryMovementFilters(filters);

    return inventoryRepository.findAllMovements(normalizedFilters);
};

const getLowStockProducts = async () => {
    return productRepository.findLowStockProducts();
};

const createAdjustment = async (data) => {
    validateInventoryAdjustmentInput(data);

    const product = await productRepository.findById(data.productId);

    if (!product) {
        throw new AppError('Product not found', 404);
    }

    if (!product.active) {
        throw new AppError('Product is inactive', 409);
    }

    if (data.quantity < 0 && product.stock + data.quantity < 0) {
        throw new AppError('Insufficient stock for adjustment', 409);
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        let updatedProduct;

        if (data.quantity > 0) {
            updatedProduct = await productRepository.increaseStock(
                client,
                data.productId,
                data.quantity
            );
        } else {
            updatedProduct = await productRepository.decreaseStock(
                client,
                data.productId,
                Math.abs(data.quantity)
            );
        }

        const createdMovement = await inventoryRepository.createMovement(client, {
            productId: data.productId,
            type: 'MANUAL_ADJUSTMENT',
            quantity: data.quantity,
            reason: data.reason
        });

        await client.query('COMMIT');

        return {
            product: updatedProduct,
            movement: createdMovement
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const createStockEntry = async (data) => {
    validateStockEntryInput(data);

    const product = await productRepository.findById(data.productId);

    if (!product) {
        throw new AppError('Product not found', 404);
    }

    if (!product.active) {
        throw new AppError('Product is inactive', 409);
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const updatedProduct = await productRepository.increaseStock(
            client,
            data.productId,
            data.quantity
        );

        const createdMovement = await inventoryRepository.createMovement(client, {
            productId: data.productId,
            type: 'PURCHASE',
            quantity: data.quantity,
            reason: data.reason
        });

        await client.query('COMMIT');

        return {
            product: updatedProduct,
            movement: createdMovement
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};
const createWaste = async (data) => {
    validateWasteInput(data);

    const product = await productRepository.findById(data.productId);

    if (!product) {
        throw new AppError('Product not found', 404);
    }

    if (!product.active) {
        throw new AppError('Product is inactive', 409);
    }

    if (product.stock - data.quantity < 0) {
        throw new AppError('Insufficient stock for waste', 409);
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const updatedProduct = await productRepository.decreaseStock(
            client,
            data.productId,
            data.quantity
        );

        const createdMovement = await inventoryRepository.createMovement(client, {
            productId: data.productId,
            type: 'WASTE',
            quantity: -data.quantity,
            reason: data.reason
        });

        await client.query('COMMIT');

        return {
            product: updatedProduct,
            movement: createdMovement
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    getAllMovements,
    getLowStockProducts,
    createAdjustment,
    createStockEntry,
    createWaste
};