const pool = require('../config/database');
const clientRepository = require('../repositories/client.repository');
const productRepository = require('../repositories/product.repository');
const salesRepository = require('../repositories/sales.repository');
const inventoryRepository = require('../repositories/inventory.repository');
const AppError = require('../errors/AppError');
const {
    validateSaleInput,
    validateClientIdQuery
} = require('../validators/sale.validator');
const cashRegisterSessionRepository =
    require('../repositories/cashRegisterSession.repository');

const {
    PAYMENT_METHODS
} = require('../constants/sales.constants');

const cashMovementRepository =
    require('../repositories/cashMovement.repository');

const {
    CASH_MOVEMENT_TYPES
} = require('../constants/cashMovementTypes');


const createSale = async (data, userId) => {
    validateSaleInput(data);

    const clientId = data.clientId ?? null;

    if (clientId !== null) {
        const registeredClient = await clientRepository.findById(clientId);

        if (!registeredClient) {
            throw new AppError('Client not found', 404);
        }

        if (!registeredClient.active) {
            throw new AppError('Client is inactive', 409);
        }
    }

    // Merge repeated products so validation and stock updates use aggregate quantities.
    const items = normalizeItems(data.items);
    const productIds = items.map((item) => item.productId);

    // Perform read-only validations before acquiring a client to keep the transaction short.
    const products = await productRepository.findProductsByIds(
        productIds
    );

    if (products.length !== productIds.length) {
        throw new AppError(
            'One or more products not found',
            404
        );
    }

    const inactiveProduct = products.find(
        (product) => !product.active
    );

    if (inactiveProduct) {
        throw new AppError(
            `Product ${inactiveProduct.name} is inactive`,
            400
        );
    }

    const productsMap = new Map(
        products.map((product) => [
            product.id,
            { ...product }
        ])
    );

    // This pre-check provides early feedback; stock is checked again atomically when written.
    for (const item of items) {
        const product = productsMap.get(item.productId);

        if (item.quantity > product.stock) {
            throw new AppError(
                `Insufficient stock for product ${product.name}`,
                409
            );
        }
    }

    const subtotal = calculateSubtotal(items, productsMap);
    const discountTotal = 0;
    const tax = 0;
    const total = subtotal;

    const saleData = {
        clientId,
        subtotal,
        discountTotal,
        tax,
        total,
        paymentMethod: data.paymentMethod,
        status: 'COMPLETED'
    };

    // All writes share the same client so the sale, stock, and movements commit atomically.
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        let cashSession = null;

        if (data.paymentMethod === PAYMENT_METHODS.CASH) {
            cashSession =
                await cashRegisterSessionRepository
                    .findOpenByUserIdForUpdate(
                        client,
                        userId
                    );

            if (!cashSession) {
                throw new AppError(
                    'An open cash session is required for cash sales',
                    409
                );
            }
        }

        const sale = await salesRepository.createSale(
            client,
            saleData
        );

        // Store product and pricing snapshots so historical sales remain unchanged.
        const saleDetails = items.map((item) => {
            const product = productsMap.get(item.productId);
            const unitPrice = Number(product.price);
            const discount = 0;

            return {
                saleId: sale.id,
                productId: product.id,
                productName: product.name,
                quantity: item.quantity,
                unitPrice,
                discount,
                lineTotal:
                    unitPrice * item.quantity - discount
            };
        });

        const createdDetails = [];

        for (const detail of saleDetails) {
            const createdDetail =
                await salesRepository.createSaleDetail(
                    client,
                    detail
                );

            createdDetails.push(createdDetail);
        }

        for (const item of items) {
            // Recheck and decrease stock atomically to prevent overselling.
            const updatedProduct =
                await productRepository.decreaseStockIfAvailable(
                    client,
                    item.productId,
                    item.quantity
                );

            if (!updatedProduct) {
                const product = productsMap.get(item.productId);

                throw new AppError(
                    `Insufficient stock for product ${product.name}`,
                    409
                );
            }
        }

        const createdMovements = [];

        for (const item of items) {
            const product = productsMap.get(item.productId);

            const movement =
                await inventoryRepository.createMovement(
                    client,
                    {
                        productId: item.productId,
                        type: 'SALE',
                        quantity: -item.quantity,
                        reason:
                            `Sale #${sale.id} - ${product.name}`
                    }
                );

            createdMovements.push(movement);
        }

        let createdCashMovement = null;

        if (data.paymentMethod === PAYMENT_METHODS.CASH) {
            createdCashMovement =
                await cashMovementRepository.create(
                    client,
                    {
                        cashSessionId: cashSession.id,
                        createdByUserId: userId,
                        type: CASH_MOVEMENT_TYPES.SALE,
                        amount: total,
                        reason: `Sale #${sale.id}`,
                        saleId: sale.id
                    }
                );
        }
        await client.query('COMMIT');
        return {
            sale,
            details: createdDetails,
            movements: createdMovements,
            cashMovement: createdCashMovement
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const calculateSubtotal = (items, productsMap) => {
    let subtotal = 0;

    for (const item of items) {
        const product = productsMap.get(item.productId);

        subtotal +=
            Number(product.price) * item.quantity;
    }

    return subtotal;
};

const normalizeItems = (items) => {
    const itemsMap = new Map();

    for (const item of items) {
        const existingItem = itemsMap.get(item.productId);

        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            itemsMap.set(
                item.productId,
                { ...item }
            );
        }
    }

    return [...itemsMap.values()];
};

const cancelSale = async (id, userId) => {
    const sale = await salesRepository.findById(id);

    if (!sale) {
        throw new AppError('Sale not found', 404);
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Claim the cancellation atomically to prevent processing it twice.
        const cancelledSale =
            await salesRepository.cancelCompletedSale(
                client,
                sale.id
            );

        if (!cancelledSale) {
            throw new AppError(
                'Sale is already cancelled',
                409
            );
        }

        let cashSession = null;

        if (
            cancelledSale.payment_method
            === PAYMENT_METHODS.CASH
        ) {
            cashSession =
                await cashRegisterSessionRepository
                    .findOpenByUserIdForUpdate(
                        client,
                        userId
                    );

            if (!cashSession) {
                throw new AppError(
                    'An open cash session is required for cash refunds',
                    409
                );
            }
        }

        const saleDetails =
            await salesRepository.findDetailsBySaleId(
                client,
                cancelledSale.id
            );

        const createdMovements = [];

        for (const detail of saleDetails) {
            await productRepository.increaseStock(
                client,
                detail.product_id,
                detail.quantity
            );

            const movement =
                await inventoryRepository.createMovement(
                    client,
                    {
                        productId: detail.product_id,
                        type: 'CUSTOMER_RETURN',
                        quantity: detail.quantity,
                        reason:
                            `Cancelled sale #${cancelledSale.id} - ${detail.product_name}`
                    }
                );

            createdMovements.push(movement);
        }

        let createdCashMovement = null;

        if (
            cancelledSale.payment_method
            === PAYMENT_METHODS.CASH
        ) {
            createdCashMovement =
                await cashMovementRepository.create(
                    client,
                    {
                        cashSessionId: cashSession.id,
                        createdByUserId: userId,
                        type: CASH_MOVEMENT_TYPES.REFUND,
                        amount: cancelledSale.total,
                        reason:
                            `Refund for cancelled sale #${cancelledSale.id}`,
                        saleId: cancelledSale.id
                    }
                );
        }

        await client.query('COMMIT');

        return {
            sale: cancelledSale,
            movements: createdMovements,
            cashMovement: createdCashMovement
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const getAllSales = async (clientId) => {
    if (clientId === undefined) {
        return salesRepository.findAll();
    }

    const normalizedClientId = String(clientId);
    validateClientIdQuery(normalizedClientId);

    const registeredClient = await clientRepository.findById(normalizedClientId);

    if (!registeredClient) {
        throw new AppError('Client not found', 404);
    }

    return salesRepository.findByClientId(normalizedClientId);
};

const getSaleById = async (id) => {
    const sale = await salesRepository.findById(id);

    if (!sale) {
        throw new AppError('Sale not found', 404);
    }

    const details =
        await salesRepository.findDetailsBySaleId(
            pool,
            id
        );

    return {
        ...sale,
        details
    };
};

module.exports = {
    createSale,
    getAllSales,
    getSaleById,
    cancelSale
};