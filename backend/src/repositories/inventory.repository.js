const pool = require('../config/database');

const createMovement = async (client, movement) => {
    const result = await client.query(
        `
        INSERT INTO inventory_movements (
            product_id,
            type,
            quantity,
            reason
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
            movement.productId,
            movement.type,
            movement.quantity,
            movement.reason
        ]
    );

    return result.rows[0];
};

const findAllMovements = async () => {
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
        ORDER BY i.created_at DESC
        `
    );

    return result.rows;
};

module.exports = {
    createMovement,
    findAllMovements
};