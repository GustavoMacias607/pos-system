CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    subtotal NUMERIC(10, 2) NOT NULL,
    discount_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    tax NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (
        payment_method IN ('CASH', 'CARD', 'TRANSFER')
    ),
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED' CHECK (
        status IN ('COMPLETED', 'CANCELLED')
    ),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);