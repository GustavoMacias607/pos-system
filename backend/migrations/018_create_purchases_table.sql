CREATE TABLE purchases (
    id BIGSERIAL PRIMARY KEY,
    supplier_id BIGINT NOT NULL,
    created_by_user_id INTEGER NOT NULL,
    invoice_number VARCHAR(100),
    subtotal NUMERIC(12,2) NOT NULL,
    tax NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_purchases_supplier
        FOREIGN KEY (supplier_id)
        REFERENCES suppliers(id),

    CONSTRAINT fk_purchases_created_by_user
        FOREIGN KEY (created_by_user_id)
        REFERENCES users(id),

    CONSTRAINT purchases_subtotal_check
        CHECK (subtotal >= 0),

    CONSTRAINT purchases_tax_check
        CHECK (tax >= 0),

    CONSTRAINT purchases_total_check
        CHECK (total >= 0),

    CONSTRAINT purchases_status_check
        CHECK (status IN ('COMPLETED', 'CANCELLED')),

    CONSTRAINT purchases_invoice_number_check
        CHECK (
            invoice_number IS NULL
            OR BTRIM(invoice_number) <> ''
        )
);

CREATE UNIQUE INDEX purchases_supplier_invoice_unique_idx
ON purchases (
    supplier_id,
    LOWER(invoice_number)
)
WHERE invoice_number IS NOT NULL;

CREATE INDEX purchases_supplier_id_idx
ON purchases (supplier_id);

CREATE INDEX purchases_status_idx
ON purchases (status);

CREATE INDEX purchases_created_at_idx
ON purchases (created_at DESC);