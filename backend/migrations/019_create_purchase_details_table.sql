CREATE TABLE purchase_details (
    id BIGSERIAL PRIMARY KEY,
    purchase_id BIGINT NOT NULL,
    product_id INTEGER NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost NUMERIC(10,2) NOT NULL,
    line_total NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_purchase_details_purchase
        FOREIGN KEY (purchase_id)
        REFERENCES purchases(id),

    CONSTRAINT fk_purchase_details_product
        FOREIGN KEY (product_id)
        REFERENCES products(id),

    CONSTRAINT purchase_details_quantity_check
        CHECK (quantity > 0),

    CONSTRAINT purchase_details_unit_cost_check
        CHECK (unit_cost >= 0),

    CONSTRAINT purchase_details_line_total_check
        CHECK (line_total >= 0),

    CONSTRAINT purchase_details_line_calculation_check
        CHECK (line_total = unit_cost * quantity),

    CONSTRAINT purchase_details_purchase_product_unique
        UNIQUE (purchase_id, product_id)
);

CREATE INDEX purchase_details_product_id_idx
ON purchase_details (product_id);