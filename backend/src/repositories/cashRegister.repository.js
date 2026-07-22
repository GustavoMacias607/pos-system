const pool = require('../config/database');

const findAll = async () => {
    const result = await pool.query(
        `
    SELECT * FROM cash_registers ORDER BY id ASC
    `
    );
    return result.rows;
};

const findById = async (id) => {
    const result = await pool.query(
        `
        SELECT * FROM cash_registers
        WHERE id = $1
        `,
        [id]
    );
    return result.rows[0];
};

const findByName = async (name) => {
    const result = await pool.query(
        `
        SELECT *
        FROM cash_registers
        WHERE LOWER(name) = LOWER($1)
        `,
        [name]
    );

    return result.rows[0];
};

const create = async (data) => {
    const result = await pool.query(
        `
        INSERT INTO cash_registers (name, location)
        VALUES ($1, $2)
        RETURNING *
        `,
        [
            data.name,
            data.location
        ]
    );

    return result.rows[0];
};

const update = async (id, data) => {
    const result = await pool.query(
        `
        UPDATE cash_registers
        SET name = $1,
            location = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
        `,
        [data.name, data.location, id]
    );

    return result.rows[0];
};

const deactivate = async (id) => {
    const result = await pool.query(
        `
        UPDATE cash_registers cr
        SET active = false,
            updated_at = CURRENT_TIMESTAMP
        WHERE cr.id = $1
          AND NOT EXISTS (
              SELECT 1
              FROM cash_register_sessions crs
              WHERE crs.cash_register_id = cr.id
                AND crs.status = 'OPEN'
          )
        RETURNING *
        `,
        [id]
    );

    return result.rows[0];
};

const activate = async (id) => {
    const result = await pool.query(
        `
        UPDATE cash_registers
        SET active = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
        `,
        [id]
    );

    return result.rows[0];
};

module.exports = {
    findAll,
    findById,
    findByName,
    create,
    update,
    deactivate,
    activate
}