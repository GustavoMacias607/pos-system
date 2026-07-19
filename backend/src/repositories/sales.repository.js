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
            status,
            client_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
        [
            saleData.subtotal,
            saleData.discountTotal,
            saleData.tax,
            saleData.total,
            saleData.paymentMethod,
            saleData.status,
            saleData.clientId
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
            s.id,
            s.client_id,
            c.name AS client_name,
            s.subtotal,
            s.discount_total,
            s.tax,
            s.total,
            s.payment_method,
            s.status,
            s.created_at
        FROM sales s
        LEFT JOIN clients c ON c.id = s.client_id
        ORDER BY s.created_at DESC
        `
    );

    return result.rows;
};

const findById = async (id) => {
    const saleResult = await pool.query(
        `
        SELECT
            s.id,
            s.client_id,
            c.name AS client_name,
            s.subtotal,
            s.discount_total,
            s.tax,
            s.total,
            s.payment_method,
            s.status,
            s.created_at
        FROM sales s
        LEFT JOIN clients c ON c.id = s.client_id
        WHERE s.id = $1
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

const findByClientId = async (clientId) => {
    const result = await pool.query(
        `
        SELECT
            s.id,
            s.client_id,
            c.name AS client_name,
            s.subtotal,
            s.discount_total,
            s.tax,
            s.total,
            s.payment_method,
            s.status,
            s.created_at
        FROM sales s
        LEFT JOIN clients c ON c.id = s.client_id
        WHERE s.client_id = $1
        ORDER BY s.created_at DESC
        `,
        [clientId]
    );

    return result.rows;
};

module.exports = {
    createSale,
    cancelCompletedSale,
    createSaleDetail,
    findAll,
    findById,
    findDetailsBySaleId,
    findByClientId
};