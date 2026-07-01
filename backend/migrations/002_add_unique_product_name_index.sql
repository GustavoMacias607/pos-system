CREATE UNIQUE INDEX IF NOT EXISTS unique_product_name_lower
ON products (LOWER(name));