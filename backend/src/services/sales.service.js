const pool = require('../config/database');
const productRepository = require('../repositories/product.repository');
const salesRepository = require('../repositories/sales.repository');
const inventoryRepository = require('../repositories/inventory.repository');
const AppError = require('../errors/AppError');
const { validateSaleInput } = require('../validators/sale.validator');

const createSale = async (data) => {
    validateSaleInput(data);

    const items = normalizeItems(data.items);
    // 1. Validaciones previas
    const productIds = items.map(item => item.productId);

    const products = await productRepository.findProductsByIds(productIds);

    if (products.length !== productIds.length) {
        throw new AppError('One or more products not found', 404);
    }

    const inactiveProduct = products.find(product => !product.active);

    if (inactiveProduct) {
        throw new AppError(`Product ${inactiveProduct.name} is inactive`, 400);
    }

    const productsMap = new Map(
        products.map(product => [product.id, { ...product }])
    );

    for (const item of items) {
        const product = productsMap.get(item.productId);

        if (item.quantity > product.stock) {
            throw new AppError(`Insufficient stock for product ${product.name}`, 409);
        }


    }

    const subtotal = calculateSubtotal(items, productsMap);

    const discountTotal = 0;
    const tax = 0;
    const total = subtotal;

    const saleData = {
        subtotal,
        discountTotal,
        tax,
        total,
        paymentMethod: data.paymentMethod,
        status: 'COMPLETED'
    };

    // 2. Escritura en BD con transacción
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const sale = await salesRepository.createSale(client, saleData);

        const saleDetails = items.map(item => {
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
                lineTotal: unitPrice * item.quantity - discount
            };
        });

        const createdDetails = [];

        for (const detail of saleDetails) {
            const createdDetail = await salesRepository.createSaleDetail(client, detail);
            createdDetails.push(createdDetail);
        }

        for (const item of items) {
            await productRepository.decreaseStock(
                client,
                item.productId,
                item.quantity
            );
        }

        const createdMovements = [];

        for (const item of items) {
            const product = productsMap.get(item.productId);

            const movement = await inventoryRepository.createMovement(client, {
                productId: item.productId,
                type: 'SALE',
                quantity: -item.quantity,
                reason: `Sale #${sale.id} - ${product.name}`
            });

            createdMovements.push(movement);
        }
        await client.query('COMMIT');

        return {
            sale,
            details: createdDetails,
            movements: createdMovements
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

const calculateSubtotal = (items, productsMap) => {
    let subtotal = 0;

    for (const item of items) {
        const product = productsMap.get(item.productId);
        subtotal += Number(product.price) * item.quantity;
    }

    return subtotal;
}

const normalizeItems = (items) => {
    const itemsMap = new Map();

    for (const item of items) {
        const existingItem = itemsMap.get(item.productId);

        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            itemsMap.set(item.productId, { ...item });
        }
    }

    return [...itemsMap.values()];
};


const cancelSale = async (id) => {

    const sale = await salesRepository.findById(id);

    if (!sale) {
        throw new AppError('Sale not found', 404);
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const updateSaleStatus = await salesRepository.cancelCompletedSale(client, sale.id);

        if (!updateSaleStatus) {
            throw new AppError('Sale is already cancelled', 409);
        }

        const saleDetails = await salesRepository.findDetailsBySaleId(client, sale.id);

        const createdMovements = [];
        for (const detail of saleDetails) {
            await productRepository.increaseStock(
                client,
                detail.product_id,
                detail.quantity
            );

            const movement = await inventoryRepository.createMovement(client, {
                productId: detail.product_id,
                type: 'CUSTOMER_RETURN',
                quantity: detail.quantity,
                reason: `Cancelled sale #${sale.id} - ${detail.product_name}`
            });

            createdMovements.push(movement);
        }

        await client.query('COMMIT');

        return {
            sale: updateSaleStatus,
            movements: createdMovements
        };

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const getAllSales = async () => {
    return await salesRepository.findAll();
};

const getSaleById = async (id) => {
    const sale = await salesRepository.findById(id);

    if (!sale) {
        throw new AppError('Sale not found', 404);
    }

    const details = await salesRepository.findDetailsBySaleId(pool, id);

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