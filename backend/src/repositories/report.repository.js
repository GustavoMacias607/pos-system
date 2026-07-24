const pool = require('../config/database');

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
        WHERE created_at >= $1::date
          AND created_at < $2::date + INTERVAL '1 day'
        `,
        [from, to]
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
            AND s.created_at >= $1::date
            AND s.created_at < $2::date + INTERVAL '1 day'
        GROUP BY
            pm.payment_method,
            pm.sort_order
        ORDER BY
            pm.sort_order
        `,
        [from, to]
    );

    return result.rows;
};

module.exports = {
    getSalesSummary,
    getSalesByPaymentMethod
};
