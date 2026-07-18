const pool = require('../config/database');
const purchaseRepository = require('../repositories/purchase.repository');
const supplierRepository = require('../repositories/supplier.repository');
const productRepository = require('../repositories/product.repository');
const supplierProductRepository = require('../repositories/supplierProduct.repository');
const inventoryRepository = require('../repositories/inventory.repository');
const AppError = require('../errors/AppError');

const {
    validateCreatePurchaseInput,
    validatePurchaseIdParam
} = require('../validators/purchase.validator');

// Use integer cents to avoid floating-point precision errors in monetary calculations.
const toCents = (value) => {
    return Math.round((value + Number.EPSILON) * 100);
};

const fromCents = (value) => {
    return value / 100;
};

const getAllPurchases = async () => {
    return purchaseRepository.findAll();
};

const getPurchaseById = async (purchaseId) => {
    validatePurchaseIdParam(String(purchaseId));

    const purchase = await purchaseRepository.findById(purchaseId);

    if (!purchase) {
        throw new AppError('Purchase not found', 404);
    }

    const details =
        await purchaseRepository.findDetailsByPurchaseId(
            pool,
            purchaseId
        );

    return {
        ...purchase,
        items: details
    };
};

const createPurchase = async (data, createdByUserId) => {
    if (
        !Number.isInteger(createdByUserId)
        || createdByUserId <= 0
    ) {
        throw new AppError(
            'Authenticated user ID is invalid',
            400
        );
    }

    validateCreatePurchaseInput(data);

    const invoiceNumber =
        data.invoiceNumber === undefined
            || data.invoiceNumber === null
            ? null
            : data.invoiceNumber.trim();

    const notes =
        data.notes === undefined
            || data.notes === null
            ? null
            : data.notes.trim();

    // Validate business rules before acquiring a DB client to keep the transaction short.
    const supplier = await supplierRepository.findById(
        data.supplierId
    );

    if (!supplier) {
        throw new AppError('Supplier not found', 404);
    }

    if (!supplier.active) {
        throw new AppError('Supplier is inactive', 409);
    }

    if (invoiceNumber !== null) {
        const existingPurchase =
            await purchaseRepository.findBySupplierAndInvoiceNumber(
                data.supplierId,
                invoiceNumber
            );

        if (existingPurchase) {
            throw new AppError(
                'Invoice number already exists for this supplier',
                409
            );
        }
    }

    // Snapshot product data and calculate trusted totals on the server.
    const preparedItems = [];
    let subtotalCents = 0;

    for (const item of data.items) {
        const product = await productRepository.findById(
            item.productId
        );

        if (!product) {
            throw new AppError(
                `Product with ID ${item.productId} not found`,
                404
            );
        }

        if (!product.active) {
            throw new AppError(
                `Product with ID ${item.productId} is inactive`,
                409
            );
        }

        const supplierProduct =
            await supplierProductRepository.findBySupplierAndProduct(
                data.supplierId,
                item.productId
            );

        if (!supplierProduct) {
            throw new AppError(
                `Product with ID ${item.productId} is not associated with this supplier`,
                409
            );
        }

        if (!supplierProduct.active) {
            throw new AppError(
                `Supplier product relationship for product ID ${item.productId} is inactive`,
                409
            );
        }

        const unitCostCents = toCents(item.unitCost);
        const lineTotalCents =
            unitCostCents * item.quantity;

        subtotalCents += lineTotalCents;

        preparedItems.push({
            productId: item.productId,
            productName: product.name,
            quantity: item.quantity,
            unitCost: fromCents(unitCostCents),
            lineTotal: fromCents(lineTotalCents)
        });
    }

    const taxCents = toCents(data.tax ?? 0);
    const totalCents = subtotalCents + taxCents;

    const subtotal = fromCents(subtotalCents);
    const tax = fromCents(taxCents);
    const total = fromCents(totalCents);

    // All writes use the same client so the purchase, stock, and movements commit atomically.
    const client = await pool.connect();
    let purchase;

    try {
        await client.query('BEGIN');

        purchase = await purchaseRepository.createPurchase(
            client,
            {
                supplierId: data.supplierId,
                createdByUserId,
                invoiceNumber,
                subtotal,
                tax,
                total,
                status: 'COMPLETED',
                notes
            }
        );

        for (const item of preparedItems) {
            await purchaseRepository.createPurchaseDetail(
                client,
                {
                    purchaseId: purchase.id,
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    unitCost: item.unitCost,
                    lineTotal: item.lineTotal
                }
            );

            await productRepository.increaseStock(
                client,
                item.productId,
                item.quantity
            );

            await inventoryRepository.createMovement(
                client,
                {
                    productId: item.productId,
                    type: 'PURCHASE',
                    quantity: item.quantity,
                    reason: `Purchase #${purchase.id}`,
                    purchaseId: purchase.id
                }
            );

            // Keep the supplier cost aligned with the latest successful purchase.
            // The conditional update also detects concurrent relationship deactivation.
            const updatedSupplierProduct =
                await supplierProductRepository.updateUnitCost(
                    client,
                    data.supplierId,
                    item.productId,
                    item.unitCost
                );

            if (!updatedSupplierProduct) {
                throw new AppError(
                    `Supplier product relationship for product ID ${item.productId} is no longer active`,
                    409
                );
            }
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');

        // The unique index handles concurrent requests that pass the earlier duplicate check.
        if (
            error.code === '23505'
            && error.constraint ===
            'purchases_supplier_invoice_unique_idx'
        ) {
            throw new AppError(
                'Invoice number already exists for this supplier',
                409
            );
        }

        throw error;
    } finally {
        client.release();
    }

    return getPurchaseById(purchase.id);
};

const cancelPurchase = async (purchaseId) => {
    validatePurchaseIdParam(String(purchaseId));

    const existingPurchase =
        await purchaseRepository.findById(purchaseId);

    if (!existingPurchase) {
        throw new AppError('Purchase not found', 404);
    }

    if (existingPurchase.status === 'CANCELLED') {
        throw new AppError(
            'Purchase is already cancelled',
            409
        );
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Claim the cancellation atomically. A rollback restores COMPLETED if a later step fails.
        const cancelledPurchase =
            await purchaseRepository.cancelCompletedPurchase(
                client,
                purchaseId
            );

        if (!cancelledPurchase) {
            throw new AppError(
                'Purchase is already cancelled',
                409
            );
        }

        const details =
            await purchaseRepository.findDetailsByPurchaseId(
                client,
                purchaseId
            );

        for (const detail of details) {
            // Prevent negative stock with a conditional, atomic update.
            const productDecrease =
                await productRepository.decreaseStockIfAvailable(
                    client,
                    detail.product_id,
                    detail.quantity
                );

            if (!productDecrease) {
                throw new AppError(
                    `Insufficient stock to cancel purchase for product ID ${detail.product_id}`,
                    409
                );
            }

            // Supplier returns are inventory outflows, so their quantity is negative.
            await inventoryRepository.createMovement(
                client,
                {
                    productId: detail.product_id,
                    type: 'SUPPLIER_RETURN',
                    quantity: -detail.quantity,
                    reason: `Cancellation of purchase #${purchaseId}`,
                    purchaseId
                }
            );
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }

    return getPurchaseById(purchaseId);
};

module.exports = {
    getAllPurchases,
    getPurchaseById,
    createPurchase,
    cancelPurchase
};