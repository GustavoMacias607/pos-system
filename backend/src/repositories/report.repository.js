const pool = require('../config/database');

const REPORT_TIME_ZONE = 'America/Mexico_City';

const getSalesSummary = async (from, to) => {
    const result = await pool.query(
        `
        SELECT
            (
                COUNT(*) FILTER (WHERE status = 'COMPLETED')
            )::integer AS completed_sales_count,
            (
                COUNT(*) FILTER (WHERE status = 'CANCELLED')
            )::integer AS cancelled_sales_count,
            COALESCE(
                SUM(total) FILTER (WHERE status = 'COMPLETED'),
                0.00
            ) AS total_sold,
            COALESCE(
                ROUND(
                    AVG(total) FILTER (WHERE status = 'COMPLETED'),
                    2
                ),
                0.00
            ) AS average_ticket
        FROM sales
        WHERE
            created_at >= (
                $1::date::timestamp
                AT TIME ZONE $3
            )
            AND created_at < (
                ($2::date + 1)::timestamp
                AT TIME ZONE $3
            )
        `,
        [from, to, REPORT_TIME_ZONE]
    );

    return result.rows[0];
};

const getSalesByPaymentMethod = async (from, to) => {
    const result = await pool.query(
        `
        WITH payment_methods(payment_method, sort_order) AS (
            VALUES
                ('CASH', 1),
                ('CARD', 2),
                ('TRANSFER', 3)
        )
        SELECT
            pm.payment_method,
            (
                COUNT(s.id) FILTER (
                    WHERE s.status = 'COMPLETED'
                )
            )::integer AS completed_sales,
            (
                COUNT(s.id) FILTER (
                    WHERE s.status = 'CANCELLED'
                )
            )::integer AS cancelled_sales,
            COALESCE(
                SUM(s.total) FILTER (
                    WHERE s.status = 'COMPLETED'
                ),
                0.00
            ) AS total_sold,
            COALESCE(
                ROUND(
                    AVG(s.total) FILTER (
                        WHERE s.status = 'COMPLETED'
                    ),
                    2
                ),
                0.00
            ) AS average_ticket
        FROM payment_methods pm
        LEFT JOIN sales s
            ON s.payment_method = pm.payment_method
            AND s.created_at >= (
                $1::date::timestamp
                AT TIME ZONE $3
            )
            AND s.created_at < (
                ($2::date + 1)::timestamp
                AT TIME ZONE $3
            )
        GROUP BY
            pm.payment_method,
            pm.sort_order
        ORDER BY
            pm.sort_order
        `,
        [from, to, REPORT_TIME_ZONE]
    );

    return result.rows;
};

const getSalesByDay = async (from, to) => {
    const result = await pool.query(
        `
        WITH report_days AS (
            SELECT
                generate_series(
                    $1::date,
                    $2::date,
                    INTERVAL '1 day'
                )::date AS report_date
        )
        SELECT
            TO_CHAR(rd.report_date, 'YYYY-MM-DD') AS date,
            (
                COUNT(s.id) FILTER (
                    WHERE s.status = 'COMPLETED'
                )
            )::integer AS completed_sales,
            (
                COUNT(s.id) FILTER (
                    WHERE s.status = 'CANCELLED'
                )
            )::integer AS cancelled_sales,
            COALESCE(
                SUM(s.total) FILTER (
                    WHERE s.status = 'COMPLETED'
                ),
                0.00
            ) AS total_sold,
            COALESCE(
                ROUND(
                    AVG(s.total) FILTER (
                        WHERE s.status = 'COMPLETED'
                    ),
                    2
                ),
                0.00
            ) AS average_ticket
        FROM report_days rd
        LEFT JOIN sales s
            ON s.created_at >= (
                rd.report_date::timestamp
                AT TIME ZONE $3
            )
            AND s.created_at < (
                (rd.report_date + 1)::timestamp
                AT TIME ZONE $3
            )
        GROUP BY
            rd.report_date
        ORDER BY
            rd.report_date ASC
        `,
        [from, to, REPORT_TIME_ZONE]
    );

    return result.rows;
};

const getTopSellingProducts = async (from, to, limit = 10) => {
    const result = await pool.query(
        `
        SELECT
            sd.product_id,
            p.name AS product_name,
            (
                COUNT(DISTINCT sd.sale_id)
            )::integer AS completed_sales,
            (
                SUM(sd.quantity)
            )::integer AS units_sold,
            ROUND(
                SUM(sd.line_total),
                2
            ) AS total_sold
        FROM sale_details sd
        INNER JOIN sales s
            ON s.id = sd.sale_id
        INNER JOIN products p
            ON p.id = sd.product_id
        WHERE
            s.status = 'COMPLETED'
            AND s.created_at >= (
                $1::date::timestamp
                AT TIME ZONE $3
            )
            AND s.created_at < (
                ($2::date + 1)::timestamp
                AT TIME ZONE $3
            )
        GROUP BY
            sd.product_id,
            p.name
        ORDER BY
            units_sold DESC,
            total_sold DESC,
            sd.product_id ASC
        LIMIT $4
        `,
        [from, to, REPORT_TIME_ZONE, limit]
    );

    return result.rows;
};

const getLowStockProducts = async () => {
    const result = await pool.query(
        `
        SELECT
            p.id AS product_id,
            p.name AS product_name,
            p.stock,
            p.minimum_stock,
            GREATEST(
                p.minimum_stock - p.stock,
                0
            )::integer AS units_needed
        FROM products p
        WHERE
            p.active = TRUE
            AND p.stock <= p.minimum_stock
        ORDER BY
            units_needed DESC,
            p.stock ASC,
            p.name ASC
        `
    );

    return result.rows;
};

const getPurchasesBySupplier = async (from, to) => {
    const result = await pool.query(
        `
        SELECT
            s.id AS supplier_id,
            s.name AS supplier_name,
            (
                COUNT(p.id) FILTER (
                    WHERE p.status = 'COMPLETED'
                )
            )::integer AS completed_purchases,
            (
                COUNT(p.id) FILTER (
                    WHERE p.status = 'CANCELLED'
                )
            )::integer AS cancelled_purchases,
            COALESCE(
                SUM(p.total) FILTER (
                    WHERE p.status = 'COMPLETED'
                ),
                0.00
            ) AS total_purchased,
            COALESCE(
                ROUND(
                    AVG(p.total) FILTER (
                        WHERE p.status = 'COMPLETED'
                    ),
                    2
                ),
                0.00
            ) AS average_purchase
        FROM purchases p
        INNER JOIN suppliers s
            ON s.id = p.supplier_id
        WHERE
            p.created_at >= (
                $1::date::timestamp
                AT TIME ZONE $3
            )
            AND p.created_at < (
                ($2::date + 1)::timestamp
                AT TIME ZONE $3
            )
        GROUP BY
            s.id,
            s.name
        ORDER BY
            total_purchased DESC,
            completed_purchases DESC,
            s.id ASC
        `,
        [from, to, REPORT_TIME_ZONE]
    );

    return result.rows;
};

module.exports = {
    getSalesSummary,
    getSalesByPaymentMethod,
    getSalesByDay,
    getTopSellingProducts,
    getLowStockProducts,
    getPurchasesBySupplier
};