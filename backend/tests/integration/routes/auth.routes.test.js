jest.mock('../../../src/services/auth.service', () => ({
    login: jest.fn(),
    refreshAccessToken: jest.fn(),
    logout: jest.fn(),
    setupTwoFactor: jest.fn(),
    verifyTwoFactorSetup: jest.fn(),
    verifyTwoFactorLogin: jest.fn(),
    disableTwoFactor: jest.fn(),
    loginWithGoogle: jest.fn()
}));

jest.mock('../../../src/repositories/user.repository', () => ({
    findById: jest.fn()
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const AppError = require('../../../src/errors/AppError');
const authService = require('../../../src/services/auth.service');
const userRepository = require('../../../src/repositories/user.repository');
const app = require('../../../src/app');

const TEST_JWT_SECRET = 'test-jwt-secret';
const originalJwtSecret = process.env.JWT_SECRET;

const authenticatedUser = {
    id: 7,
    name: 'Gustavo',
    email: 'gustavo@example.com',
    role: 'ADMIN',
    active: true
};

const createAccessToken = () => {
    return jwt.sign(
        { id: authenticatedUser.id },
        TEST_JWT_SECRET,
        { expiresIn: '15m' }
    );
};

beforeAll(() => {
    process.env.JWT_SECRET = TEST_JWT_SECRET;
});

afterAll(() => {
    if (originalJwtSecret === undefined) {
        delete process.env.JWT_SECRET;
    } else {
        process.env.JWT_SECRET = originalJwtSecret;
    }
});

describe('POST /api/auth/logout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns 200 for a valid refresh token', async () => {
        authService.logout.mockResolvedValueOnce();

        const response = await request(app)
            .post('/api/auth/logout')
            .send({
                refreshToken: 'valid-refresh-token'
            });

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            success: true,
            message: 'Logout successful'
        });

        expect(authService.logout).toHaveBeenCalledTimes(1);
        expect(authService.logout).toHaveBeenCalledWith({
            refreshToken: 'valid-refresh-token'
        });
    });

    test('returns 400 when refresh token is missing', async () => {
        const response = await request(app)
            .post('/api/auth/logout')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: 'Refresh token is required'
        });

        expect(authService.logout).not.toHaveBeenCalled();
    });

    test('returns 400 when refresh token is not a string', async () => {
        const response = await request(app)
            .post('/api/auth/logout')
            .send({
                refreshToken: 12345
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: 'Refresh token must be a string'
        });

        expect(authService.logout).not.toHaveBeenCalled();
    });

    test('returns 400 when refresh token is empty', async () => {
        const response = await request(app)
            .post('/api/auth/logout')
            .send({
                refreshToken: '   '
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: 'Refresh token cannot be empty'
        });

        expect(authService.logout).not.toHaveBeenCalled();
    });

    test('propagates an error returned by the logout service', async () => {
        authService.logout.mockRejectedValueOnce(
            new AppError('Invalid or expired refresh token', 401)
        );

        const response = await request(app)
            .post('/api/auth/logout')
            .send({
                refreshToken: 'invalid-refresh-token'
            });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            success: false,
            message: 'Invalid or expired refresh token'
        });

        expect(authService.logout).toHaveBeenCalledTimes(1);
    });
});

describe('POST /api/auth/2fa/setup', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        userRepository.findById.mockResolvedValue(authenticatedUser);
    });

    test('returns 200 and two-factor setup data', async () => {
        const serviceResult = {
            secret: 'mock-two-factor-secret',
            otpauthUrl: 'otpauth://totp/POS:gusta',
            qrCodeDataUrl: 'data:image/png;base64,mock'
        };

        authService.setupTwoFactor.mockResolvedValueOnce(serviceResult);

        const response = await request(app)
            .post('/api/auth/2fa/setup')
            .set('Authorization', `Bearer ${createAccessToken()}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            data: serviceResult,
            message: 'Two-factor authentication setup generated successfully'
        });

        expect(userRepository.findById).toHaveBeenCalledWith(7);
        expect(authService.setupTwoFactor).toHaveBeenCalledWith(7);
    });

    test('returns 401 when authorization token is missing', async () => {
        const response = await request(app)
            .post('/api/auth/2fa/setup');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            success: false,
            message: 'Authorization token is required'
        });

        expect(authService.setupTwoFactor).not.toHaveBeenCalled();
    });

    test('propagates an error returned by the setup service', async () => {
        authService.setupTwoFactor.mockRejectedValueOnce(
            new AppError('Two-factor authentication is already enabled', 409)
        );

        const response = await request(app)
            .post('/api/auth/2fa/setup')
            .set('Authorization', `Bearer ${createAccessToken()}`);

        expect(response.status).toBe(409);
        expect(response.body).toEqual({
            success: false,
            message: 'Two-factor authentication is already enabled'
        });

        expect(authService.setupTwoFactor).toHaveBeenCalledWith(7);
    });
});

describe('POST /api/auth/2fa/verify-setup', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        userRepository.findById.mockResolvedValue(authenticatedUser);
    });

    test('returns 200 and enables two-factor authentication', async () => {
        const serviceResult = {
            backupCodes: [
                'ABCD-1234',
                'EFGH-5678'
            ]
        };

        authService.verifyTwoFactorSetup.mockResolvedValueOnce(serviceResult);

        const response = await request(app)
            .post('/api/auth/2fa/verify-setup')
            .set('Authorization', `Bearer ${createAccessToken()}`)
            .send({
                token: '123456'
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            data: serviceResult,
            message: 'Two-factor authentication enabled successfully'
        });

        expect(authService.verifyTwoFactorSetup).toHaveBeenCalledWith(
            7,
            { token: '123456' }
        );
    });

    test('returns 401 when authorization token is missing', async () => {
        const response = await request(app)
            .post('/api/auth/2fa/verify-setup')
            .send({
                token: '123456'
            });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            success: false,
            message: 'Authorization token is required'
        });

        expect(authService.verifyTwoFactorSetup).not.toHaveBeenCalled();
    });

    test('returns 400 when two-factor token is missing', async () => {
        const response = await request(app)
            .post('/api/auth/2fa/verify-setup')
            .set('Authorization', `Bearer ${createAccessToken()}`)
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: 'Two-factor token is required'
        });

        expect(authService.verifyTwoFactorSetup).not.toHaveBeenCalled();
    });

    test('returns 400 when two-factor token is not a 6-digit code', async () => {
        const response = await request(app)
            .post('/api/auth/2fa/verify-setup')
            .set('Authorization', `Bearer ${createAccessToken()}`)
            .send({
                token: '12345'
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: 'Two-factor token must be a 6-digit code'
        });

        expect(authService.verifyTwoFactorSetup).not.toHaveBeenCalled();
    });

    test('propagates an error returned by the verification service', async () => {
        authService.verifyTwoFactorSetup.mockRejectedValueOnce(
            new AppError('Invalid two-factor token', 401)
        );

        const response = await request(app)
            .post('/api/auth/2fa/verify-setup')
            .set('Authorization', `Bearer ${createAccessToken()}`)
            .send({
                token: '123456'
            });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            success: false,
            message: 'Invalid two-factor token'
        });

        expect(authService.verifyTwoFactorSetup).toHaveBeenCalledWith(
            7,
            { token: '123456' }
        );
    });
});

describe('POST /api/auth/2fa/verify-login', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns 200 for a valid two-factor token', async () => {
        const serviceResult = {
            user: authenticatedUser,
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token'
        };

        authService.verifyTwoFactorLogin.mockResolvedValueOnce(serviceResult);

        const response = await request(app)
            .post('/api/auth/2fa/verify-login')
            .set('User-Agent', 'Jest test client')
            .send({
                userId: 7,
                token: '123456'
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            data: serviceResult,
            message: 'Login successful'
        });

        expect(authService.verifyTwoFactorLogin).toHaveBeenCalledWith(
            {
                userId: 7,
                token: '123456'
            },
            {
                userAgent: 'Jest test client',
                ipAddress: expect.any(String)
            }
        );
    });

    test('returns 200 for a valid backup code', async () => {
        const serviceResult = {
            user: authenticatedUser,
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token'
        };

        authService.verifyTwoFactorLogin.mockResolvedValueOnce(serviceResult);

        const response = await request(app)
            .post('/api/auth/2fa/verify-login')
            .set('User-Agent', 'Jest test client')
            .send({
                userId: 7,
                backupCode: 'ABCD-1234'
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            data: serviceResult,
            message: 'Login successful'
        });

        expect(authService.verifyTwoFactorLogin).toHaveBeenCalledWith(
            {
                userId: 7,
                backupCode: 'ABCD-1234'
            },
            {
                userAgent: 'Jest test client',
                ipAddress: expect.any(String)
            }
        );
    });

    test('returns 400 when user id is invalid', async () => {
        const response = await request(app)
            .post('/api/auth/2fa/verify-login')
            .send({
                userId: 0,
                token: '123456'
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: 'User id must be a positive integer'
        });

        expect(authService.verifyTwoFactorLogin).not.toHaveBeenCalled();
    });

    test('returns 400 when token and backup code are missing', async () => {
        const response = await request(app)
            .post('/api/auth/2fa/verify-login')
            .send({
                userId: 7
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: 'Two-factor token or backup code is required'
        });

        expect(authService.verifyTwoFactorLogin).not.toHaveBeenCalled();
    });

    test('returns 400 when token and backup code are both provided', async () => {
        const response = await request(app)
            .post('/api/auth/2fa/verify-login')
            .send({
                userId: 7,
                token: '123456',
                backupCode: 'ABCD-1234'
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: 'Use either two-factor token or backup code, not both'
        });

        expect(authService.verifyTwoFactorLogin).not.toHaveBeenCalled();
    });

    test('returns 400 when two-factor token is invalid', async () => {
        const response = await request(app)
            .post('/api/auth/2fa/verify-login')
            .send({
                userId: 7,
                token: '12345'
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: 'Two-factor token must be a 6-digit code'
        });

        expect(authService.verifyTwoFactorLogin).not.toHaveBeenCalled();
    });

    test('returns 400 when backup code has an invalid format', async () => {
        const response = await request(app)
            .post('/api/auth/2fa/verify-login')
            .send({
                userId: 7,
                backupCode: 'INVALID'
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: 'Backup code must have format XXXX-XXXX'
        });

        expect(authService.verifyTwoFactorLogin).not.toHaveBeenCalled();
    });

    test('propagates an error returned by the login verification service', async () => {
        authService.verifyTwoFactorLogin.mockRejectedValueOnce(
            new AppError('Invalid two-factor token', 401)
        );

        const response = await request(app)
            .post('/api/auth/2fa/verify-login')
            .set('User-Agent', 'Jest test client')
            .send({
                userId: 7,
                token: '123456'
            });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            success: false,
            message: 'Invalid two-factor token'
        });

        expect(authService.verifyTwoFactorLogin).toHaveBeenCalledTimes(1);
    });
});

describe('POST /api/auth/2fa/disable', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        userRepository.findById.mockResolvedValue(authenticatedUser);
    });

    test('returns 200 and disables two-factor authentication', async () => {
        const serviceResult = {
            twoFactorEnabled: false
        };

        authService.disableTwoFactor.mockResolvedValueOnce(serviceResult);

        const response = await request(app)
            .post('/api/auth/2fa/disable')
            .set('Authorization', `Bearer ${createAccessToken()}`)
            .send({
                token: '123456'
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            data: serviceResult,
            message: 'Two-factor authentication disabled successfully'
        });

        expect(authService.disableTwoFactor).toHaveBeenCalledWith(
            7,
            { token: '123456' }
        );
    });

    test('returns 401 when authorization token is missing', async () => {
        const response = await request(app)
            .post('/api/auth/2fa/disable')
            .send({
                token: '123456'
            });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            success: false,
            message: 'Authorization token is required'
        });

        expect(authService.disableTwoFactor).not.toHaveBeenCalled();
    });

    test('returns 400 when two-factor token is missing', async () => {
        const response = await request(app)
            .post('/api/auth/2fa/disable')
            .set('Authorization', `Bearer ${createAccessToken()}`)
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: 'Two-factor token is required'
        });

        expect(authService.disableTwoFactor).not.toHaveBeenCalled();
    });

    test('returns 400 when two-factor token is invalid', async () => {
        const response = await request(app)
            .post('/api/auth/2fa/disable')
            .set('Authorization', `Bearer ${createAccessToken()}`)
            .send({
                token: '12345'
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: 'Two-factor token must be a 6-digit code'
        });

        expect(authService.disableTwoFactor).not.toHaveBeenCalled();
    });

    test('propagates an error returned by the disable service', async () => {
        authService.disableTwoFactor.mockRejectedValueOnce(
            new AppError('Invalid two-factor token', 401)
        );

        const response = await request(app)
            .post('/api/auth/2fa/disable')
            .set('Authorization', `Bearer ${createAccessToken()}`)
            .send({
                token: '123456'
            });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            success: false,
            message: 'Invalid two-factor token'
        });

        expect(authService.disableTwoFactor).toHaveBeenCalledWith(
            7,
            { token: '123456' }
        );
    });
});

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