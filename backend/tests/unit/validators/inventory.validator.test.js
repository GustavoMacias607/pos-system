const {
    validateInventoryAdjustmentInput,
    validateStockEntryInput,
    validateWasteInput,
    validateInventoryMovementFilters
} = require('../../../src/validators/inventory.validator');
const AppError = require('../../../src/errors/AppError');

const expectValidationError = (
    validator,
    data,
    expectedMessage
) => {
    let thrownError;

    try {
        validator(data);
    } catch (error) {
        thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(AppError);
    expect(thrownError.message).toBe(expectedMessage);
    expect(thrownError.statusCode).toBe(400);
};

describe('validateInventoryAdjustmentInput', () => {
    test('accepts a valid positive adjustment', () => {
        const data = {
            productId: 1,
            quantity: 5,
            reason: 'Inventory recount'
        };

        expect(() => {
            validateInventoryAdjustmentInput(data);
        }).not.toThrow();
    });

    test('accepts a valid negative adjustment', () => {
        const data = {
            productId: 1,
            quantity: -3,
            reason: 'Inventory recount'
        };

        expect(() => {
            validateInventoryAdjustmentInput(data);
        }).not.toThrow();
    });

    test('rejects missing adjustment data', () => {
        expectValidationError(
            validateInventoryAdjustmentInput,
            undefined,
            'Inventory adjustment data is required'
        );
    });

    test('rejects a product ID that is not an integer', () => {
        const data = {
            productId: '1',
            quantity: 5,
            reason: 'Inventory recount'
        };

        expectValidationError(
            validateInventoryAdjustmentInput,
            data,
            'Product ID must be an integer'
        );
    });

    test('rejects a quantity that is not an integer', () => {
        const data = {
            productId: 1,
            quantity: 1.5,
            reason: 'Inventory recount'
        };

        expectValidationError(
            validateInventoryAdjustmentInput,
            data,
            'Quantity must be an integer'
        );
    });

    test('rejects a quantity equal to zero', () => {
        const data = {
            productId: 1,
            quantity: 0,
            reason: 'Inventory recount'
        };

        expectValidationError(
            validateInventoryAdjustmentInput,
            data,
            'Quantity cannot be zero'
        );
    });

    test('rejects a missing reason', () => {
        const data = {
            productId: 1,
            quantity: 5
        };

        expectValidationError(
            validateInventoryAdjustmentInput,
            data,
            'Reason is required'
        );
    });

    test('rejects a reason that is not a string', () => {
        const data = {
            productId: 1,
            quantity: 5,
            reason: 123
        };

        expectValidationError(
            validateInventoryAdjustmentInput,
            data,
            'Reason must be a string'
        );
    });

    test('rejects a reason containing only spaces', () => {
        const data = {
            productId: 1,
            quantity: 5,
            reason: '   '
        };

        expectValidationError(
            validateInventoryAdjustmentInput,
            data,
            'Reason cannot be empty'
        );
    });
});

describe.each([
    {
        validatorName: 'validateStockEntryInput',
        validator: validateStockEntryInput,
        missingDataMessage: 'Stock entry data is required'
    },
    {
        validatorName: 'validateWasteInput',
        validator: validateWasteInput,
        missingDataMessage: 'Waste data is required'
    }
])('$validatorName', ({
    validator,
    missingDataMessage
}) => {
    test('accepts valid input', () => {
        const data = {
            productId: 1,
            quantity: 5,
            reason: 'Inventory operation'
        };

        expect(() => {
            validator(data);
        }).not.toThrow();
    });

    test('rejects missing data', () => {
        expectValidationError(
            validator,
            undefined,
            missingDataMessage
        );
    });

    test('rejects a product ID that is not an integer', () => {
        const data = {
            productId: '1',
            quantity: 5,
            reason: 'Inventory operation'
        };

        expectValidationError(
            validator,
            data,
            'Product ID must be an integer'
        );
    });

    test('rejects a quantity that is not an integer', () => {
        const data = {
            productId: 1,
            quantity: 1.5,
            reason: 'Inventory operation'
        };

        expectValidationError(
            validator,
            data,
            'Quantity must be an integer'
        );
    });

    test('rejects a quantity equal to zero', () => {
        const data = {
            productId: 1,
            quantity: 0,
            reason: 'Inventory operation'
        };

        expectValidationError(
            validator,
            data,
            'Quantity must be greater than zero'
        );
    });

    test('rejects a negative quantity', () => {
        const data = {
            productId: 1,
            quantity: -5,
            reason: 'Inventory operation'
        };

        expectValidationError(
            validator,
            data,
            'Quantity must be greater than zero'
        );
    });

    test('rejects a missing reason', () => {
        const data = {
            productId: 1,
            quantity: 5
        };

        expectValidationError(
            validator,
            data,
            'Reason is required'
        );
    });

    test('rejects a reason that is not a string', () => {
        const data = {
            productId: 1,
            quantity: 5,
            reason: 123
        };

        expectValidationError(
            validator,
            data,
            'Reason must be a string'
        );
    });

    test('rejects a reason containing only spaces', () => {
        const data = {
            productId: 1,
            quantity: 5,
            reason: '   '
        };

        expectValidationError(
            validator,
            data,
            'Reason cannot be empty'
        );
    });
});

describe('validateInventoryMovementFilters', () => {
    test('returns an empty object when no filters are provided', () => {
        const result = validateInventoryMovementFilters({});

        expect(result).toEqual({});
    });

    test.each([
        'PURCHASE',
        'SALE',
        'WASTE',
        'SUPPLIER_RETURN',
        'CUSTOMER_RETURN',
        'MANUAL_ADJUSTMENT'
    ])('accepts the valid movement type %s', (type) => {
        const result = validateInventoryMovementFilters({ type });

        expect(result).toEqual({ type });
    });

    test('rejects an invalid movement type', () => {
        expectValidationError(
            validateInventoryMovementFilters,
            { type: 'purchase' },
            'Invalid movement type'
        );
    });

    test('converts a string product ID to a number', () => {
        const result = validateInventoryMovementFilters({
            productId: '15'
        });

        expect(result).toEqual({
            productId: 15
        });
    });

    test('accepts a positive numeric product ID', () => {
        const result = validateInventoryMovementFilters({
            productId: 15
        });

        expect(result).toEqual({
            productId: 15
        });
    });

    test.each([
        'abc',
        '1.5',
        '0',
        '-1'
    ])('rejects the invalid product ID %s', (productId) => {
        expectValidationError(
            validateInventoryMovementFilters,
            { productId },
            'Product ID must be a positive integer'
        );
    });

    test('normalizes valid type and product ID filters together', () => {
        const result = validateInventoryMovementFilters({
            type: 'WASTE',
            productId: '8'
        });

        expect(result).toEqual({
            type: 'WASTE',
            productId: 8
        });
    });
});