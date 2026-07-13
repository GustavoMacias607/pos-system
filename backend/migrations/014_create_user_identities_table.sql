CREATE TABLE user_identities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT user_identities_provider_check
    CHECK (provider IN ('GOOGLE'))
);

CREATE UNIQUE INDEX user_identities_provider_provider_user_id_unique_idx
ON user_identities(provider, provider_user_id);

CREATE UNIQUE INDEX user_identities_user_id_provider_unique_idx
ON user_identities(user_id, provider);

CREATE INDEX user_identities_user_id_idx
ON user_identities(user_id);