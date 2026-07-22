CREATE TABLE cash_movements (
    id BIGSERIAL PRIMARY KEY,
    cash_session_id BIGINT NOT NULL,
    created_by_user_id INTEGER NOT NULL,
    type VARCHAR(30) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    reason TEXT NOT NULL,
    sale_id INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cash_movements_session
        FOREIGN KEY (cash_session_id)
        REFERENCES cash_register_sessions(id),

    CONSTRAINT fk_cash_movements_created_by_user
        FOREIGN KEY (created_by_user_id)
        REFERENCES users(id),

    CONSTRAINT fk_cash_movements_sale
        FOREIGN KEY (sale_id)
        REFERENCES sales(id),

    CONSTRAINT cash_movements_type_check
        CHECK (
            type IN (
                'CASH_IN',
                'CASH_OUT',
                'SALE',
                'REFUND'
            )
        ),

    CONSTRAINT cash_movements_amount_check
        CHECK (amount > 0),

    CONSTRAINT cash_movements_reason_check
        CHECK (BTRIM(reason) <> ''),

    CONSTRAINT cash_movements_sale_relation_check
        CHECK (
            (
                type IN ('CASH_IN', 'CASH_OUT')
                AND sale_id IS NULL
            )
            OR
            (
                type IN ('SALE', 'REFUND')
                AND sale_id IS NOT NULL
            )
        )
);

CREATE INDEX cash_movements_session_id_idx
ON cash_movements (cash_session_id);

CREATE INDEX cash_movements_created_by_user_id_idx
ON cash_movements (created_by_user_id);

CREATE INDEX cash_movements_type_idx
ON cash_movements (type);

CREATE INDEX cash_movements_sale_id_idx
ON cash_movements (sale_id)
WHERE sale_id IS NOT NULL;

CREATE INDEX cash_movements_created_at_idx
ON cash_movements (created_at DESC);