const pool = require('../config/database');

const findAll = async () => {
    const result = await pool.query(
        'SELECT * FROM products ORDER BY id ASC'
    );

    return result.rows;
};

const findById = async (id) => {
    const result = await pool.query(
        'SELECT * FROM products WHERE id = $1',
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


const create = async (product) => {
    const { name, description, price, stock } = product;

    const result = await pool.query(
        `
        INSERT INTO products (name, description, price, stock)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [name, description, price, stock]
    );

    return result.rows[0];
};

const update = async (id, product) => {
    const { name, description, price, stock } = product;

    const result = await pool.query(
        `
        UPDATE products
        SET name = $1,
            description = $2,
            price = $3,
            stock = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
        `,
        [name, description, price, stock, id]
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

module.exports = {
    findAll,
    findById,
    findByName,
    findProductsByIds,
    create,
    update,
    deactivate,
    activate,
    increaseStock,
    decreaseStock
};