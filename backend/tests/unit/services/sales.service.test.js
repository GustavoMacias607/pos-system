jest.mock('../../../src/config/database', () => ({
    connect: jest.fn()
}));

jest.mock('../../../src/repositories/client.repository', () => ({
    findById: jest.fn()
}));

jest.mock('../../../src/repositories/product.repository', () => ({
    findProductsByIds: jest.fn(),
    decreaseStockIfAvailable: jest.fn(),
    increaseStock: jest.fn()
}));

jest.mock('../../../src/repositories/sales.repository', () => ({
    createSale: jest.fn(),
    createSaleDetail: jest.fn(),
    findById: jest.fn(),
    cancelCompletedSale: jest.fn(),
    findDetailsBySaleId: jest.fn()
}));

jest.mock('../../../src/repositories/inventory.repository', () => ({
    createMovement: jest.fn()
}));

jest.mock(
    '../../../src/repositories/cashRegisterSession.repository',
    () => ({
        findOpenByUserIdForUpdate: jest.fn()
    })
);

jest.mock('../../../src/repositories/cashMovement.repository', () => ({
    create: jest.fn()
}));

const pool = require('../../../src/config/database');
const productRepository =
    require('../../../src/repositories/product.repository');
const salesRepository =
    require('../../../src/repositories/sales.repository');
const inventoryRepository =
    require('../../../src/repositories/inventory.repository');
const cashRegisterSessionRepository =
    require('../../../src/repositories/cashRegisterSession.repository');
const cashMovementRepository =
    require('../../../src/repositories/cashMovement.repository');

const {
    createSale,
    cancelSale
} = require('../../../src/services/sales.service');

describe('sales.service', () => {
    let transactionClient;

    beforeEach(() => {
        jest.resetAllMocks();

        transactionClient = {
            query: jest.fn().mockResolvedValue(),
            release: jest.fn()
        };

        pool.connect.mockResolvedValue(transactionClient);
    });

    describe('createSale', () => {
        it('creates a card sale and merges repeated products', async () => {
            const saleInput = {
                paymentMethod: 'CARD',
                items: [
                    {
                        productId: 1,
                        quantity: 2
                    },
                    {
                        productId: 1,
                        quantity: 1
                    }
                ]
            };

            const product = {
                id: 1,
                name: 'Keyboard',
                price: '25.00',
                stock: 10,
                active: true
            };

            const createdSale = {
                id: 101,
                client_id: null,
                subtotal: '75.00',
                discount_total: '0.00',
                tax: '0.00',
                total: '75.00',
                payment_method: 'CARD',
                status: 'COMPLETED'
            };

            const createdDetail = {
                id: 201,
                sale_id: 101,
                product_id: 1,
                product_name: 'Keyboard',
                quantity: 3,
                unit_price: '25.00',
                discount: '0.00',
                line_total: '75.00'
            };

            const updatedProduct = {
                ...product,
                stock: 7
            };

            const createdMovement = {
                id: 301,
                product_id: 1,
                type: 'SALE',
                quantity: -3
            };

            productRepository.findProductsByIds.mockResolvedValue([
                product
            ]);

            salesRepository.createSale.mockResolvedValue(
                createdSale
            );

            salesRepository.createSaleDetail.mockResolvedValue(
                createdDetail
            );

            productRepository.decreaseStockIfAvailable.mockResolvedValue(
                updatedProduct
            );

            inventoryRepository.createMovement.mockResolvedValue(
                createdMovement
            );

            const result = await createSale(saleInput, 7);

            expect(
                productRepository.findProductsByIds
            ).toHaveBeenCalledWith([1]);

            expect(salesRepository.createSale).toHaveBeenCalledWith(
                transactionClient,
                {
                    clientId: null,
                    subtotal: 75,
                    discountTotal: 0,
                    tax: 0,
                    total: 75,
                    paymentMethod: 'CARD',
                    status: 'COMPLETED'
                }
            );

            expect(
                salesRepository.createSaleDetail
            ).toHaveBeenCalledTimes(1);

            expect(
                salesRepository.createSaleDetail
            ).toHaveBeenCalledWith(
                transactionClient,
                {
                    saleId: 101,
                    productId: 1,
                    productName: 'Keyboard',
                    quantity: 3,
                    unitPrice: 25,
                    discount: 0,
                    lineTotal: 75
                }
            );

            expect(
                productRepository.decreaseStockIfAvailable
            ).toHaveBeenCalledWith(
                transactionClient,
                1,
                3
            );

            expect(
                inventoryRepository.createMovement
            ).toHaveBeenCalledWith(
                transactionClient,
                {
                    productId: 1,
                    type: 'SALE',
                    quantity: -3,
                    reason: 'Sale #101 - Keyboard'
                }
            );

            expect(
                cashRegisterSessionRepository
                    .findOpenByUserIdForUpdate
            ).not.toHaveBeenCalled();

            expect(
                cashMovementRepository.create
            ).not.toHaveBeenCalled();

            expect(
                transactionClient.query.mock.calls
            ).toEqual([
                ['BEGIN'],
                ['COMMIT']
            ]);

            expect(transactionClient.release).toHaveBeenCalledTimes(1);

            expect(result).toEqual({
                sale: createdSale,
                details: [createdDetail],
                movements: [createdMovement],
                cashMovement: null
            });
        });

        it('rolls back when stock is no longer available', async () => {
            const saleInput = {
                paymentMethod: 'CARD',
                items: [
                    {
                        productId: 1,
                        quantity: 3
                    }
                ]
            };

            const product = {
                id: 1,
                name: 'Keyboard',
                price: '25.00',
                stock: 10,
                active: true
            };

            productRepository.findProductsByIds.mockResolvedValue([
                product
            ]);

            salesRepository.createSale.mockResolvedValue({
                id: 102
            });

            salesRepository.createSaleDetail.mockResolvedValue({
                id: 202
            });

            productRepository.decreaseStockIfAvailable.mockResolvedValue(
                undefined
            );

            await expect(
                createSale(saleInput, 7)
            ).rejects.toMatchObject({
                message: 'Insufficient stock for product Keyboard',
                statusCode: 409
            });

            expect(
                transactionClient.query.mock.calls
            ).toEqual([
                ['BEGIN'],
                ['ROLLBACK']
            ]);

            expect(
                inventoryRepository.createMovement
            ).not.toHaveBeenCalled();

            expect(
                cashMovementRepository.create
            ).not.toHaveBeenCalled();

            expect(transactionClient.release).toHaveBeenCalledTimes(1);
        });

        it('rolls back a cash sale when the user has no open cash session', async () => {
            const saleInput = {
                paymentMethod: 'CASH',
                items: [
                    {
                        productId: 1,
                        quantity: 2
                    }
                ]
            };

            productRepository.findProductsByIds.mockResolvedValue([
                {
                    id: 1,
                    name: 'Keyboard',
                    price: '25.00',
                    stock: 10,
                    active: true
                }
            ]);

            cashRegisterSessionRepository
                .findOpenByUserIdForUpdate
                .mockResolvedValue(undefined);

            await expect(
                createSale(saleInput, 7)
            ).rejects.toMatchObject({
                message:
                    'An open cash session is required for cash sales',
                statusCode: 409
            });

            expect(
                cashRegisterSessionRepository
                    .findOpenByUserIdForUpdate
            ).toHaveBeenCalledWith(
                transactionClient,
                7
            );

            expect(
                salesRepository.createSale
            ).not.toHaveBeenCalled();

            expect(
                productRepository.decreaseStockIfAvailable
            ).not.toHaveBeenCalled();

            expect(
                transactionClient.query.mock.calls
            ).toEqual([
                ['BEGIN'],
                ['ROLLBACK']
            ]);

            expect(transactionClient.release).toHaveBeenCalledTimes(1);
        });
    });

    describe('cancelSale', () => {
        it('cancels a cash sale, restores stock and creates a refund', async () => {
            const existingSale = {
                id: 401,
                payment_method: 'CASH',
                status: 'COMPLETED',
                total: '75.00'
            };

            const cancelledSale = {
                ...existingSale,
                status: 'CANCELLED'
            };

            const saleDetails = [
                {
                    id: 501,
                    sale_id: 401,
                    product_id: 1,
                    product_name: 'Keyboard',
                    quantity: 3,
                    unit_price: '25.00',
                    discount: '0.00',
                    line_total: '75.00'
                }
            ];

            const cashSession = {
                id: 601,
                user_id: 7,
                status: 'OPEN'
            };

            const returnMovement = {
                id: 701,
                product_id: 1,
                type: 'CUSTOMER_RETURN',
                quantity: 3
            };

            const refundMovement = {
                id: 801,
                cash_session_id: 601,
                type: 'REFUND',
                amount: '75.00',
                sale_id: 401
            };

            salesRepository.findById.mockResolvedValue(
                existingSale
            );

            salesRepository.cancelCompletedSale.mockResolvedValue(
                cancelledSale
            );

            cashRegisterSessionRepository
                .findOpenByUserIdForUpdate
                .mockResolvedValue(cashSession);

            salesRepository.findDetailsBySaleId.mockResolvedValue(
                saleDetails
            );

            productRepository.increaseStock.mockResolvedValue({
                id: 1,
                stock: 10
            });

            inventoryRepository.createMovement.mockResolvedValue(
                returnMovement
            );

            cashMovementRepository.create.mockResolvedValue(
                refundMovement
            );

            const result = await cancelSale(401, 7);

            expect(salesRepository.findById).toHaveBeenCalledWith(
                401
            );

            expect(
                salesRepository.cancelCompletedSale
            ).toHaveBeenCalledWith(
                transactionClient,
                401
            );

            expect(
                cashRegisterSessionRepository
                    .findOpenByUserIdForUpdate
            ).toHaveBeenCalledWith(
                transactionClient,
                7
            );

            expect(
                productRepository.increaseStock
            ).toHaveBeenCalledWith(
                transactionClient,
                1,
                3
            );

            expect(
                inventoryRepository.createMovement
            ).toHaveBeenCalledWith(
                transactionClient,
                {
                    productId: 1,
                    type: 'CUSTOMER_RETURN',
                    quantity: 3,
                    reason:
                        'Cancelled sale #401 - Keyboard'
                }
            );

            expect(
                cashMovementRepository.create
            ).toHaveBeenCalledWith(
                transactionClient,
                {
                    cashSessionId: 601,
                    createdByUserId: 7,
                    type: 'REFUND',
                    amount: '75.00',
                    reason:
                        'Refund for cancelled sale #401',
                    saleId: 401
                }
            );

            expect(
                transactionClient.query.mock.calls
            ).toEqual([
                ['BEGIN'],
                ['COMMIT']
            ]);

            expect(transactionClient.release).toHaveBeenCalledTimes(1);

            expect(result).toEqual({
                sale: cancelledSale,
                movements: [returnMovement],
                cashMovement: refundMovement
            });
        });

        it('rolls back when the sale was already claimed for cancellation', async () => {
            salesRepository.findById.mockResolvedValue({
                id: 401,
                payment_method: 'CARD',
                status: 'COMPLETED'
            });

            salesRepository.cancelCompletedSale.mockResolvedValue(
                undefined
            );

            await expect(
                cancelSale(401, 7)
            ).rejects.toMatchObject({
                message: 'Sale is already cancelled',
                statusCode: 409
            });

            expect(
                salesRepository.cancelCompletedSale
            ).toHaveBeenCalledWith(
                transactionClient,
                401
            );

            expect(
                salesRepository.findDetailsBySaleId
            ).not.toHaveBeenCalled();

            expect(
                productRepository.increaseStock
            ).not.toHaveBeenCalled();

            expect(
                inventoryRepository.createMovement
            ).not.toHaveBeenCalled();

            expect(
                cashMovementRepository.create
            ).not.toHaveBeenCalled();

            expect(
                transactionClient.query.mock.calls
            ).toEqual([
                ['BEGIN'],
                ['ROLLBACK']
            ]);

            expect(transactionClient.release).toHaveBeenCalledTimes(1);
        });
    });
});
