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

jest.mock('../../../src/services/inventory.service', () => ({
    getAllMovements: jest.fn(),
    getLowStockProducts: jest.fn(),
    createAdjustment: jest.fn(),
    createStockEntry: jest.fn(),
    createWaste: jest.fn()
}));

const request = require('supertest');
const app = require('../../../src/app');
const inventoryService = require(
    '../../../src/services/inventory.service'
);

describe('GET /api/inventory/movements', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns 200 and the inventory movements', async () => {
        const serviceResult = [
            {
                id: 1,
                product_id: 5,
                type: 'SALE',
                quantity: -2,
                reason: 'Product sale',
                created_at: '2026-07-29T10:00:00.000Z'
            },
            {
                id: 2,
                product_id: 5,
                type: 'SALE',
                quantity: -1,
                reason: 'Product sale',
                created_at: '2026-07-29T11:00:00.000Z'
            }
        ];

        inventoryService.getAllMovements.mockResolvedValue(
            serviceResult
        );

        const response = await request(app)
            .get('/api/inventory/movements')
            .query({
                type: 'SALE',
                productId: 5
            });

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            success: true,
            data: serviceResult
        });

        expect(
            inventoryService.getAllMovements
        ).toHaveBeenCalledTimes(1);

        expect(
            inventoryService.getAllMovements
        ).toHaveBeenCalledWith({
            type: 'SALE',
            productId: '5'
        });
    });
});

describe('GET /api/inventory/low-stock', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns 200 and the low-stock products', async () => {
        const serviceResult = [
            {
                id: 1,
                name: 'Coffee',
                stock: 2,
                minimum_stock: 5
            },
            {
                id: 2,
                name: 'Sugar',
                stock: 0,
                minimum_stock: 3
            }
        ];

        inventoryService.getLowStockProducts.mockResolvedValue(
            serviceResult
        );

        const response = await request(app)
            .get('/api/inventory/low-stock');

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            success: true,
            data: serviceResult
        });

        expect(
            inventoryService.getLowStockProducts
        ).toHaveBeenCalledTimes(1);

        expect(
            inventoryService.getLowStockProducts
        ).toHaveBeenCalledWith();
    });
});

describe('POST /api/inventory/adjustment', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns 201 and creates an inventory adjustment', async () => {
        const requestBody = {
            productId: 1,
            quantity: 5,
            reason: 'Physical stock correction'
        };

        const serviceResult = {
            product: {
                id: 1,
                name: 'Coffee',
                stock: 15,
                active: true
            },
            movement: {
                id: 3,
                product_id: 1,
                type: 'ADJUSTMENT',
                quantity: 5,
                reason: 'Physical stock correction'
            }
        };

        inventoryService.createAdjustment.mockResolvedValue(
            serviceResult
        );

        const response = await request(app)
            .post('/api/inventory/adjustment')
            .send(requestBody);

        expect(response.status).toBe(201);

        expect(response.body).toEqual({
            success: true,
            data: serviceResult,
            message: 'Inventory adjustment created successfully'
        });

        expect(
            inventoryService.createAdjustment
        ).toHaveBeenCalledTimes(1);

        expect(
            inventoryService.createAdjustment
        ).toHaveBeenCalledWith(requestBody);
    });

    test('returns 400 when the adjustment data is invalid', async () => {
        const response = await request(app)
            .post('/api/inventory/adjustment')
            .send({});

        expect(response.status).toBe(400);

        expect(
            inventoryService.createAdjustment
        ).not.toHaveBeenCalled();
    });
});

describe('POST /api/inventory/stock-entry', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns 201 and creates a stock entry', async () => {
        const requestBody = {
            productId: 1,
            quantity: 20,
            reason: 'Supplier delivery'
        };

        const serviceResult = {
            product: {
                id: 1,
                name: 'Coffee',
                stock: 30,
                active: true
            },
            movement: {
                id: 4,
                product_id: 1,
                type: 'ENTRY',
                quantity: 20,
                reason: 'Supplier delivery'
            }
        };

        inventoryService.createStockEntry.mockResolvedValue(
            serviceResult
        );

        const response = await request(app)
            .post('/api/inventory/stock-entry')
            .send(requestBody);

        expect(response.status).toBe(201);

        expect(response.body).toEqual({
            success: true,
            data: serviceResult,
            message: 'Stock entry created successfully'
        });

        expect(
            inventoryService.createStockEntry
        ).toHaveBeenCalledTimes(1);

        expect(
            inventoryService.createStockEntry
        ).toHaveBeenCalledWith(requestBody);
    });

    test('returns 400 when the stock-entry data is invalid', async () => {
        const response = await request(app)
            .post('/api/inventory/stock-entry')
            .send({});

        expect(response.status).toBe(400);

        expect(
            inventoryService.createStockEntry
        ).not.toHaveBeenCalled();
    });
});

describe('POST /api/inventory/waste', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns 201 and creates a waste movement', async () => {
        const requestBody = {
            productId: 1,
            quantity: 4,
            reason: 'Damaged products'
        };

        const serviceResult = {
            product: {
                id: 1,
                name: 'Coffee',
                stock: 6,
                active: true
            },
            movement: {
                id: 5,
                product_id: 1,
                type: 'WASTE',
                quantity: -4,
                reason: 'Damaged products'
            }
        };

        inventoryService.createWaste.mockResolvedValue(
            serviceResult
        );

        const response = await request(app)
            .post('/api/inventory/waste')
            .send(requestBody);

        expect(response.status).toBe(201);

        expect(response.body).toEqual({
            success: true,
            data: serviceResult,
            message: 'Waste movement created successfully'
        });

        expect(
            inventoryService.createWaste
        ).toHaveBeenCalledTimes(1);

        expect(
            inventoryService.createWaste
        ).toHaveBeenCalledWith(requestBody);
    });

    test('returns 400 when the waste data is invalid', async () => {
        const response = await request(app)
            .post('/api/inventory/waste')
            .send({});

        expect(response.status).toBe(400);

        expect(
            inventoryService.createWaste
        ).not.toHaveBeenCalled();
    });

    test('propagates an error returned by the inventory service', async () => {
        const requestBody = {
            productId: 1,
            quantity: 20,
            reason: 'Damaged products'
        };

        const serviceError = Object.assign(
            new Error('Insufficient stock for waste'),
            {
                statusCode: 409
            }
        );

        inventoryService.createWaste.mockRejectedValue(
            serviceError
        );

        const response = await request(app)
            .post('/api/inventory/waste')
            .send(requestBody);

        expect(response.status).toBe(409);

        expect(response.body).toMatchObject({
            success: false,
            message: 'Insufficient stock for waste'
        });

        expect(
            inventoryService.createWaste
        ).toHaveBeenCalledTimes(1);

        expect(
            inventoryService.createWaste
        ).toHaveBeenCalledWith(requestBody);
    });
});