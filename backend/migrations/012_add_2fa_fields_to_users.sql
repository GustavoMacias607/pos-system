ALTER TABLE users
ADD COLUMN two_factor_secret TEXT,
ADD COLUMN two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN two_factor_enabled_at TIMESTAMP;