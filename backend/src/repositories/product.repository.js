const pool = require('../config/database');
const findAll = async () => {
    const result = await pool.query(
        `
        SELECT 
            p.id,
            p.name,
            p.description,
            p.price,
            p.stock,
            p.active,
            p.category_id,
            c.name AS category_name,
            c.active AS category_active,
            p.created_at,
            p.updated_at
        FROM products p
        LEFT JOIN categories c
            ON p.category_id = c.id
        ORDER BY p.id ASC
        `
    );

    return result.rows;
};

const findById = async (id) => {
    const result = await pool.query(
        `
        SELECT 
            p.id,
            p.name,
            p.description,
            p.price,
            p.stock,
            p.active,
            p.category_id,
            c.name AS category_name,
            c.active AS category_active,
            p.created_at,
            p.updated_at
        FROM products p
        LEFT JOIN categories c
            ON p.category_id = c.id
        WHERE p.id = $1
        `,
        [id]
    );

    return result.rows[0];
};

const findByName = async (name) => {
    const result = await pool.query(
        'SELECT * FROM products WHERE LOWER(name) = LOWER($1)',
        [name]
    );

    return result.rows[0];
};


const findProductsByIds = async (ids) => {
    const result = await pool.query(
        'SELECT * FROM products WHERE id = ANY($1)',
        [ids]
    );

    return result.rows;
};

const findLowStockProducts = async () => {

    const result = await pool.query(
        `
    SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.minimum_stock,
        p.active,
        p.category_id,
        c.name AS category_name,
        c.active AS category_active,
        p.created_at,
        p.updated_at
    FROM products p
    LEFT JOIN categories c
        ON p.category_id = c.id
    WHERE p.active = true
    AND p.stock <= p.minimum_stock
    ORDER BY p.stock ASC, p.name ASC
        `
    )
    return result.rows;
};

const create = async (product) => {
    const { name, description, price, stock, categoryId } = product;

    const result = await pool.query(
        `
        INSERT INTO products (name, description, price, stock, category_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [name, description, price, stock, categoryId ?? null]
    );

    return result.rows[0];
};

const update = async (id, product) => {
    const { name, description, price, stock, categoryId } = product;

    const result = await pool.query(
        `
        UPDATE products
        SET name = $1,
            description = $2,
            price = $3,
            stock = $4,
            category_id = $5,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
        `,
        [name, description, price, stock, categoryId ?? null, id]
    );

    return result.rows[0];
};

const deactivate = async (id) => {
    const result = await pool.query(
        `
        UPDATE products
        SET active = false,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND active = true
        RETURNING *
        `,
        [id]
    );

    return result.rows[0];
};

const activate = async (id) => {
    const result = await pool.query(
        `
        UPDATE products
        SET active = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND active = false
        RETURNING *
        `,
        [id]
    );

    return result.rows[0];
};

const increaseStock = async (client, productId, quantity) => {
    const result = await client.query(
        `
        UPDATE products
        SET stock = stock + $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
        `,
        [quantity, productId]
    );

    return result.rows[0];
};

const decreaseStock = async (client, productId, quantity) => {
    const result = await client.query(
        `
        UPDATE products
        SET stock = stock - $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
        `,
        [quantity, productId]
    );

    return result.rows[0];
};

const decreaseStockIfAvailable = async (
    client,
    productId,
    quantity
) => {
    const result = await client.query(
        `
        UPDATE products
        SET stock = stock - $1
        WHERE id = $2
          AND stock >= $1
        RETURNING *
        `,
        [
            quantity,
            productId
        ]
    );

    return result.rows[0];
};


module.exports = {
    findAll,
    findById,
    findByName,
    findProductsByIds,
    findLowStockProducts,
    create,
    update,
    deactivate,
    activate,
    increaseStock,
    decreaseStock,
    decreaseStockIfAvailable
};