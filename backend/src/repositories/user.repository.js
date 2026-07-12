const pool = require('../config/database');

const findAll = async () => {
    const result = await pool.query(
        `
        SELECT
            id,
            name,
            email,
            role,
            active,
            created_at,
            updated_at
        FROM users
        ORDER BY id ASC
        `
    );

    return result.rows;
};

const findById = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            id,
            name,
            email,
            role,
            active,
            created_at,
            updated_at
        FROM users
        WHERE id = $1
        `,
        [userId]
    );

    return result.rows[0];
};

const findByEmail = async (userEmail) => {
    const result = await pool.query(
        `
        SELECT
            id,
            name,
            email,
            role,
            active,
            created_at,
            updated_at
        FROM users
        WHERE LOWER(email) = LOWER($1)
        `,
        [userEmail]
    );

    return result.rows[0];
};

const findByEmailWithPassword = async (userEmail) => {
    const result = await pool.query(
        `
        SELECT
            id,
            name,
            email,
            password_hash,
            role,
            active,
            two_factor_enabled,
            two_factor_enabled_at,
            created_at,
            updated_at
        FROM users
        WHERE LOWER(email) = LOWER($1)
        `,
        [userEmail]
    );

    return result.rows[0];
};

const create = async (userData) => {
    const result = await pool.query(
        `
        INSERT INTO users (
            name,
            email,
            password_hash,
            role
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
            id,
            name,
            email,
            role,
            active,
            created_at,
            updated_at
        `,
        [
            userData.name,
            userData.email,
            userData.passwordHash,
            userData.role
        ]
    );

    return result.rows[0];
};

const update = async (userId, userData) => {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (userData.name !== undefined) {
        fields.push(`name = $${paramIndex}`);
        values.push(userData.name);
        paramIndex++;
    }

    if (userData.email !== undefined) {
        fields.push(`email = $${paramIndex}`);
        values.push(userData.email);
        paramIndex++;
    }

    if (userData.passwordHash !== undefined) {
        fields.push(`password_hash = $${paramIndex}`);
        values.push(userData.passwordHash);
        paramIndex++;
    }

    if (userData.role !== undefined) {
        fields.push(`role = $${paramIndex}`);
        values.push(userData.role);
        paramIndex++;
    }

    if (userData.active !== undefined) {
        fields.push(`active = $${paramIndex}`);
        values.push(userData.active);
        paramIndex++;
    }

    fields.push('updated_at = NOW()');

    values.push(userId);

    const result = await pool.query(
        `
        UPDATE users
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING
            id,
            name,
            email,
            role,
            active,
            created_at,
            updated_at
        `,
        values
    );

    return result.rows[0];
};

const deactivate = async (userId) => {
    const result = await pool.query(
        `
        UPDATE users
        SET
            active = false,
            updated_at = NOW()
        WHERE id = $1
        RETURNING
            id,
            name,
            email,
            role,
            active,
            created_at,
            updated_at
        `,
        [userId]
    );

    return result.rows[0];
};

const activate = async (userId) => {
    const result = await pool.query(
        `
        UPDATE users
        SET
            active = true,
            updated_at = NOW()
        WHERE id = $1
        RETURNING
            id,
            name,
            email,
            role,
            active,
            created_at,
            updated_at
        `,
        [userId]
    );

    return result.rows[0];
};


const findTwoFactorByUserId = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            id,
            email,
            two_factor_secret,
            two_factor_enabled,
            two_factor_enabled_at
        FROM users
        WHERE id = $1
        `,
        [userId]
    );

    return result.rows[0];
};

const updateTwoFactorSecret = async (userId, secret) => {
    const result = await pool.query(
        `
        UPDATE users
        SET
            two_factor_secret = $1,
            updated_at = NOW()
        WHERE id = $2
        RETURNING
            id,
            email,
            two_factor_enabled,
            two_factor_enabled_at
        `,
        [secret, userId]
    );

    return result.rows[0];
};

const enableTwoFactor = async (userId) => {
    const result = await pool.query(
        `
        UPDATE users
        SET
            two_factor_enabled = TRUE,
            two_factor_enabled_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
        RETURNING
            id,
            email,
            two_factor_enabled,
            two_factor_enabled_at
        `,
        [userId]
    );

    return result.rows[0];
};

const disableTwoFactor = async (userId) => {
    const result = await pool.query(
        `
        UPDATE users
        SET
            two_factor_secret = NULL,
            two_factor_enabled = FALSE,
            two_factor_enabled_at = NULL,
            updated_at = NOW()
        WHERE id = $1
        RETURNING
            id,
            email,
            two_factor_enabled,
            two_factor_enabled_at
        `,
        [userId]
    );

    return result.rows[0];
};

module.exports = {
    findAll,
    findById,
    findByEmail,
    findByEmailWithPassword,
    create,
    update,
    activate,
    deactivate,
    findTwoFactorByUserId,
    updateTwoFactorSecret,
    enableTwoFactor,
    disableTwoFactor
};