const pool = require('../config/database');
const createSale = async (client, saleData) => {
    const result = await client.query(
        `
        INSERT INTO sales (
            subtotal,
            discount_total,
            tax,
            total,
            payment_method,
            status
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [
            saleData.subtotal,
            saleData.discountTotal,
            saleData.tax,
            saleData.total,
            saleData.paymentMethod,
            saleData.status
        ]
    );

    return result.rows[0];
};

const cancelCompletedSale = async (client, saleId) => {
    const result = await client.query(
        `
       UPDATE sales
            SET status = 'CANCELLED'
            WHERE id = $1
            AND status = 'COMPLETED'
            RETURNING *
        `,
        [saleId]
    );

    return result.rows[0];
};

const createSaleDetail = async (client, detail) => {
    const result = await client.query(
        `
        INSERT INTO sale_details (
            sale_id,
            product_id,
            product_name,
            quantity,
            unit_price,
            discount,
            line_total
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
        [
            detail.saleId,
            detail.productId,
            detail.productName,
            detail.quantity,
            detail.unitPrice,
            detail.discount,
            detail.lineTotal
        ]
    );

    return result.rows[0];
};

const findAll = async () => {
    const result = await pool.query(
        `
        SELECT
            id,
            subtotal,
            discount_total,
            tax,
            total,
            payment_method,
            status,
            created_at
        FROM sales
        ORDER BY created_at DESC
        `
    );

    return result.rows;
};

const findById = async (id) => {
    const saleResult = await pool.query(
        `
        SELECT
            id,
            subtotal,
            discount_total,
            tax,
            total,
            payment_method,
            status,
            created_at
        FROM sales
        WHERE id = $1
        `,
        [id]
    );

    return saleResult.rows[0];
};

const findDetailsBySaleId = async (client, saleId) => {
    const result = await client.query(
        `
        SELECT
            id,
            sale_id,
            product_id,
            product_name,
            quantity,
            unit_price,
            discount,
            line_total,
            created_at
        FROM sale_details
        WHERE sale_id = $1
        ORDER BY id ASC
        `,
        [saleId]
    );

    return result.rows;
};

module.exports = {
    createSale,
    cancelCompletedSale,
    createSaleDetail,
    findAll,
    findById,
    findDetailsBySaleId
};

