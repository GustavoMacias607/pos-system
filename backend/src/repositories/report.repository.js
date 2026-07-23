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

module.exports = {
    getSalesSummary
};