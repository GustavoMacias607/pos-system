const {
    validateReportDateRangeQuery,
    validateTopSellingProductsQuery
} = require('../../../src/validators/report.validator');
const AppError = require('../../../src/errors/AppError');

describe('validateReportDateRangeQuery', () => {
    test('accepts a valid date range', () => {
        const query = {
            from: '2026-07-01',
            to: '2026-07-31'
        };

        expect(() => {
            validateReportDateRangeQuery(query);
        }).not.toThrow();
    });

    test('rejects when from date is missing', () => {
        const query = {
            to: '2026-07-31'
        };

        expect.assertions(3);

        try {
            validateReportDateRangeQuery(query);
        } catch (error) {
            expect(error).toBeInstanceOf(AppError);
            expect(error.message).toBe('From date is required');
            expect(error.statusCode).toBe(400);
        }
    });

    test('rejects when from date is not a string', () => {
        const query = {
            from: 20260701,
            to: '2026-07-31'
        };

        expect(() => {
            validateReportDateRangeQuery(query);
        }).toThrow('From date must be a string');
    });


    test('rejects when from date has an invalid format', () => {
        const query = {
            from: '2026/07/01',
            to: '2026-07-31'
        };

        expect(() => {
            validateReportDateRangeQuery(query);
        }).toThrow('From date must use YYYY-MM-DD format');
    });

    test('rejects when from date is not a real date', () => {
        const query = {
            from: '2026-02-30',
            to: '2026-07-31'
        };

        expect(() => {
            validateReportDateRangeQuery(query);
        }).toThrow('From date is invalid');
    });

    test('rejects when to date is missing', () => {
        const query = {
            from: '2026-07-01'
        };

        expect(() => {
            validateReportDateRangeQuery(query);
        }).toThrow('To date is required');
    });

    test('rejects when to date is not a real date', () => {
        const query = {
            from: '2026-07-01',
            to: '2026-13-01'
        };

        expect(() => {
            validateReportDateRangeQuery(query);
        }).toThrow('To date is invalid');
    });

    test('rejects when from date is after to date', () => {
        const query = {
            from: '2026-07-31',
            to: '2026-07-01'
        };

        expect(() => {
            validateReportDateRangeQuery(query);
        }).toThrow('From date cannot be after to date');
    });

});

describe('validateTopSellingProductsQuery', () => {
    test('accepts a valid query without limit', () => {
        const query = {
            from: '2026-07-01',
            to: '2026-07-31'
        };

        expect(() => {
            validateTopSellingProductsQuery(query);
        }).not.toThrow();
    });

    test('accepts a valid query with limit', () => {
        const query = {
            from: '2026-07-01',
            to: '2026-07-31',
            limit: '10'
        };

        expect(() => {
            validateTopSellingProductsQuery(query);
        }).not.toThrow();
    });

    test('rejects when limit is not an integer', () => {
        const query = {
            from: '2026-07-01',
            to: '2026-07-31',
            limit: 'abc'
        };

        expect(() => {
            validateTopSellingProductsQuery(query);
        }).toThrow('Limit must be an integer');
    });

    test('rejects when limit is less than 1', () => {
        const query = {
            from: '2026-07-01',
            to: '2026-07-31',
            limit: '0'
        };

        expect(() => {
            validateTopSellingProductsQuery(query);
        }).toThrow('Limit must be greater than 0');
    });

    test('rejects when limit is greater than 100', () => {
        const query = {
            from: '2026-07-01',
            to: '2026-07-31',
            limit: '101'
        };

        expect(() => {
            validateTopSellingProductsQuery(query);
        }).toThrow('Limit cannot be greater than 100');
    });

    test('accepts limit equal to 100', () => {
        const query = {
            from: '2026-07-01',
            to: '2026-07-31',
            limit: '100'
        };

        expect(() => {
            validateTopSellingProductsQuery(query);
        }).not.toThrow();
    });

    test('accepts limit equal to 1', () => {
        const query = {
            from: '2026-07-01',
            to: '2026-07-31',
            limit: '1'
        };

        expect(() => {
            validateTopSellingProductsQuery(query);
        }).not.toThrow();
    });

});
