jest.mock('../../../src/services/auth.service', () => ({
    loginWithGoogle: jest.fn()
}));

const request = require('supertest');
const app = require('../../../src/app');
const AppError = require('../../../src/errors/AppError');
const authService = require('../../../src/services/auth.service');

describe('POST /api/auth/google', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns 200 and login data for a valid Google ID token', async () => {
        const serviceResult = {
            user: {
                id: 7,
                name: 'Gustavo',
                email: 'gustavo@example.com',
                role: 'ADMIN',
                active: true
            },
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token'
        };

        authService.loginWithGoogle.mockResolvedValue(serviceResult);

        const response = await request(app)
            .post('/api/auth/google')
            .set('User-Agent', 'Jest test client')
            .send({
                idToken: 'valid-google-id-token'
            });

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            success: true,
            data: serviceResult,
            message: 'Google login successful'
        });

        expect(authService.loginWithGoogle).toHaveBeenCalledTimes(1);

        expect(authService.loginWithGoogle).toHaveBeenCalledWith(
            {
                idToken: 'valid-google-id-token'
            },
            {
                userAgent: 'Jest test client',
                ipAddress: expect.any(String)
            }
        );
    });

    test('returns 400 when the Google ID token is missing', async () => {
        const response = await request(app)
            .post('/api/auth/google')
            .send({});

        expect(response.status).toBe(400);

        expect(response.body).toEqual({
            success: false,
            message: 'Google ID token is required'
        });

        expect(authService.loginWithGoogle).not.toHaveBeenCalled();
    });

    test('returns 400 when the Google ID token is not a string', async () => {
        const response = await request(app)
            .post('/api/auth/google')
            .send({
                idToken: 12345
            });

        expect(response.status).toBe(400);

        expect(response.body).toEqual({
            success: false,
            message: 'Google ID token must be a string'
        });

        expect(authService.loginWithGoogle).not.toHaveBeenCalled();
    });

    test('propagates an error returned by the Google login service', async () => {
        authService.loginWithGoogle.mockRejectedValue(
            new AppError('Invalid Google ID token', 401)
        );

        const response = await request(app)
            .post('/api/auth/google')
            .set('User-Agent', 'Jest test client')
            .send({
                idToken: 'invalid-google-id-token'
            });

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
            success: false,
            message: 'Invalid Google ID token'
        });

        expect(authService.loginWithGoogle).toHaveBeenCalledTimes(1);

        expect(authService.loginWithGoogle).toHaveBeenCalledWith(
            {
                idToken: 'invalid-google-id-token'
            },
            {
                userAgent: 'Jest test client',
                ipAddress: expect.any(String)
            }
        );
    });
});