jest.mock('../../../src/repositories/report.repository', () => ({
    getSalesSummary: jest.fn(),
    getSalesByPaymentMethod: jest.fn(),
    getSalesByDay: jest.fn(),
    getTopSellingProducts: jest.fn(),
    getLowStockProducts: jest.fn()
}));

const reportService = require('../../../src/services/report.service');
const reportRepository = require(
    '../../../src/repositories/report.repository'
);

describe('reportService.getSalesSummary', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns the sales summary with the requested period', async () => {
        const repositoryResult = {
            completed_sales_count: 4,
            cancelled_sales_count: 1,
            total_sold: '500.00',
            average_ticket: '125.00'
        };

        reportRepository.getSalesSummary.mockResolvedValue(
            repositoryResult
        );

        const result = await reportService.getSalesSummary(
            '2026-07-01',
            '2026-07-31'
        );

        expect(result).toEqual({
            period: {
                from: '2026-07-01',
                to: '2026-07-31'
            },
            completed_sales_count: 4,
            cancelled_sales_count: 1,
            total_sold: '500.00',
            average_ticket: '125.00'
        });

        expect(
            reportRepository.getSalesSummary
        ).toHaveBeenCalledTimes(1);

        expect(
            reportRepository.getSalesSummary
        ).toHaveBeenCalledWith(
            '2026-07-01',
            '2026-07-31'
        );
    });
});

describe('reportService.getSalesByPaymentMethod', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns sales grouped by payment method with the requested period', async () => {
        const repositoryResult = [
            {
                payment_method: 'CASH',
                sales_count: 3,
                total_sold: '300.00'
            },
            {
                payment_method: 'CARD',
                sales_count: 2,
                total_sold: '200.00'
            }
        ];

        reportRepository.getSalesByPaymentMethod.mockResolvedValue(
            repositoryResult
        );

        const result = await reportService.getSalesByPaymentMethod(
            '2026-07-01',
            '2026-07-31'
        );

        expect(result).toEqual({
            period: {
                from: '2026-07-01',
                to: '2026-07-31'
            },
            paymentMethods: repositoryResult
        });

        expect(
            reportRepository.getSalesByPaymentMethod
        ).toHaveBeenCalledTimes(1);

        expect(
            reportRepository.getSalesByPaymentMethod
        ).toHaveBeenCalledWith(
            '2026-07-01',
            '2026-07-31'
        );
    });
});

describe('reportService.getSalesByDay', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns sales grouped by day with the requested period', async () => {
        const repositoryResult = [
            {
                sale_date: '2026-07-10',
                sales_count: 3,
                total_sold: '300.00'
            },
            {
                sale_date: '2026-07-11',
                sales_count: 2,
                total_sold: '200.00'
            }
        ];

        reportRepository.getSalesByDay.mockResolvedValue(
            repositoryResult
        );

        const result = await reportService.getSalesByDay(
            '2026-07-01',
            '2026-07-31'
        );

        expect(result).toEqual({
            period: {
                from: '2026-07-01',
                to: '2026-07-31'
            },
            days: repositoryResult
        });

        expect(
            reportRepository.getSalesByDay
        ).toHaveBeenCalledTimes(1);

        expect(
            reportRepository.getSalesByDay
        ).toHaveBeenCalledWith(
            '2026-07-01',
            '2026-07-31'
        );
    });
});

describe('reportService.getLowStockProducts', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns the low-stock products', async () => {
        const repositoryResult = [
            {
                product_id: '1',
                product_name: 'Coffee',
                stock: 3,
                min_stock: 5
            },
            {
                product_id: '2',
                product_name: 'Milk',
                stock: 1,
                min_stock: 4
            }
        ];

        reportRepository.getLowStockProducts.mockResolvedValue(
            repositoryResult
        );

        const result = await reportService.getLowStockProducts();

        expect(result).toEqual({
            products: repositoryResult
        });

        expect(
            reportRepository.getLowStockProducts
        ).toHaveBeenCalledTimes(1);

        expect(
            reportRepository.getLowStockProducts
        ).toHaveBeenCalledWith();
    });
});

describe('reportService.getTopSellingProducts', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('normalizes the limit and returns the top-selling products', async () => {
        const repositoryResult = [
            {
                product_id: '1',
                product_name: 'Coffee',
                completed_sales: 4,
                units_sold: 20,
                total_sold: '500.00'
            }
        ];

        reportRepository.getTopSellingProducts.mockResolvedValue(
            repositoryResult
        );

        const result = await reportService.getTopSellingProducts(
            '2026-07-01',
            '2026-07-31',
            '5'
        );

        // Assert

        expect(result).toEqual({
            period: {
                from: '2026-07-01',
                to: '2026-07-31'
            },
            limit: 5,
            products: repositoryResult
        });

        expect(
            reportRepository.getTopSellingProducts
        ).toHaveBeenCalledTimes(1);

        expect(
            reportRepository.getTopSellingProducts
        ).toHaveBeenCalledWith(
            '2026-07-01',
            '2026-07-31',
            5
        );
    });


    test('uses 10 as the default limit when limit is omitted', async () => {
        const repositoryResult = [];

        reportRepository.getTopSellingProducts.mockResolvedValue(
            repositoryResult
        );

        const result = await reportService.getTopSellingProducts(
            '2026-07-01',
            '2026-07-31'
        );

        expect(result).toEqual({
            period: {
                from: '2026-07-01',
                to: '2026-07-31'
            },
            limit: 10,
            products: repositoryResult
        });

        expect(
            reportRepository.getTopSellingProducts
        ).toHaveBeenCalledTimes(1);

        expect(
            reportRepository.getTopSellingProducts
        ).toHaveBeenCalledWith(
            '2026-07-01',
            '2026-07-31',
            10
        );
    });
});
