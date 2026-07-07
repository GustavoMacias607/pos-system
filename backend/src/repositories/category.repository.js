const pool = require('../config/database');


const findAll = async () => {
    const result = await pool.query(
        `
        SELECT * FROM categories ORDER BY id ASC
        `
    );
    return result.rows;
}

const findById = async (id) => {
    const result = await pool.query(
        `
        SELECT * FROM categories 
        WHERE id = $1
        `,
        [id]
    );
    return result.rows[0];
}

const findByName = async (name) => {
    const result = await pool.query(
        `
        SELECT *
        FROM categories
        WHERE LOWER(name) = LOWER($1)
        `,
        [name]
    );

    return result.rows[0];
};

const create = async (category) => {
    const result = await pool.query(
        `
        INSERT INTO 
        categories (name, description) 
        VALUES ($1, $2) 
        RETURNING *`,
        [category.name, category.description]
    );
    return result.rows[0];
}

const update = async (id, category) => {
    const result = await pool.query(
        `
        UPDATE categories
        SET name = $1,
            description = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
        `,
        [category.name, category.description, id]
    );

    return result.rows[0];
};

const deactivate = async (id) => {
    const result = await pool.query(
        `
        UPDATE categories
        SET active = false,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
        `,
        [id]
    );

    return result.rows[0];
};

const activate = async (id) => {
    const result = await pool.query(
        `
        UPDATE categories
        SET active = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
        `,
        [id]
    );

    return result.rows[0];
};

module.exports = {
    findAll,
    findById,
    findByName,
    create,
    update,
    deactivate,
    activate
}