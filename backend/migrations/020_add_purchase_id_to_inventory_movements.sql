ALTER TABLE inventory_movements
ADD COLUMN purchase_id BIGINT;

ALTER TABLE inventory_movements
ADD CONSTRAINT fk_inventory_movements_purchase
FOREIGN KEY (purchase_id)
REFERENCES purchases(id);

CREATE INDEX inventory_movements_purchase_id_idx
ON inventory_movements (purchase_id)
WHERE purchase_id IS NOT NULL;