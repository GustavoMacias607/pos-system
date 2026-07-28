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
            summary: {
                sales_count: '10',
                subtotal: '1000.00',
                discount_total: '50.00',
                tax: '152.00',
                total: '1102.00'
            }
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
                    sales_count: '5',
                    total: '750.00'
                },
                {
                    payment_method: 'CARD',
                    sales_count: '3',
                    total: '500.00'
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
                    sale_date: '2026-07-10',
                    sales_count: '3',
                    total: '450.00'
                },
                {
                    sale_date: '2026-07-11',
                    sales_count: '2',
                    total: '300.00'
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
                    product_id: '1',
                    product_name: 'Coffee',
                    stock: 2,
                    minimum_stock: 5
                },
                {
                    product_id: '2',
                    product_name: 'Sugar',
                    stock: 0,
                    minimum_stock: 3
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
                    purchase_count: '4',
                    total: '900.00'
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
                    product_id: '1',
                    product_name: 'Coffee',
                    quantity_sold: '20'
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
