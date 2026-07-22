CREATE TABLE cash_registers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT cash_registers_name_check
        CHECK (BTRIM(name) <> ''),

    CONSTRAINT cash_registers_location_check
        CHECK (
            location IS NULL
            OR BTRIM(location) <> ''
        )
);

CREATE UNIQUE INDEX cash_registers_name_unique_idx
ON cash_registers (LOWER(name));