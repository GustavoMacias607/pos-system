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
            purchase_details,
            purchases,
            suppliers,
            users,
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

test('returns the sales summary within the date range', async () => {
    await pool.query(`
        INSERT INTO sales (
            subtotal,
            discount_total,
            tax,
            total,
            payment_method,
            status,
            created_at
        )
        VALUES
            (
                100.00,
                0.00,
                0.00,
                100.00,
                'CASH',
                'COMPLETED',
                '2026-07-10 12:00:00-06'
            ),
            (
                50.00,
                0.00,
                0.00,
                50.00,
                'CARD',
                'COMPLETED',
                '2026-07-31 12:00:00-06'
            ),
            (
                40.00,
                0.00,
                0.00,
                40.00,
                'TRANSFER',
                'CANCELLED',
                '2026-07-20 12:00:00-06'
            ),
            (
                200.00,
                0.00,
                0.00,
                200.00,
                'CASH',
                'COMPLETED',
                '2026-08-01 12:00:00-06'
            )
    `);

    const result = await reportRepository.getSalesSummary(
        '2026-07-01',
        '2026-07-31'
    );

    expect(result).toEqual({
        completed_sales_count: 2,
        cancelled_sales_count: 1,
        total_sold: '150.00',
        average_ticket: '75.00'
    });
});

test('returns sales grouped by payment method within the date range', async () => {
    await pool.query(`
        INSERT INTO sales (
            subtotal,
            discount_total,
            tax,
            total,
            payment_method,
            status,
            created_at
        )
        VALUES
            (
                100.00,
                0.00,
                0.00,
                100.00,
                'CASH',
                'COMPLETED',
                '2026-07-10 12:00:00-06'
            ),
            (
                50.00,
                0.00,
                0.00,
                50.00,
                'CASH',
                'COMPLETED',
                '2026-07-15 12:00:00-06'
            ),
            (
                40.00,
                0.00,
                0.00,
                40.00,
                'CASH',
                'CANCELLED',
                '2026-07-20 12:00:00-06'
            ),
            (
                75.00,
                0.00,
                0.00,
                75.00,
                'CARD',
                'COMPLETED',
                '2026-07-25 12:00:00-06'
            ),
            (
                25.00,
                0.00,
                0.00,
                25.00,
                'CARD',
                'CANCELLED',
                '2026-07-28 12:00:00-06'
            ),
            (
                200.00,
                0.00,
                0.00,
                200.00,
                'TRANSFER',
                'COMPLETED',
                '2026-08-01 12:00:00-06'
            )
    `);

    const result = await reportRepository.getSalesByPaymentMethod(
        '2026-07-01',
        '2026-07-31'
    );

    expect(result).toEqual([
        {
            payment_method: 'CASH',
            completed_sales: 2,
            cancelled_sales: 1,
            total_sold: '150.00',
            average_ticket: '75.00'
        },
        {
            payment_method: 'CARD',
            completed_sales: 1,
            cancelled_sales: 1,
            total_sold: '75.00',
            average_ticket: '75.00'
        },
        {
            payment_method: 'TRANSFER',
            completed_sales: 0,
            cancelled_sales: 0,
            total_sold: '0.00',
            average_ticket: '0.00'
        }
    ]);
});

test('returns sales grouped by day within the date range', async () => {
    await pool.query(`
        INSERT INTO sales (
            subtotal,
            discount_total,
            tax,
            total,
            payment_method,
            status,
            created_at
        )
        VALUES
            (
                100.00,
                0.00,
                0.00,
                100.00,
                'CASH',
                'COMPLETED',
                '2026-07-10 12:00:00-06'
            ),
            (
                40.00,
                0.00,
                0.00,
                40.00,
                'CARD',
                'CANCELLED',
                '2026-07-10 15:00:00-06'
            ),
            (
                50.00,
                0.00,
                0.00,
                50.00,
                'CASH',
                'COMPLETED',
                '2026-07-12 10:00:00-06'
            ),
            (
                100.00,
                0.00,
                0.00,
                100.00,
                'TRANSFER',
                'COMPLETED',
                '2026-07-12 18:00:00-06'
            ),
            (
                200.00,
                0.00,
                0.00,
                200.00,
                'CASH',
                'COMPLETED',
                '2026-07-13 12:00:00-06'
            )
    `);

    const result = await reportRepository.getSalesByDay(
        '2026-07-10',
        '2026-07-12'
    );

    expect(result).toEqual([
        {
            date: '2026-07-10',
            completed_sales: 1,
            cancelled_sales: 1,
            total_sold: '100.00',
            average_ticket: '100.00'
        },
        {
            date: '2026-07-11',
            completed_sales: 0,
            cancelled_sales: 0,
            total_sold: '0.00',
            average_ticket: '0.00'
        },
        {
            date: '2026-07-12',
            completed_sales: 2,
            cancelled_sales: 0,
            total_sold: '150.00',
            average_ticket: '75.00'
        }
    ]);
});

test('returns active products with stock at or below the minimum', async () => {
    const productsResult = await pool.query(`
        INSERT INTO products (
            name,
            description,
            price,
            stock,
            minimum_stock,
            active
        )
        VALUES
            ('Café', 'Stock muy bajo', 10.00, 1, 10, TRUE),
            ('Azúcar', 'Stock bajo', 8.00, 2, 7, TRUE),
            ('Frijol', 'Stock bajo', 20.00, 2, 7, TRUE),
            ('Galleta', 'Stock en el mínimo', 7.00, 5, 5, TRUE),
            ('Té', 'Stock suficiente', 7.00, 10, 5, TRUE),
            ('Producto inactivo', 'Stock bajo e inactivo', 15.00, 0, 20, FALSE)
        RETURNING id, name
    `);

    const productIds = Object.fromEntries(
        productsResult.rows.map((product) => [
            product.name,
            product.id
        ])
    );

    const result = await reportRepository.getLowStockProducts();

    expect(result).toEqual([
        {
            product_id: productIds['Café'],
            product_name: 'Café',
            stock: 1,
            minimum_stock: 10,
            units_needed: 9
        },
        {
            product_id: productIds['Azúcar'],
            product_name: 'Azúcar',
            stock: 2,
            minimum_stock: 7,
            units_needed: 5
        },
        {
            product_id: productIds['Frijol'],
            product_name: 'Frijol',
            stock: 2,
            minimum_stock: 7,
            units_needed: 5
        },
        {
            product_id: productIds['Galleta'],
            product_name: 'Galleta',
            stock: 5,
            minimum_stock: 5,
            units_needed: 0
        }
    ]);
});

test('returns purchases grouped by supplier within the date range', async () => {
    const userResult = await pool.query(`
        INSERT INTO users (
            name,
            email,
            password_hash,
            role
        )
        VALUES (
            'Usuario de prueba',
            'reports@example.com',
            'test-password-hash',
            'ADMIN'
        )
        RETURNING id
    `);

    const userId = userResult.rows[0].id;

    const suppliersResult = await pool.query(`
        INSERT INTO suppliers (name)
        VALUES
            ('Proveedor A'),
            ('Proveedor B'),
            ('Proveedor C')
        RETURNING id, name
    `);

    const supplierIds = Object.fromEntries(
        suppliersResult.rows.map((supplier) => [
            supplier.name,
            supplier.id
        ])
    );

    await pool.query(
        `
        INSERT INTO purchases (
            supplier_id,
            created_by_user_id,
            subtotal,
            tax,
            total,
            status,
            created_at
        )
        VALUES
            (
                $1,
                $4,
                500.00,
                0.00,
                500.00,
                'COMPLETED',
                '2026-07-01 00:00:00-06'
            ),
            (
                $1,
                $4,
                300.00,
                0.00,
                300.00,
                'COMPLETED',
                '2026-07-15 12:00:00-06'
            ),
            (
                $1,
                $4,
                900.00,
                0.00,
                900.00,
                'CANCELLED',
                '2026-07-20 12:00:00-06'
            ),
            (
                $2,
                $4,
                600.00,
                0.00,
                600.00,
                'COMPLETED',
                '2026-07-31 23:59:59.999999-06'
            ),
            (
                $3,
                $4,
                1000.00,
                0.00,
                1000.00,
                'COMPLETED',
                '2026-06-30 23:59:59.999999-06'
            )
        `,
        [
            supplierIds['Proveedor A'],
            supplierIds['Proveedor B'],
            supplierIds['Proveedor C'],
            userId
        ]
    );

    const result = await reportRepository.getPurchasesBySupplier(
        '2026-07-01',
        '2026-07-31'
    );

    expect(result).toEqual([
        {
            supplier_id: supplierIds['Proveedor A'],
            supplier_name: 'Proveedor A',
            completed_purchases: 2,
            cancelled_purchases: 1,
            total_purchased: '800.00',
            average_purchase: '400.00'
        },
        {
            supplier_id: supplierIds['Proveedor B'],
            supplier_name: 'Proveedor B',
            completed_purchases: 1,
            cancelled_purchases: 0,
            total_purchased: '600.00',
            average_purchase: '600.00'
        }
    ]);
});
