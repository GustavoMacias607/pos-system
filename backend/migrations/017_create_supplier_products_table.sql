CREATE TABLE supplier_products (
    id BIGSERIAL PRIMARY KEY,
    supplier_id BIGINT NOT NULL,
    product_id INTEGER NOT NULL,
    supplier_product_code VARCHAR(100),
    unit_cost NUMERIC(10,2) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_supplier_products_supplier
        FOREIGN KEY (supplier_id)
        REFERENCES suppliers(id),

    CONSTRAINT fk_supplier_products_product
        FOREIGN KEY (product_id)
        REFERENCES products(id),

    CONSTRAINT supplier_products_unit_cost_check
        CHECK (unit_cost >= 0),

    CONSTRAINT supplier_products_supplier_product_unique
        UNIQUE (supplier_id, product_id)
);

CREATE UNIQUE INDEX supplier_products_supplier_code_unique_idx
ON supplier_products (
    supplier_id,
    LOWER(supplier_product_code)
)
WHERE supplier_product_code IS NOT NULL;