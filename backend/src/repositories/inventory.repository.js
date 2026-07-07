const createMovement = async (client, movement) => {
    const result = await client.query(
        `
        INSERT INTO inventory_movements (
            product_id,
            type,
            quantity,
            reason
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
            movement.productId,
            movement.type,
            movement.quantity,
            movement.reason
        ]
    );

    return result.rows[0];
};

module.exports = {
    createMovement
};