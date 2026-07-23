const pool = require('../config/database');

const create = async (client, data) => {
    const result = await client.query(
        `
        INSERT INTO cash_movements (
            cash_session_id,
            created_by_user_id,
            type,
            amount,
            reason,
            sale_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [
            data.cashSessionId,
            data.createdByUserId,
            data.type,
            data.amount,
            data.reason,
            data.saleId ?? null
        ]
    );

    return result.rows[0];
};

const findBySessionId = async (cashSessionId) => {
    const result = await pool.query(
        `
        SELECT
            cm.id,
            cm.cash_session_id,
            cm.created_by_user_id,
            u.name AS created_by_user_name,
            cm.type,
            cm.amount,
            cm.reason,
            cm.sale_id,
            cm.created_at
        FROM cash_movements cm
        INNER JOIN users u
            ON u.id = cm.created_by_user_id
        WHERE cm.cash_session_id = $1
        ORDER BY cm.created_at ASC, cm.id ASC
        `,
        [cashSessionId]
    );

    return result.rows;
};

module.exports = {
    create,
    findBySessionId
};