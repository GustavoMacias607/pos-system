const pool = require('../config/database');

const create = async (sessionData) => {
    const result = await pool.query(
        `
        INSERT INTO user_sessions (
            user_id,
            refresh_token_hash,
            user_agent,
            ip_address,
            expires_at
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
            sessionData.userId,
            sessionData.refreshTokenHash,
            sessionData.userAgent,
            sessionData.ipAddress,
            sessionData.expiresAt
        ]
    );

    return result.rows[0];
};

const findByRefreshTokenHash = async (refreshTokenHash) => {
    const result = await pool.query(
        `
        SELECT
            id,
            user_id,
            refresh_token_hash,
            user_agent,
            ip_address,
            expires_at,
            revoked_at,
            created_at,
            updated_at
        FROM user_sessions
        WHERE refresh_token_hash = $1
        `,
        [refreshTokenHash]
    );

    return result.rows[0];
};

const revoke = async (sessionId) => {
    const result = await pool.query(
        `
        UPDATE user_sessions
        SET
            revoked_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
        `,
        [sessionId]
    );

    return result.rows[0];
};

const revokeAllByUserId = async (userId) => {
    const result = await pool.query(
        `
        UPDATE user_sessions
        SET
            revoked_at = NOW(),
            updated_at = NOW()
        WHERE user_id = $1
          AND revoked_at IS NULL
        RETURNING *
        `,
        [userId]
    );

    return result.rows;
};

module.exports = {
    create,
    findByRefreshTokenHash,
    revoke,
    revokeAllByUserId
};