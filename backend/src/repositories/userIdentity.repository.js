const pool = require('../config/database');

const findByProviderAndProviderUserId = async (provider, providerUserId) => {
    const result = await pool.query(
        `
        SELECT
            id,
            user_id,
            provider,
            provider_user_id,
            email,
            created_at,
            updated_at
        FROM user_identities
        WHERE provider = $1
          AND provider_user_id = $2
        `,
        [provider, providerUserId]
    );

    return result.rows[0];
};

const findByUserIdAndProvider = async (userId, provider) => {
    const result = await pool.query(
        `
        SELECT
            id,
            user_id,
            provider,
            provider_user_id,
            email,
            created_at,
            updated_at
        FROM user_identities
        WHERE user_id = $1
          AND provider = $2
        `,
        [userId, provider]
    );

    return result.rows[0];
};

const create = async (identityData) => {
    const result = await pool.query(
        `
        INSERT INTO user_identities (
            user_id,
            provider,
            provider_user_id,
            email
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
            id,
            user_id,
            provider,
            provider_user_id,
            email,
            created_at,
            updated_at
        `,
        [
            identityData.userId,
            identityData.provider,
            identityData.providerUserId,
            identityData.email
        ]
    );

    return result.rows[0];
};

module.exports = {
    findByProviderAndProviderUserId,
    findByUserIdAndProvider,
    create
};