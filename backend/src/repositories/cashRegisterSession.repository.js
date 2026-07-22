const pool = require('../config/database');

const findAll = async () => {
    const result = await pool.query(
        `
        SELECT
            crs.id,
            crs.cash_register_id,
            cr.name AS cash_register_name,
            crs.opened_by_user_id,
            opened_user.name AS opened_by_user_name,
            crs.closed_by_user_id,
            closed_user.name AS closed_by_user_name,
            crs.opening_amount,
            crs.expected_amount,
            crs.closing_amount,
            crs.difference_amount,
            crs.status,
            crs.opening_notes,
            crs.closing_notes,
            crs.opened_at,
            crs.closed_at,
            crs.updated_at
        FROM cash_register_sessions crs
        INNER JOIN cash_registers cr
            ON cr.id = crs.cash_register_id
        INNER JOIN users opened_user
            ON opened_user.id = crs.opened_by_user_id
        LEFT JOIN users closed_user
            ON closed_user.id = crs.closed_by_user_id
        ORDER BY crs.opened_at DESC
        `
    );

    return result.rows;
};

const findById = async (id) => {
    const result = await pool.query(
        `
        SELECT
            crs.id,
            crs.cash_register_id,
            cr.name AS cash_register_name,
            crs.opened_by_user_id,
            opened_user.name AS opened_by_user_name,
            crs.closed_by_user_id,
            closed_user.name AS closed_by_user_name,
            crs.opening_amount,
            crs.expected_amount,
            crs.closing_amount,
            crs.difference_amount,
            crs.status,
            crs.opening_notes,
            crs.closing_notes,
            crs.opened_at,
            crs.closed_at,
            crs.updated_at
        FROM cash_register_sessions crs
        INNER JOIN cash_registers cr
            ON cr.id = crs.cash_register_id
        INNER JOIN users opened_user
            ON opened_user.id = crs.opened_by_user_id
        LEFT JOIN users closed_user
            ON closed_user.id = crs.closed_by_user_id
        WHERE crs.id = $1
        ORDER BY crs.opened_at DESC
        `,
        [id]
    );

    return result.rows[0];
};


const findOpenByRegisterId = async (cashRegisterId) => {
    const result = await pool.query(
        `
        SELECT
            crs.id,
            crs.cash_register_id,
            cr.name AS cash_register_name,
            crs.opened_by_user_id,
            opened_user.name AS opened_by_user_name,
            crs.closed_by_user_id,
            closed_user.name AS closed_by_user_name,
            crs.opening_amount,
            crs.expected_amount,
            crs.closing_amount,
            crs.difference_amount,
            crs.status,
            crs.opening_notes,
            crs.closing_notes,
            crs.opened_at,
            crs.closed_at,
            crs.updated_at
        FROM cash_register_sessions crs
        INNER JOIN cash_registers cr
            ON cr.id = crs.cash_register_id
        INNER JOIN users opened_user
            ON opened_user.id = crs.opened_by_user_id
        LEFT JOIN users closed_user
            ON closed_user.id = crs.closed_by_user_id
        WHERE crs.cash_register_id = $1
            AND crs.status = 'OPEN'
        ORDER BY crs.opened_at DESC
        `,
        [cashRegisterId]
    );

    return result.rows[0];
};


const findOpenByUserId = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            crs.id,
            crs.cash_register_id,
            cr.name AS cash_register_name,
            crs.opened_by_user_id,
            opened_user.name AS opened_by_user_name,
            crs.closed_by_user_id,
            closed_user.name AS closed_by_user_name,
            crs.opening_amount,
            crs.expected_amount,
            crs.closing_amount,
            crs.difference_amount,
            crs.status,
            crs.opening_notes,
            crs.closing_notes,
            crs.opened_at,
            crs.closed_at,
            crs.updated_at
        FROM cash_register_sessions crs
        INNER JOIN cash_registers cr
            ON cr.id = crs.cash_register_id
        INNER JOIN users opened_user
            ON opened_user.id = crs.opened_by_user_id
        LEFT JOIN users closed_user
            ON closed_user.id = crs.closed_by_user_id
        WHERE crs.opened_by_user_id = $1
            AND crs.status = 'OPEN'
        ORDER BY crs.opened_at DESC
        `,
        [userId]
    );

    return result.rows[0];
};



const create = async (client, data) => {
    const result = await client.query(
        `
        INSERT INTO cash_register_sessions (
            cash_register_id,
            opened_by_user_id,
            opening_amount,
            status,
            opening_notes
        )
        VALUES ($1, $2, $3, 'OPEN', $4)
        RETURNING *
        `,
        [
            data.cashRegisterId,
            data.openedByUserId,
            data.openingAmount,
            data.openingNotes
        ]
    );

    return result.rows[0];
};


const closeOpenSession = async (client, id, data) => {
    const result = await client.query(
        `
        UPDATE cash_register_sessions
        SET closed_by_user_id = $1,
            expected_amount = $2,
            closing_amount = $3,
            difference_amount = $4,
            status = 'CLOSED',
            closing_notes = $5,
            closed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
          AND status = 'OPEN'
        RETURNING *
        `,
        [
            data.closedByUserId,
            data.expectedAmount,
            data.closingAmount,
            data.differenceAmount,
            data.closingNotes,
            id
        ]
    );

    return result.rows[0];
};


const calculateExpectedAmount = async (client, sessionId) => {
    const result = await client.query(
        `
        SELECT
            crs.opening_amount
            + COALESCE(
                SUM(
                    CASE
                        WHEN cm.type IN ('CASH_IN', 'SALE') THEN cm.amount
                        WHEN cm.type IN ('CASH_OUT', 'REFUND') THEN -cm.amount
                        ELSE 0
                    END
                ),
                0
            ) AS expected_amount
        FROM cash_register_sessions crs
        LEFT JOIN cash_movements cm
            ON cm.cash_session_id = crs.id
        WHERE crs.id = $1
        GROUP BY crs.id, crs.opening_amount
        `,
        [sessionId]
    );

    return result.rows[0]?.expected_amount;
};
const findByIdForUpdate = async (client, id) => {
    const result = await client.query(
        `
        SELECT *
        FROM cash_register_sessions
        WHERE id = $1
        FOR UPDATE
        `,
        [id]
    );

    return result.rows[0];
};

module.exports = {
    findAll,
    findById,
    findOpenByRegisterId,
    findOpenByUserId,
    create,
    closeOpenSession,
    calculateExpectedAmount,
    findByIdForUpdate
};