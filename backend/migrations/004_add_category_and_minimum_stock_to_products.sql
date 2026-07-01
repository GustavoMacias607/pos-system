ALTER TABLE products
ADD COLUMN IF NOT EXISTS category_id INTEGER;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS minimum_stock INTEGER NOT NULL DEFAULT 0;

ALTER TABLE products
ADD CONSTRAINT fk_products_category
FOREIGN KEY (category_id)
REFERENCES categories(id);