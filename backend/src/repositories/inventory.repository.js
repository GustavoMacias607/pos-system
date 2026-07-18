const pool = require('../config/database');

const createMovement = async (client, movement) => {
    const result = await client.query(
        `
        INSERT INTO inventory_movements (
            product_id,
            type,
            quantity,
            reason,
            purchase_id
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
            movement.productId,
            movement.type,
            movement.quantity,
            movement.reason,
            movement.purchaseId ?? null
        ]
    );

    return result.rows[0];
};

const findAllMovements = async (filters = {}) => {
    const conditions = [];
    const values = [];

    if (filters.type) {
        values.push(filters.type);
        conditions.push(`i.type = $${values.length}`);
    }

    if (filters.productId) {
        values.push(filters.productId);
        conditions.push(`i.product_id = $${values.length}`);
    }

    const whereClause = conditions.length > 0
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

    const result = await pool.query(
        `
        SELECT 
            i.id,
            i.product_id,
            p.name AS product_name,
            i.type,
            i.quantity,
            i.reason,
            i.created_at
        FROM inventory_movements i
        LEFT JOIN products p
            ON i.product_id = p.id
        ${whereClause}
        ORDER BY i.created_at DESC
        `,
        values
    );

    return result.rows;
};

module.exports = {
    createMovement,
    findAllMovements
};