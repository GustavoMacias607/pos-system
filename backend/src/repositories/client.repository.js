const pool = require('../config/database');


const findAll = async () => {
    const result = await pool.query(
        `
        SELECT * FROM clients ORDER BY id ASC
        `
    );
    return result.rows;
}

const findById = async (id) => {
    const result = await pool.query(
        `
        SELECT * FROM clients 
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
        FROM clients
        WHERE LOWER(email) = LOWER($1)
        `,
        [email]
    );

    return result.rows[0];
};

const create = async (clientData) => {
    const result = await pool.query(
        `
        INSERT INTO 
        clients (name, email, phone, address) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *`,
        [clientData.name, clientData.email, clientData.phone, clientData.address]
    );
    return result.rows[0];
}

const update = async (id, clientData) => {
    const result = await pool.query(
        `
        UPDATE clients
        SET name = $1,
            email = $2,
            phone = $3,
            address = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
        `,
        [clientData.name, clientData.email, clientData.phone, clientData.address, id]
    );

    return result.rows[0];
};

const deactivate = async (id) => {
    const result = await pool.query(
        `
        UPDATE clients
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
        UPDATE clients
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