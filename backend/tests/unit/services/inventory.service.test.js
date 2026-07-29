jest.mock('../../../src/config/database', () => ({
    connect: jest.fn()
}));

jest.mock('../../../src/repositories/inventory.repository', () => ({
    findAllMovements: jest.fn(),
    createMovement: jest.fn()
}));

jest.mock('../../../src/repositories/product.repository', () => ({
    findLowStockProducts: jest.fn(),
    findById: jest.fn(),
    increaseStock: jest.fn(),
    decreaseStock: jest.fn()
}));

const pool = require('../../../src/config/database');
const inventoryRepository =
    require('../../../src/repositories/inventory.repository');
const productRepository =
    require('../../../src/repositories/product.repository');

const {
    getAllMovements,
    getLowStockProducts,
    createAdjustment,
    createStockEntry,
    createWaste
} = require('../../../src/services/inventory.service');

describe('inventory.service', () => {
    let transactionClient;

    beforeEach(() => {
        jest.resetAllMocks();

        transactionClient = {
            query: jest.fn().mockResolvedValue(),
            release: jest.fn()
        };

        pool.connect.mockResolvedValue(transactionClient);
    });

    describe('getAllMovements', () => {
        it('normalizes filters and returns inventory movements', async () => {
            const filters = {
                type: 'SALE',
                productId: '5'
            };

            const movements = [
                {
                    id: 1,
                    product_id: 5,
                    type: 'SALE',
                    quantity: -2,
                    reason: 'Sale #10'
                }
            ];

            inventoryRepository.findAllMovements.mockResolvedValue(
                movements
            );

            const result = await getAllMovements(filters);

            expect(
                inventoryRepository.findAllMovements
            ).toHaveBeenCalledWith({
                type: 'SALE',
                productId: 5
            });

            expect(result).toEqual(movements);
        });

        it('rejects invalid movement filters', async () => {
            const filters = {
                type: 'INVALID'
            };

            await expect(
                getAllMovements(filters)
            ).rejects.toMatchObject({
                message: 'Invalid movement type',
                statusCode: 400
            });

            expect(
                inventoryRepository.findAllMovements
            ).not.toHaveBeenCalled();
        });
    });

    describe('getLowStockProducts', () => {
        it('returns products with low stock', async () => {
            const products = [
                {
                    id: 1,
                    name: 'Keyboard',
                    stock: 2,
                    min_stock: 5
                },
                {
                    id: 2,
                    name: 'Mouse',
                    stock: 1,
                    min_stock: 3
                }
            ];

            productRepository.findLowStockProducts.mockResolvedValue(
                products
            );

            const result = await getLowStockProducts();

            expect(
                productRepository.findLowStockProducts
            ).toHaveBeenCalledTimes(1);

            expect(result).toEqual(products);
        });
    });

    describe('createAdjustment', () => {
        it('creates a positive inventory adjustment', async () => {
            const adjustmentInput = {
                productId: 1,
                quantity: 5,
                reason: 'Inventory recount'
            };

            const product = {
                id: 1,
                name: 'Keyboard',
                stock: 10,
                active: true
            };

            const updatedProduct = {
                ...product,
                stock: 15
            };

            const createdMovement = {
                id: 1,
                product_id: 1,
                type: 'MANUAL_ADJUSTMENT',
                quantity: 5,
                reason: 'Inventory recount'
            };

            productRepository.findById.mockResolvedValue(product);
            productRepository.increaseStock.mockResolvedValue(
                updatedProduct
            );
            inventoryRepository.createMovement.mockResolvedValue(
                createdMovement
            );

            const result = await createAdjustment(adjustmentInput);

            expect(productRepository.findById).toHaveBeenCalledWith(1);

            expect(
                productRepository.increaseStock
            ).toHaveBeenCalledWith(
                transactionClient,
                1,
                5
            );

            expect(
                productRepository.decreaseStock
            ).not.toHaveBeenCalled();

            expect(
                inventoryRepository.createMovement
            ).toHaveBeenCalledWith(
                transactionClient,
                {
                    productId: 1,
                    type: 'MANUAL_ADJUSTMENT',
                    quantity: 5,
                    reason: 'Inventory recount'
                }
            );

            expect(transactionClient.query.mock.calls).toEqual([
                ['BEGIN'],
                ['COMMIT']
            ]);

            expect(
                transactionClient.release
            ).toHaveBeenCalledTimes(1);

            expect(result).toEqual({
                product: updatedProduct,
                movement: createdMovement
            });
        });

        it('creates a negative inventory adjustment', async () => {
            const adjustmentInput = {
                productId: 1,
                quantity: -3,
                reason: 'Inventory recount'
            };

            const product = {
                id: 1,
                name: 'Keyboard',
                stock: 10,
                active: true
            };

            const updatedProduct = {
                ...product,
                stock: 7
            };

            const createdMovement = {
                id: 2,
                product_id: 1,
                type: 'MANUAL_ADJUSTMENT',
                quantity: -3,
                reason: 'Inventory recount'
            };

            productRepository.findById.mockResolvedValue(product);
            productRepository.decreaseStock.mockResolvedValue(
                updatedProduct
            );
            inventoryRepository.createMovement.mockResolvedValue(
                createdMovement
            );

            const result = await createAdjustment(adjustmentInput);

            expect(productRepository.findById).toHaveBeenCalledWith(1);

            expect(
                productRepository.decreaseStock
            ).toHaveBeenCalledWith(
                transactionClient,
                1,
                3
            );

            expect(
                productRepository.increaseStock
            ).not.toHaveBeenCalled();

            expect(
                inventoryRepository.createMovement
            ).toHaveBeenCalledWith(
                transactionClient,
                {
                    productId: 1,
                    type: 'MANUAL_ADJUSTMENT',
                    quantity: -3,
                    reason: 'Inventory recount'
                }
            );

            expect(transactionClient.query.mock.calls).toEqual([
                ['BEGIN'],
                ['COMMIT']
            ]);

            expect(
                transactionClient.release
            ).toHaveBeenCalledTimes(1);

            expect(result).toEqual({
                product: updatedProduct,
                movement: createdMovement
            });
        });

        it('rejects the adjustment when the product does not exist', async () => {
            productRepository.findById.mockResolvedValue(undefined);

            await expect(
                createAdjustment({
                    productId: 1,
                    quantity: 5,
                    reason: 'Inventory recount'
                })
            ).rejects.toMatchObject({
                message: 'Product not found',
                statusCode: 404
            });

            expect(productRepository.findById).toHaveBeenCalledWith(1);
            expect(pool.connect).not.toHaveBeenCalled();

            expect(
                inventoryRepository.createMovement
            ).not.toHaveBeenCalled();
        });

        it('rejects the adjustment when the product is inactive', async () => {
            productRepository.findById.mockResolvedValue({
                id: 1,
                name: 'Keyboard',
                stock: 10,
                active: false
            });

            await expect(
                createAdjustment({
                    productId: 1,
                    quantity: 5,
                    reason: 'Inventory recount'
                })
            ).rejects.toMatchObject({
                message: 'Product is inactive',
                statusCode: 409
            });

            expect(pool.connect).not.toHaveBeenCalled();

            expect(
                productRepository.increaseStock
            ).not.toHaveBeenCalled();

            expect(
                productRepository.decreaseStock
            ).not.toHaveBeenCalled();
        });

        it('rejects a negative adjustment when stock is insufficient', async () => {
            productRepository.findById.mockResolvedValue({
                id: 1,
                name: 'Keyboard',
                stock: 2,
                active: true
            });

            await expect(
                createAdjustment({
                    productId: 1,
                    quantity: -3,
                    reason: 'Inventory recount'
                })
            ).rejects.toMatchObject({
                message: 'Insufficient stock for adjustment',
                statusCode: 409
            });

            expect(pool.connect).not.toHaveBeenCalled();

            expect(
                productRepository.decreaseStock
            ).not.toHaveBeenCalled();

            expect(
                inventoryRepository.createMovement
            ).not.toHaveBeenCalled();
        });

        it('rolls back when an error occurs during the transaction', async () => {
            const databaseError = new Error('Database failure');

            productRepository.findById.mockResolvedValue({
                id: 1,
                name: 'Keyboard',
                stock: 10,
                active: true
            });

            productRepository.increaseStock.mockRejectedValue(
                databaseError
            );

            await expect(
                createAdjustment({
                    productId: 1,
                    quantity: 5,
                    reason: 'Inventory recount'
                })
            ).rejects.toBe(databaseError);

            expect(transactionClient.query.mock.calls).toEqual([
                ['BEGIN'],
                ['ROLLBACK']
            ]);

            expect(
                transactionClient.release
            ).toHaveBeenCalledTimes(1);

            expect(
                inventoryRepository.createMovement
            ).not.toHaveBeenCalled();
        });
    });

    describe('createStockEntry', () => {
        it('creates a stock entry successfully', async () => {
            const stockEntryInput = {
                productId: 1,
                quantity: 5,
                reason: 'Supplier purchase'
            };

            const product = {
                id: 1,
                name: 'Keyboard',
                stock: 10,
                active: true
            };

            const updatedProduct = {
                ...product,
                stock: 15
            };

            const createdMovement = {
                id: 3,
                product_id: 1,
                type: 'PURCHASE',
                quantity: 5,
                reason: 'Supplier purchase'
            };

            productRepository.findById.mockResolvedValue(product);
            productRepository.increaseStock.mockResolvedValue(
                updatedProduct
            );
            inventoryRepository.createMovement.mockResolvedValue(
                createdMovement
            );

            const result = await createStockEntry(stockEntryInput);

            expect(productRepository.findById).toHaveBeenCalledWith(1);

            expect(
                productRepository.increaseStock
            ).toHaveBeenCalledWith(
                transactionClient,
                1,
                5
            );

            expect(
                productRepository.decreaseStock
            ).not.toHaveBeenCalled();

            expect(
                inventoryRepository.createMovement
            ).toHaveBeenCalledWith(
                transactionClient,
                {
                    productId: 1,
                    type: 'PURCHASE',
                    quantity: 5,
                    reason: 'Supplier purchase'
                }
            );

            expect(transactionClient.query.mock.calls).toEqual([
                ['BEGIN'],
                ['COMMIT']
            ]);

            expect(
                transactionClient.release
            ).toHaveBeenCalledTimes(1);

            expect(result).toEqual({
                product: updatedProduct,
                movement: createdMovement
            });
        });

        it('rejects the stock entry when the product does not exist', async () => {
            productRepository.findById.mockResolvedValue(undefined);

            await expect(
                createStockEntry({
                    productId: 1,
                    quantity: 5,
                    reason: 'Supplier purchase'
                })
            ).rejects.toMatchObject({
                message: 'Product not found',
                statusCode: 404
            });

            expect(productRepository.findById).toHaveBeenCalledWith(1);
            expect(pool.connect).not.toHaveBeenCalled();

            expect(
                productRepository.increaseStock
            ).not.toHaveBeenCalled();

            expect(
                inventoryRepository.createMovement
            ).not.toHaveBeenCalled();
        });

        it('rejects the stock entry when the product is inactive', async () => {
            productRepository.findById.mockResolvedValue({
                id: 1,
                name: 'Keyboard',
                stock: 10,
                active: false
            });

            await expect(
                createStockEntry({
                    productId: 1,
                    quantity: 5,
                    reason: 'Supplier purchase'
                })
            ).rejects.toMatchObject({
                message: 'Product is inactive',
                statusCode: 409
            });

            expect(pool.connect).not.toHaveBeenCalled();

            expect(
                productRepository.increaseStock
            ).not.toHaveBeenCalled();

            expect(
                inventoryRepository.createMovement
            ).not.toHaveBeenCalled();
        });

        it('rolls back when an error occurs during the transaction', async () => {
            const stockEntryInput = {
                productId: 1,
                quantity: 5,
                reason: 'Supplier purchase'
            };

            const databaseError = new Error('Database failure');

            productRepository.findById.mockResolvedValue({
                id: 1,
                name: 'Keyboard',
                stock: 10,
                active: true
            });

            productRepository.increaseStock.mockRejectedValue(
                databaseError
            );

            await expect(
                createStockEntry(stockEntryInput)
            ).rejects.toBe(databaseError);

            expect(transactionClient.query.mock.calls).toEqual([
                ['BEGIN'],
                ['ROLLBACK']
            ]);

            expect(
                transactionClient.release
            ).toHaveBeenCalledTimes(1);

            expect(
                inventoryRepository.createMovement
            ).not.toHaveBeenCalled();
        });
    });

    describe('createWaste', () => {
        it('creates a waste movement successfully', async () => {
            const wasteInput = {
                productId: 1,
                quantity: 4,
                reason: 'Damaged products'
            };

            const product = {
                id: 1,
                name: 'Keyboard',
                stock: 10,
                active: true
            };

            const updatedProduct = {
                ...product,
                stock: 6
            };

            const createdMovement = {
                id: 4,
                product_id: 1,
                type: 'WASTE',
                quantity: -4,
                reason: 'Damaged products'
            };

            productRepository.findById.mockResolvedValue(product);

            productRepository.decreaseStock.mockResolvedValue(
                updatedProduct
            );

            inventoryRepository.createMovement.mockResolvedValue(
                createdMovement
            );

            const result = await createWaste(wasteInput);

            expect(productRepository.findById).toHaveBeenCalledWith(1);

            expect(
                productRepository.decreaseStock
            ).toHaveBeenCalledWith(
                transactionClient,
                1,
                4
            );

            expect(
                productRepository.increaseStock
            ).not.toHaveBeenCalled();

            expect(
                inventoryRepository.createMovement
            ).toHaveBeenCalledWith(
                transactionClient,
                {
                    productId: 1,
                    type: 'WASTE',
                    quantity: -4,
                    reason: 'Damaged products'
                }
            );

            expect(transactionClient.query.mock.calls).toEqual([
                ['BEGIN'],
                ['COMMIT']
            ]);

            expect(
                transactionClient.release
            ).toHaveBeenCalledTimes(1);

            expect(result).toEqual({
                product: updatedProduct,
                movement: createdMovement
            });
        });

        it('rejects the waste when the product does not exist', async () => {
            productRepository.findById.mockResolvedValue(undefined);

            await expect(
                createWaste({
                    productId: 1,
                    quantity: 4,
                    reason: 'Damaged products'
                })
            ).rejects.toMatchObject({
                message: 'Product not found',
                statusCode: 404
            });

            expect(productRepository.findById).toHaveBeenCalledWith(1);
            expect(pool.connect).not.toHaveBeenCalled();

            expect(
                productRepository.decreaseStock
            ).not.toHaveBeenCalled();

            expect(
                inventoryRepository.createMovement
            ).not.toHaveBeenCalled();
        });

        it('rejects the waste when the product is inactive', async () => {
            productRepository.findById.mockResolvedValue({
                id: 1,
                name: 'Keyboard',
                stock: 10,
                active: false
            });

            await expect(
                createWaste({
                    productId: 1,
                    quantity: 4,
                    reason: 'Damaged products'
                })
            ).rejects.toMatchObject({
                message: 'Product is inactive',
                statusCode: 409
            });

            expect(pool.connect).not.toHaveBeenCalled();

            expect(
                productRepository.decreaseStock
            ).not.toHaveBeenCalled();

            expect(
                inventoryRepository.createMovement
            ).not.toHaveBeenCalled();
        });

        it('rejects the waste when stock is insufficient', async () => {
            productRepository.findById.mockResolvedValue({
                id: 1,
                name: 'Keyboard',
                stock: 3,
                active: true
            });

            await expect(
                createWaste({
                    productId: 1,
                    quantity: 4,
                    reason: 'Damaged products'
                })
            ).rejects.toMatchObject({
                message: 'Insufficient stock for waste',
                statusCode: 409
            });

            expect(pool.connect).not.toHaveBeenCalled();

            expect(
                productRepository.decreaseStock
            ).not.toHaveBeenCalled();

            expect(
                inventoryRepository.createMovement
            ).not.toHaveBeenCalled();
        });

        it('rolls back when an error occurs during the transaction', async () => {
            const wasteInput = {
                productId: 1,
                quantity: 4,
                reason: 'Damaged products'
            };

            const databaseError = new Error('Database failure');

            productRepository.findById.mockResolvedValue({
                id: 1,
                name: 'Keyboard',
                stock: 10,
                active: true
            });

            productRepository.decreaseStock.mockRejectedValue(
                databaseError
            );

            await expect(
                createWaste(wasteInput)
            ).rejects.toBe(databaseError);

            expect(transactionClient.query.mock.calls).toEqual([
                ['BEGIN'],
                ['ROLLBACK']
            ]);

            expect(
                transactionClient.release
            ).toHaveBeenCalledTimes(1);

            expect(
                inventoryRepository.createMovement
            ).not.toHaveBeenCalled();
        });
    });
});