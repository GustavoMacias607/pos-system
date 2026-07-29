jest.mock('../../../src/services/auth.service', () => ({
    login: jest.fn(),
    refreshAccessToken: jest.fn(),
    loginWithGoogle: jest.fn()
}));

const request = require('supertest');
const app = require('../../../src/app');
const AppError = require('../../../src/errors/AppError');
const authService = require('../../../src/services/auth.service');

describe('POST /api/auth/refresh', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns 200 and new tokens for a valid refresh token', async () => {
        const serviceResult = {
            accessToken: 'new-mock-access-token',
            refreshToken: 'new-mock-refresh-token'
        };

        authService.refreshAccessToken.mockResolvedValueOnce(serviceResult);

        const response = await request(app)
            .post('/api/auth/refresh')
            .send({
                refreshToken: 'valid-refresh-token'
            });

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            success: true,
            data: serviceResult,
            message: 'Access token refreshed successfully'
        });

        expect(authService.refreshAccessToken).toHaveBeenCalledTimes(1);

        expect(authService.refreshAccessToken).toHaveBeenCalledWith({
            refreshToken: 'valid-refresh-token'
        });
    });

    test('returns 400 when refresh token is missing', async () => {
        const response = await request(app)
            .post('/api/auth/refresh')
            .send({});

        expect(response.status).toBe(400);

        expect(response.body).toEqual({
            success: false,
            message: 'Refresh token is required'
        });

        expect(authService.refreshAccessToken).not.toHaveBeenCalled();
    });

    test('returns 400 when refresh token is not a string', async () => {
        const response = await request(app)
            .post('/api/auth/refresh')
            .send({
                refreshToken: 12345
            });

        expect(response.status).toBe(400);

        expect(response.body).toEqual({
            success: false,
            message: 'Refresh token must be a string'
        });

        expect(authService.refreshAccessToken).not.toHaveBeenCalled();
    });

    test('returns 400 when refresh token is empty', async () => {
        const response = await request(app)
            .post('/api/auth/refresh')
            .send({
                refreshToken: '   '
            });

        expect(response.status).toBe(400);

        expect(response.body).toEqual({
            success: false,
            message: 'Refresh token cannot be empty'
        });

        expect(authService.refreshAccessToken).not.toHaveBeenCalled();
    });

    test('propagates an error returned by the refresh service', async () => {
        authService.refreshAccessToken.mockRejectedValueOnce(
            new AppError('Invalid or expired refresh token', 401)
        );

        const response = await request(app)
            .post('/api/auth/refresh')
            .send({
                refreshToken: 'invalid-refresh-token'
            });

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
            success: false,
            message: 'Invalid or expired refresh token'
        });

        expect(authService.refreshAccessToken).toHaveBeenCalledTimes(1);

        expect(authService.refreshAccessToken).toHaveBeenCalledWith({
            refreshToken: 'invalid-refresh-token'
        });
    });
});

describe('POST /api/auth/login', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns 200 and login data for valid credentials', async () => {
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

        authService.login.mockResolvedValue(serviceResult);

        const response = await request(app)
            .post('/api/auth/login')
            .set('User-Agent', 'Jest test client')
            .send({
                email: 'gustavo@example.com',
                password: 'Password123'
            });

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            success: true,
            data: serviceResult,
            message: 'Login successful'
        });

        expect(authService.login).toHaveBeenCalledTimes(1);

        expect(authService.login).toHaveBeenCalledWith(
            {
                email: 'gustavo@example.com',
                password: 'Password123'
            },
            {
                userAgent: 'Jest test client',
                ipAddress: expect.any(String)
            }
        );
    });

    test('returns 400 when email is missing', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                password: 'Password123'
            });

        expect(response.status).toBe(400);

        expect(response.body).toEqual({
            success: false,
            message: 'Email is required'
        });

        expect(authService.login).not.toHaveBeenCalled();
    });

    test('returns 400 when email format is invalid', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'invalid-email',
                password: 'Password123'
            });

        expect(response.status).toBe(400);

        expect(response.body).toEqual({
            success: false,
            message: 'Email format is invalid'
        });

        expect(authService.login).not.toHaveBeenCalled();
    });

    test('returns 400 when password is missing', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'gustavo@example.com'
            });

        expect(response.status).toBe(400);

        expect(response.body).toEqual({
            success: false,
            message: 'Password is required'
        });

        expect(authService.login).not.toHaveBeenCalled();
    });

    test('propagates an error returned by the login service', async () => {
        authService.login.mockRejectedValue(
            new AppError('Invalid email or password', 401)
        );

        const response = await request(app)
            .post('/api/auth/login')
            .set('User-Agent', 'Jest test client')
            .send({
                email: 'gustavo@example.com',
                password: 'WrongPassword'
            });

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
            success: false,
            message: 'Invalid email or password'
        });

        expect(authService.login).toHaveBeenCalledTimes(1);

        expect(authService.login).toHaveBeenCalledWith(
            {
                email: 'gustavo@example.com',
                password: 'WrongPassword'
            },
            {
                userAgent: 'Jest test client',
                ipAddress: expect.any(String)
            }
        );
    });
});

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