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

const getSalesByPaymentMethod = async (from, to) => {
    const salesByPaymentMethod = await reportRepository.getSalesByPaymentMethod(from, to);

    return {
        period: {
            from,
            to
        },
        paymentMethods: salesByPaymentMethod
    };
};

const getSalesByDay = async (from, to) => {
    const salesByDay = await reportRepository.getSalesByDay(from, to);

    return {
        period: {
            from,
            to
        },
        days: salesByDay
    };
};

const getTopSellingProducts = async (from, to, limit = 10) => {
    const normalizedLimit = Number(limit);

    const products = await reportRepository.getTopSellingProducts(
        from,
        to,
        normalizedLimit
    );

    return {
        period: {
            from,
            to
        },
        limit: normalizedLimit,
        products
    };
};

const getLowStockProducts = async () => {
    const products = await reportRepository.getLowStockProducts();

    return {
        products
    };
};

const getPurchasesBySupplier = async (from, to) => {
    const suppliers = await reportRepository.getPurchasesBySupplier(from, to);

    return {
        period: {
            from,
            to
        },
        suppliers
    };
};

module.exports = {
    getSalesSummary,
    getSalesByPaymentMethod,
    getSalesByDay,
    getTopSellingProducts,
    getLowStockProducts,
    getPurchasesBySupplier
};
