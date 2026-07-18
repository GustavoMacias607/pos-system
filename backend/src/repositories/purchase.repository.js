const pool = require('../config/database');


const findAll = async () => {
    const result = await pool.query(
        `
        SELECT
            p.id,
            p.supplier_id,
            s.name AS supplier_name,
            p.created_by_user_id,
            u.name AS created_by_user_name,
            p.invoice_number,
            p.subtotal,
            p.tax,
            p.total,
            p.status,
            p.notes,
            p.created_at,
            p.updated_at
        FROM purchases p
        INNER JOIN suppliers s
            ON p.supplier_id = s.id
        INNER JOIN users u
            ON p.created_by_user_id = u.id
        ORDER BY p.created_at DESC
        `
    );

    return result.rows;
};

const findBySupplierAndInvoiceNumber = async (
    supplierId,
    invoiceNumber
) => {
    const result = await pool.query(
        `
        SELECT *
        FROM purchases
        WHERE supplier_id = $1
          AND LOWER(invoice_number) = LOWER($2)
        `,
        [supplierId, invoiceNumber]
    );

    return result.rows[0];
};

const findById = async (purchaseId) => {
    const result = await pool.query(
        `
        SELECT
            p.id,
            p.supplier_id,
            s.name AS supplier_name,
            p.created_by_user_id,
            u.name AS created_by_user_name,
            p.invoice_number,
            p.subtotal,
            p.tax,
            p.total,
            p.status,
            p.notes,
            p.created_at,
            p.updated_at
        FROM purchases p
        INNER JOIN suppliers s
            ON p.supplier_id = s.id
        INNER JOIN users u
            ON p.created_by_user_id = u.id
        WHERE p.id = $1
        `,
        [purchaseId]
    );

    return result.rows[0];
};

const createPurchaseDetail = async (client, data) => {
    const result = await client.query(
        `
        INSERT INTO purchase_details (
            purchase_id,
            product_id,
            product_name,
            quantity,
            unit_cost,
            line_total
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [
            data.purchaseId,
            data.productId,
            data.productName,
            data.quantity,
            data.unitCost,
            data.lineTotal
        ]
    );

    return result.rows[0];
};

const cancelCompletedPurchase = async (client, purchaseId) => {
    const result = await client.query(
        `
        UPDATE purchases
        SET status = 'CANCELLED',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        AND status = 'COMPLETED'
        RETURNING *
        `,
        [purchaseId]
    );
    return result.rows[0];
};

const createPurchase = async (client, data) => {
    const result = await client.query(
        `
        INSERT INTO purchases (
            supplier_id,
            created_by_user_id,
            invoice_number,
            subtotal,
            tax,
            total,
            status,
            notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `,
        [
            data.supplierId,
            data.createdByUserId,
            data.invoiceNumber,
            data.subtotal,
            data.tax,
            data.total,
            data.status,
            data.notes
        ]
    );

    return result.rows[0];
};


const findDetailsByPurchaseId = async (client, purchaseId) => {
    const result = await client.query(
        `
        SELECT
            id,
            purchase_id,
            product_id,
            product_name,
            quantity,
            unit_cost,
            line_total,
            created_at
        FROM purchase_details
        WHERE purchase_id = $1
        ORDER BY id ASC`,
        [purchaseId]
    );

    return result.rows;
};

module.exports = {
    createPurchase,
    createPurchaseDetail,
    findAll,
    findById,
    findDetailsByPurchaseId,
    findBySupplierAndInvoiceNumber,
    cancelCompletedPurchase
};