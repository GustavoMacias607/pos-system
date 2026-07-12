const pool = require('../config/database');

const createMany = async (userId, codeHashes) => {
    if (!codeHashes.length) {
        return [];
    }
    const values = [];
    const placeholders = [];

    codeHashes.forEach((codeHash, index) => {
        const userIdParam = index * 2 + 1;
        const codeHashParam = index * 2 + 2;

        placeholders.push(`($${userIdParam}, $${codeHashParam})`);
        values.push(userId, codeHash);
    });

    const result = await pool.query(
        `
        INSERT INTO user_backup_codes (
            user_id,
            code_hash
        )
        VALUES ${placeholders.join(', ')}
        RETURNING
            id,
            user_id,
            code_hash,
            used_at,
            created_at,
            updated_at
        `,
        values
    );

    return result.rows;
};

const findUnusedByUserId = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            id,
            user_id,
            code_hash,
            used_at,
            created_at,
            updated_at
        FROM user_backup_codes
        WHERE user_id = $1
          AND used_at IS NULL
        ORDER BY id ASC
        `,
        [userId]
    );

    return result.rows;
};

const markAsUsed = async (backupCodeId) => {
    const result = await pool.query(
        `
        UPDATE user_backup_codes
        SET
            used_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
          AND used_at IS NULL
        RETURNING
            id,
            user_id,
            code_hash,
            used_at,
            created_at,
            updated_at
        `,
        [backupCodeId]
    );

    return result.rows[0];
};

const deleteByUserId = async (userId) => {
    const result = await pool.query(
        `
        DELETE FROM user_backup_codes
        WHERE user_id = $1
        RETURNING *
        `,
        [userId]
    );

    return result.rows;
};

module.exports = {
    createMany,
    findUnusedByUserId,
    markAsUsed,
    deleteByUserId
};