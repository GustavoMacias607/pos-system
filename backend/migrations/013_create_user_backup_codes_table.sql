CREATE TABLE user_backup_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX user_backup_codes_user_id_idx
ON user_backup_codes(user_id);

CREATE INDEX user_backup_codes_user_id_used_at_idx
ON user_backup_codes(user_id, used_at);