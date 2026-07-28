const expectedDatabase = 'pos_test_db';

if (process.env.DB_NAME !== expectedDatabase) {
    throw new Error(
        `Integration test blocked: DB_NAME must be "${expectedDatabase}"`
    );
}

const pool = require('../../../src/config/database');
const reportRepository = require(
    '../../../src/repositories/report.repository'
);

beforeEach(async () => {
    await pool.query(`
        TRUNCATE TABLE
            sale_details,
            sales,
            products
        RESTART IDENTITY CASCADE
    `);
});

afterAll(async () => {
    await pool.end();
});


test('returns the top-selling products from completed sales', async () => {
    const productsResult = await pool.query(`
        INSERT INTO products (
            name,
            description,
            price,
            stock
        )
        VALUES
            ('Café', 'Café de prueba', 10.00, 100),
            ('Té', 'Té de prueba', 7.00, 100),
            ('Galleta', 'Galleta de prueba', 7.00, 100),
            ('Producto excluido', 'Producto excluido', 20.00, 100)
        RETURNING id, name
    `);

    const productIds = Object.fromEntries(
        productsResult.rows.map((product) => [
            product.name,
            product.id
        ])
    );

    const completedSaleOneResult = await pool.query(`
    INSERT INTO sales (
        subtotal,
        discount_total,
        tax,
        total,
        payment_method,
        status,
        created_at
    )
    VALUES (
        48.00,
        0.00,
        0.00,
        48.00,
        'CASH',
        'COMPLETED',
        '2026-07-10 12:00:00'
    )
    RETURNING id
`);

    const completedSaleTwoResult = await pool.query(`
    INSERT INTO sales (
        subtotal,
        discount_total,
        tax,
        total,
        payment_method,
        status,
        created_at
    )
    VALUES (
        24.00,
        0.00,
        0.00,
        24.00,
        'CARD',
        'COMPLETED',
        '2026-07-15 12:00:00'
    )
    RETURNING id
`);

    const cancelledSaleResult = await pool.query(`
    INSERT INTO sales (
        subtotal,
        discount_total,
        tax,
        total,
        payment_method,
        status,
        created_at
    )
    VALUES (
        20.00,
        0.00,
        0.00,
        20.00,
        'CASH',
        'CANCELLED',
        '2026-07-20 12:00:00'
    )
    RETURNING id
`);

    const outsideRangeSaleResult = await pool.query(`
    INSERT INTO sales (
        subtotal,
        discount_total,
        tax,
        total,
        payment_method,
        status,
        created_at
    )
    VALUES (
        20.00,
        0.00,
        0.00,
        20.00,
        'TRANSFER',
        'COMPLETED',
        '2026-08-01 12:00:00'
    )
    RETURNING id
`);

    const saleIds = {
        completedOne: completedSaleOneResult.rows[0].id,
        completedTwo: completedSaleTwoResult.rows[0].id,
        cancelled: cancelledSaleResult.rows[0].id,
        outsideRange: outsideRangeSaleResult.rows[0].id
    };

    await pool.query(
        `
    INSERT INTO sale_details (
        sale_id,
        product_id,
        product_name,
        quantity,
        unit_price,
        discount,
        line_total
    )
    VALUES
        ($1, $5, 'Café', 2, 10.00, 0.00, 20.00),
        ($1, $6, 'Té', 3, 7.00, 0.00, 21.00),
        ($1, $7, 'Galleta', 1, 7.00, 0.00, 7.00),
        ($2, $5, 'Café', 1, 10.00, 0.00, 10.00),
        ($2, $7, 'Galleta', 2, 7.00, 0.00, 14.00),
        ($3, $8, 'Producto excluido', 1, 20.00, 0.00, 20.00),
        ($4, $8, 'Producto excluido', 1, 20.00, 0.00, 20.00)
    `,
        [
            saleIds.completedOne,
            saleIds.completedTwo,
            saleIds.cancelled,
            saleIds.outsideRange,
            productIds['Café'],
            productIds['Té'],
            productIds['Galleta'],
            productIds['Producto excluido']
        ]
    );

    const result = await reportRepository.getTopSellingProducts(
        '2026-07-01',
        '2026-07-31',
        10
    );

    expect(result).toEqual([
        {
            product_id: productIds['Café'],
            product_name: 'Café',
            completed_sales: 2,
            units_sold: 3,
            total_sold: '30.00'
        },
        {
            product_id: productIds['Té'],
            product_name: 'Té',
            completed_sales: 1,
            units_sold: 3,
            total_sold: '21.00'
        },
        {
            product_id: productIds['Galleta'],
            product_name: 'Galleta',
            completed_sales: 2,
            units_sold: 3,
            total_sold: '21.00'
        }
    ]);

    const limitedResult = await reportRepository.getTopSellingProducts(
        '2026-07-01',
        '2026-07-31',
        2
    );

    expect(limitedResult).toEqual(result.slice(0, 2));
});
