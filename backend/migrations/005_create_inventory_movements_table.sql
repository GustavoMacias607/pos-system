CREATE TABLE IF NOT EXISTS inventory_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (
        type IN (
            'PURCHASE',
            'SALE',
            'WASTE',
            'SUPPLIER_RETURN',
            'CUSTOMER_RETURN',
            'MANUAL_ADJUSTMENT'
        )
    ),
    quantity INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_movements_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
);