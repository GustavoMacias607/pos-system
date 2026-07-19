ALTER TABLE sales
ADD COLUMN client_id BIGINT;

ALTER TABLE sales
ADD CONSTRAINT fk_sales_client
FOREIGN KEY (client_id)
REFERENCES clients(id);

CREATE INDEX sales_client_id_idx
ON sales (client_id)
WHERE client_id IS NOT NULL;