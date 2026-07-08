const pool = require('../config/database');
const inventoryRepository = require('../repositories/inventory.repository');
const productRepository = require('../repositories/product.repository');
const { validateInventoryAdjustmentInput } = require('../validators/inventory.validator');
const AppError = require('../errors/AppError');

const getAllMovements = async () => {
    return inventoryRepository.findAllMovements();
}

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
                product.id,
                data.quantity
            );
        } else {
            updatedProduct = await productRepository.decreaseStock(
                client,
                product.id,
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

module.exports = {
    getAllMovements,
    createAdjustment
};