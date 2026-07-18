const pool = require('../config/database');

const findAllBySupplierId = async (supplierId) => {
    const result = await pool.query(
        `
        SELECT
            sp.id,
            sp.supplier_id,
            sp.product_id,
            p.name AS product_name,
            sp.supplier_product_code,
            sp.unit_cost,
            sp.active,
            p.active AS product_active,
            sp.created_at,
            sp.updated_at
        FROM supplier_products sp
        INNER JOIN products p
            ON p.id = sp.product_id
        WHERE sp.supplier_id = $1
        ORDER BY sp.id ASC
        `,
        [supplierId]
    );

    return result.rows;
};

const findBySupplierAndProduct = async (supplierId, productId) => {
    const result = await pool.query(
        `
        SELECT *
        FROM supplier_products
        WHERE supplier_id = $1
          AND product_id = $2
        `,
        [supplierId, productId]
    );

    return result.rows[0];
};

const findBySupplierAndCode = async (
    supplierId,
    supplierProductCode
) => {
    const result = await pool.query(
        `
        SELECT *
        FROM supplier_products
        WHERE supplier_id = $1
          AND LOWER(supplier_product_code) = LOWER($2)
        `,
        [supplierId, supplierProductCode]
    );

    return result.rows[0];
};

const create = async (data) => {
    const result = await pool.query(
        `
        INSERT INTO supplier_products (
            supplier_id,
            product_id,
            supplier_product_code,
            unit_cost
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
            data.supplierId,
            data.productId,
            data.supplierProductCode,
            data.unitCost
        ]
    );

    return result.rows[0];
};

const update = async (supplierId, productId, data) => {
    const result = await pool.query(
        `
        UPDATE supplier_products
        SET supplier_product_code = $1,
            unit_cost = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE supplier_id = $3
          AND product_id = $4
        RETURNING *
        `,
        [
            data.supplierProductCode,
            data.unitCost,
            supplierId,
            productId
        ]
    );

    return result.rows[0];
};

const deactivate = async (supplierId, productId) => {
    const result = await pool.query(
        `
        UPDATE supplier_products
        SET active = false,
            updated_at = CURRENT_TIMESTAMP
        WHERE supplier_id = $1
          AND product_id = $2
        RETURNING *
        `,
        [supplierId, productId]
    );

    return result.rows[0];
};

const activate = async (supplierId, productId) => {
    const result = await pool.query(
        `
        UPDATE supplier_products
        SET active = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE supplier_id = $1
          AND product_id = $2
        RETURNING *
        `,
        [supplierId, productId]
    );

    return result.rows[0];
};


const updateUnitCost = async (client, supplierId, productId, unitCost) => {
    const result = await client.query(
        `
        UPDATE supplier_products
        SET unit_cost = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE supplier_id = $2
        AND product_id = $3
        AND active = true
        RETURNING *
        `,
        [
            unitCost,
            supplierId,
            productId
        ]
    );
    return result.rows[0];
};

module.exports = {
    findAllBySupplierId,
    findBySupplierAndProduct,
    findBySupplierAndCode,
    create,
    update,
    deactivate,
    activate,
    updateUnitCost
};