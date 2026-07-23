const reportRepository = require('../repositories/report.repository');

const getSalesSummary = async (from, to) => {
    const summary = await reportRepository.getSalesSummary(from, to);

    return {
        period: {
            from,
            to
        },
        completed_sales_count: summary.completed_sales_count,
        cancelled_sales_count: summary.cancelled_sales_count,
        total_sold: summary.total_sold,
        average_ticket: summary.average_ticket
    };
};

module.exports = {
    getSalesSummary
};