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
    getTopSellingProducts: jest.fn()
}));

const request = require('supertest');
const app = require('../../../src/app');
const reportService = require('../../../src/services/report.service');

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
