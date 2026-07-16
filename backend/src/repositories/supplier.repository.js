const pool = require('../config/database');


const findAll = async () => {
    const result = await pool.query(
        `
        SELECT * FROM suppliers ORDER BY id ASC
        `
    );
    return result.rows;
}

const findById = async (id) => {
    const result = await pool.query(
        `
        SELECT * FROM suppliers
        WHERE id = $1
        `,
        [id]
    );
    return result.rows[0];
}

const findByEmail = async (email) => {
    const result = await pool.query(
        `
        SELECT *
        FROM suppliers
        WHERE LOWER(email) = LOWER($1)
        `,
        [email]
    );

    return result.rows[0];
};

const create = async (supplierData) => {
    const result = await pool.query(
        `
        INSERT INTO suppliers (name, contact_name, email, phone, address)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
            supplierData.name,
            supplierData.contactName,
            supplierData.email,
            supplierData.phone,
            supplierData.address
        ]
    );

    return result.rows[0];
};
const update = async (id, supplierData) => {
    const result = await pool.query(
        `
        UPDATE suppliers
        SET name = $1,
            contact_name = $2,
            email = $3,
            phone = $4,
            address = $5,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
        `,
        [supplierData.name, supplierData.contactName, supplierData.email, supplierData.phone, supplierData.address, id]
    );

    return result.rows[0];
};

const deactivate = async (id) => {
    const result = await pool.query(
        `
        UPDATE suppliers
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
        UPDATE suppliers
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
    findByEmail,
    create,
    update,
    deactivate,
    activate
}