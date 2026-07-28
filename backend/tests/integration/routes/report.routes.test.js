jest.mock('../../../src/middlewares/auth.middleware', () => ({
    authenticate: (req, res, next) => {
        req.user = {
            id: 1,
            role: 'ADMIN',
            active: true
        };

        next();
    },

    authorizeRoles: () => {
        return (req, res, next) => next();
    }
}));

jest.mock('../../../src/services/auth.service', () => ({}));

jest.mock('../../../src/services/report.service', () => ({
    getSalesSummary: jest.fn(),
    getSalesByPaymentMethod: jest.fn(),
    getSalesByDay: jest.fn(),
    getTopSellingProducts: jest.fn(),
    getLowStockProducts: jest.fn(),
    getPurchasesBySupplier: jest.fn()
}));

const request = require('supertest');
const app = require('../../../src/app');
const reportService = require('../../../src/services/report.service');

describe('GET /api/reports/sales-summary', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns 200 and the sales summary report', async () => {
        const serviceResult = {
            period: {
                from: '2026-07-01',
                to: '2026-07-31'
            },
            completed_sales_count: 10,
            cancelled_sales_count: 2,
            total_sold: '1102.00',
            average_ticket: '110.20'
        };

        reportService.getSalesSummary.mockResolvedValue(serviceResult);

        const response = await request(app)
            .get('/api/reports/sales-summary')
            .query({
                from: '2026-07-01',
                to: '2026-07-31'
            });

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            success: true,
            data: serviceResult
        });

        expect(
            reportService.getSalesSummary
        ).toHaveBeenCalledTimes(1);

        expect(
            reportService.getSalesSummary
        ).toHaveBeenCalledWith(
            '2026-07-01',
            '2026-07-31'
        );
    });
});

describe('GET /api/reports/sales-by-payment-method', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns 200 and sales grouped by payment method', async () => {
        const serviceResult = {
            period: {
                from: '2026-07-01',
                to: '2026-07-31'
            },
            paymentMethods: [
                {
                    payment_method: 'CASH',
                    completed_sales: 5,
                    cancelled_sales: 1,
                    total_sold: '750.00',
                    average_ticket: '150.00'
                },
                {
                    payment_method: 'CARD',
                    completed_sales: 3,
                    cancelled_sales: 0,
                    total_sold: '500.00',
                    average_ticket: '166.67'
                }
            ]
        };

        reportService.getSalesByPaymentMethod.mockResolvedValue(
            serviceResult
        );

        const response = await request(app)
            .get('/api/reports/sales-by-payment-method')
            .query({
                from: '2026-07-01',
                to: '2026-07-31'
            });

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            success: true,
            data: serviceResult
        });

        expect(
            reportService.getSalesByPaymentMethod
        ).toHaveBeenCalledTimes(1);

        expect(
            reportService.getSalesByPaymentMethod
        ).toHaveBeenCalledWith(
            '2026-07-01',
            '2026-07-31'
        );
    });
});

describe('GET /api/reports/sales-by-day', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns 200 and sales grouped by day', async () => {
        const serviceResult = {
            period: {
                from: '2026-07-01',
                to: '2026-07-31'
            },
            days: [
                {
                    date: '2026-07-10',
                    completed_sales: 3,
                    cancelled_sales: 1,
                    total_sold: '450.00',
                    average_ticket: '150.00'
                },
                {
                    date: '2026-07-11',
                    completed_sales: 2,
                    cancelled_sales: 0,
                    total_sold: '300.00',
                    average_ticket: '150.00'
                }
            ]
        };

        reportService.getSalesByDay.mockResolvedValue(serviceResult);

        const response = await request(app)
            .get('/api/reports/sales-by-day')
            .query({
                from: '2026-07-01',
                to: '2026-07-31'
            });

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            success: true,
            data: serviceResult
        });

        expect(
            reportService.getSalesByDay
        ).toHaveBeenCalledTimes(1);

        expect(
            reportService.getSalesByDay
        ).toHaveBeenCalledWith(
            '2026-07-01',
            '2026-07-31'
        );
    });
});

describe('GET /api/reports/low-stock-products', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns 200 and the low-stock products report', async () => {
        const serviceResult = {
            products: [
                {
                    product_id: 1,
                    product_name: 'Coffee',
                    stock: 2,
                    minimum_stock: 5,
                    units_needed: 3
                },
                {
                    product_id: 2,
                    product_name: 'Sugar',
                    stock: 0,
                    minimum_stock: 3,
                    units_needed: 3
                }
            ]
        };

        reportService.getLowStockProducts.mockResolvedValue(
            serviceResult
        );

        const response = await request(app)
            .get('/api/reports/low-stock-products');

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            success: true,
            data: serviceResult
        });

        expect(
            reportService.getLowStockProducts
        ).toHaveBeenCalledTimes(1);

        expect(
            reportService.getLowStockProducts
        ).toHaveBeenCalledWith();
    });
});

describe('GET /api/reports/purchases-by-supplier', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns 200 and purchases grouped by supplier', async () => {
        const serviceResult = {
            period: {
                from: '2026-07-01',
                to: '2026-07-31'
            },
            suppliers: [
                {
                    supplier_id: '1',
                    supplier_name: 'Main Supplier',
                    completed_purchases: 4,
                    cancelled_purchases: 1,
                    total_purchased: '900.00',
                    average_purchase: '225.00'
                }
            ]
        };

        reportService.getPurchasesBySupplier.mockResolvedValue(
            serviceResult
        );

        const response = await request(app)
            .get('/api/reports/purchases-by-supplier')
            .query({
                from: '2026-07-01',
                to: '2026-07-31'
            });

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            success: true,
            data: serviceResult
        });

        expect(
            reportService.getPurchasesBySupplier
        ).toHaveBeenCalledTimes(1);

        expect(
            reportService.getPurchasesBySupplier
        ).toHaveBeenCalledWith(
            '2026-07-01',
            '2026-07-31'
        );
    });
});

describe('GET /api/reports/top-selling-products', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns 200 and the top-selling products report', async () => {
        // Arrange: preparamos el resultado simulado
        const serviceResult = {
            period: {
                from: '2026-07-01',
                to: '2026-07-31'
            },
            limit: 5,
            products: [
                {
                    product_id: 1,
                    product_name: 'Coffee',
                    completed_sales: 4,
                    units_sold: 20,
                    total_sold: '400.00'
                }
            ]
        };

        reportService.getTopSellingProducts.mockResolvedValue(
            serviceResult
        );

        // Act: hacemos la petición HTTP
        const response = await request(app)
            .get('/api/reports/top-selling-products')
            .query({
                from: '2026-07-01',
                to: '2026-07-31',
                limit: 5
            });

        // Assert: comprobamos el resultado
        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            success: true,
            data: serviceResult
        });

        expect(
            reportService.getTopSellingProducts
        ).toHaveBeenCalledTimes(1);

        expect(
            reportService.getTopSellingProducts
        ).toHaveBeenCalledWith(
            '2026-07-01',
            '2026-07-31',
            '5'
        );
    });


    test('returns 400 when limit is invalid', async () => {
        const response = await request(app)
            .get('/api/reports/top-selling-products')
            .query({
                from: '2026-07-01',
                to: '2026-07-31',
                limit: 0
            });

        expect(response.status).toBe(400);

        expect(response.body).toEqual({
            success: false,
            message: 'Limit must be greater than 0'
        });

        expect(
            reportService.getTopSellingProducts
        ).not.toHaveBeenCalled();
    });
});
