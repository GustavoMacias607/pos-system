CREATE TABLE cash_register_sessions (
    id BIGSERIAL PRIMARY KEY,
    cash_register_id BIGINT NOT NULL,
    opened_by_user_id INTEGER NOT NULL,
    closed_by_user_id INTEGER,
    opening_amount NUMERIC(12,2) NOT NULL,
    expected_amount NUMERIC(12,2),
    closing_amount NUMERIC(12,2),
    difference_amount NUMERIC(12,2),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    opening_notes TEXT,
    closing_notes TEXT,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cash_register_sessions_register
        FOREIGN KEY (cash_register_id)
        REFERENCES cash_registers(id),

    CONSTRAINT fk_cash_register_sessions_opened_by_user
        FOREIGN KEY (opened_by_user_id)
        REFERENCES users(id),

    CONSTRAINT fk_cash_register_sessions_closed_by_user
        FOREIGN KEY (closed_by_user_id)
        REFERENCES users(id),

    CONSTRAINT cash_register_sessions_opening_amount_check
        CHECK (opening_amount >= 0),

    CONSTRAINT cash_register_sessions_expected_amount_check
        CHECK (
            expected_amount IS NULL
            OR expected_amount >= 0
        ),

    CONSTRAINT cash_register_sessions_closing_amount_check
        CHECK (
            closing_amount IS NULL
            OR closing_amount >= 0
        ),

    CONSTRAINT cash_register_sessions_status_check
        CHECK (status IN ('OPEN', 'CLOSED')),

    CONSTRAINT cash_register_sessions_opening_notes_check
        CHECK (
            opening_notes IS NULL
            OR BTRIM(opening_notes) <> ''
        ),

    CONSTRAINT cash_register_sessions_closing_notes_check
        CHECK (
            closing_notes IS NULL
            OR BTRIM(closing_notes) <> ''
        ),

    CONSTRAINT cash_register_sessions_difference_check
        CHECK (
            difference_amount IS NULL
            OR difference_amount = closing_amount - expected_amount
        ),

    CONSTRAINT cash_register_sessions_state_check
        CHECK (
            (
                status = 'OPEN'
                AND closed_by_user_id IS NULL
                AND expected_amount IS NULL
                AND closing_amount IS NULL
                AND difference_amount IS NULL
                AND closed_at IS NULL
            )
            OR
            (
                status = 'CLOSED'
                AND closed_by_user_id IS NOT NULL
                AND expected_amount IS NOT NULL
                AND closing_amount IS NOT NULL
                AND difference_amount IS NOT NULL
                AND closed_at IS NOT NULL
            )
        )
);

CREATE UNIQUE INDEX cash_register_sessions_register_open_unique_idx
ON cash_register_sessions (cash_register_id)
WHERE status = 'OPEN';

CREATE UNIQUE INDEX cash_register_sessions_user_open_unique_idx
ON cash_register_sessions (opened_by_user_id)
WHERE status = 'OPEN';

CREATE INDEX cash_register_sessions_register_id_idx
ON cash_register_sessions (cash_register_id);

CREATE INDEX cash_register_sessions_opened_by_user_id_idx
ON cash_register_sessions (opened_by_user_id);

CREATE INDEX cash_register_sessions_status_idx
ON cash_register_sessions (status);

CREATE INDEX cash_register_sessions_opened_at_idx
ON cash_register_sessions (opened_at DESC);