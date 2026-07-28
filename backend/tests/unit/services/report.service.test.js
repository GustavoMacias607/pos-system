jest.mock('../../../src/repositories/report.repository', () => ({
    getSalesSummary: jest.fn(),
    getTopSellingProducts: jest.fn()
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
