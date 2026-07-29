const mockVerifyIdToken = jest.fn();

jest.mock('bcrypt', () => ({
    compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn()
}));

jest.mock('qrcode', () => ({
    toDataURL: jest.fn()
}));

jest.mock('otplib', () => ({
    generateSecret: jest.fn(),
    generateURI: jest.fn(),
    verify: jest.fn()
}));

jest.mock('google-auth-library', () => ({
    OAuth2Client: jest.fn().mockImplementation(() => ({
        verifyIdToken: mockVerifyIdToken
    }))
}));

jest.mock('../../../src/repositories/user.repository', () => ({
    findByEmailWithPassword: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findTwoFactorByUserId: jest.fn(),
    updateTwoFactorSecret: jest.fn(),
    enableTwoFactor: jest.fn(),
    disableTwoFactor: jest.fn()
}));

jest.mock(
    '../../../src/repositories/userSession.repository',
    () => ({
        create: jest.fn(),
        findByRefreshTokenHash: jest.fn(),
        revoke: jest.fn()
    })
);

jest.mock(
    '../../../src/repositories/userBackupCode.repository',
    () => ({
        deleteByUserId: jest.fn(),
        createMany: jest.fn(),
        findUnusedByUserId: jest.fn(),
        markAsUsed: jest.fn()
    })
);

jest.mock(
    '../../../src/repositories/userIdentity.repository',
    () => ({
        findByProviderAndProviderUserId: jest.fn(),
        findByUserIdAndProvider: jest.fn(),
        create: jest.fn()
    })
);

const {
    AUTH_PROVIDERS
} = require('../../../src/constants/authProviders');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userRepository =
    require('../../../src/repositories/user.repository');

const userSessionRepository =
    require('../../../src/repositories/userSession.repository');

const userBackupCodeRepository =
    require('../../../src/repositories/userBackupCode.repository');

const userIdentityRepository =
    require('../../../src/repositories/userIdentity.repository');

const crypto = require('crypto');
const QRCode = require('qrcode');

const {
    generateSecret,
    generateURI,
    verify
} = require('otplib');

const {
    login,
    refreshAccessToken,
    logout,
    setupTwoFactor,
    verifyTwoFactorSetup,
    verifyTwoFactorLogin,
    disableTwoFactor,
    loginWithGoogle
} = require('../../../src/services/auth.service');

describe('auth.service', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        process.env.GOOGLE_CLIENT_ID =
            'test-google-client-id';

        jwt.sign.mockReturnValue('mock-access-token');
    });

    describe('login', () => {
        it('creates a session and returns tokens for valid credentials', async () => {
            const user = {
                id: 7,
                name: 'Gustavo',
                email: 'gustavo@example.com',
                password_hash: 'stored-password-hash',
                role: 'ADMIN',
                active: true,
                two_factor_enabled: false,
                two_factor_secret: 'private-secret',
                created_at: new Date('2026-07-01'),
                updated_at: new Date('2026-07-20')
            };

            userRepository
                .findByEmailWithPassword
                .mockResolvedValue(user);

            bcrypt.compare.mockResolvedValue(true);

            userSessionRepository.create.mockResolvedValue({
                id: 101
            });

            const result = await login(
                {
                    email: 'gustavo@example.com',
                    password: 'correct-password'
                },
                {
                    userAgent: 'Jest test client',
                    ipAddress: '127.0.0.1'
                }
            );

            expect(
                userRepository.findByEmailWithPassword
            ).toHaveBeenCalledWith(
                'gustavo@example.com'
            );

            expect(bcrypt.compare).toHaveBeenCalledWith(
                'correct-password',
                'stored-password-hash'
            );

            expect(jwt.sign).toHaveBeenCalledWith(
                {
                    id: 7,
                    role: 'ADMIN'
                },
                process.env.JWT_SECRET,
                {
                    expiresIn:
                        process.env.JWT_EXPIRES_IN || '1d'
                }
            );

            expect(
                userSessionRepository.create
            ).toHaveBeenCalledWith({
                userId: 7,
                refreshTokenHash: expect.stringMatching(
                    /^[a-f0-9]{64}$/
                ),
                userAgent: 'Jest test client',
                ipAddress: '127.0.0.1',
                expiresAt: expect.any(Date)
            });

            expect(result).toEqual({
                user: {
                    id: 7,
                    name: 'Gustavo',
                    email: 'gustavo@example.com',
                    role: 'ADMIN',
                    active: true,
                    created_at: user.created_at,
                    updated_at: user.updated_at
                },
                accessToken: 'mock-access-token',
                refreshToken: expect.stringMatching(
                    /^[a-f0-9]{128}$/
                )
            });

            expect(result.user).not.toHaveProperty(
                'password_hash'
            );

            expect(result.user).not.toHaveProperty(
                'two_factor_secret'
            );
        });
        it('rejects an invalid password without creating a session', async () => {
            const user = {
                id: 7,
                email: 'gustavo@example.com',
                password_hash: 'stored-password-hash',
                role: 'ADMIN',
                active: true,
                two_factor_enabled: false
            };

            userRepository
                .findByEmailWithPassword
                .mockResolvedValue(user);

            bcrypt.compare.mockResolvedValue(false);

            await expect(
                login({
                    email: 'gustavo@example.com',
                    password: 'incorrect-password'
                })
            ).rejects.toMatchObject({
                message: 'Invalid email or password',
                statusCode: 401
            });

            expect(
                userRepository.findByEmailWithPassword
            ).toHaveBeenCalledWith('gustavo@example.com');

            expect(bcrypt.compare).toHaveBeenCalledWith(
                'incorrect-password',
                'stored-password-hash'
            );

            expect(jwt.sign).not.toHaveBeenCalled();

            expect(
                userSessionRepository.create
            ).not.toHaveBeenCalled();
        });

        it('requires the second factor without creating a session', async () => {
            const user = {
                id: 7,
                email: 'gustavo@example.com',
                password_hash: 'stored-password-hash',
                role: 'ADMIN',
                active: true,
                two_factor_enabled: true
            };

            userRepository
                .findByEmailWithPassword
                .mockResolvedValue(user);

            bcrypt.compare.mockResolvedValue(true);

            const result = await login({
                email: 'gustavo@example.com',
                password: 'correct-password'
            });

            expect(
                userRepository.findByEmailWithPassword
            ).toHaveBeenCalledWith('gustavo@example.com');

            expect(bcrypt.compare).toHaveBeenCalledWith(
                'correct-password',
                'stored-password-hash'
            );

            expect(result).toEqual({
                requiresTwoFactor: true,
                userId: 7
            });

            expect(jwt.sign).not.toHaveBeenCalled();

            expect(
                userSessionRepository.create
            ).not.toHaveBeenCalled();
        });
    });

    describe('refreshAccessToken', () => {
        it('returns a new access token for a valid session', async () => {
            const session = {
                id: 101,
                user_id: 7,
                revoked_at: null,
                expires_at: new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                )
            };

            const user = {
                id: 7,
                role: 'ADMIN',
                active: true
            };

            userSessionRepository
                .findByRefreshTokenHash
                .mockResolvedValue(session);

            userRepository.findById.mockResolvedValue(user);

            const result = await refreshAccessToken({
                refreshToken: 'valid-refresh-token'
            });

            expect(
                userSessionRepository.findByRefreshTokenHash
            ).toHaveBeenCalledWith(
                expect.stringMatching(/^[a-f0-9]{64}$/)
            );

            expect(userRepository.findById).toHaveBeenCalledWith(
                7
            );

            expect(jwt.sign).toHaveBeenCalledWith(
                {
                    id: 7,
                    role: 'ADMIN'
                },
                process.env.JWT_SECRET,
                {
                    expiresIn:
                        process.env.JWT_EXPIRES_IN || '1d'
                }
            );

            expect(result).toEqual({
                accessToken: 'mock-access-token'
            });

            expect(
                userSessionRepository.create
            ).not.toHaveBeenCalled();
        });
        it('rejects a revoked refresh token', async () => {
            const revokedSession = {
                id: 101,
                user_id: 7,
                revoked_at: new Date('2026-07-20'),
                expires_at: new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                )
            };

            userSessionRepository
                .findByRefreshTokenHash
                .mockResolvedValue(revokedSession);

            await expect(
                refreshAccessToken({
                    refreshToken: 'revoked-refresh-token'
                })
            ).rejects.toMatchObject({
                message: 'Refresh token has been revoked',
                statusCode: 401
            });

            expect(
                userSessionRepository.findByRefreshTokenHash
            ).toHaveBeenCalledWith(
                expect.stringMatching(/^[a-f0-9]{64}$/)
            );

            expect(userRepository.findById).not.toHaveBeenCalled();
            expect(jwt.sign).not.toHaveBeenCalled();

            expect(
                userSessionRepository.create
            ).not.toHaveBeenCalled();
        });
    });

    describe('logout', () => {
        it('revokes the session and returns a success message', async () => {
            const session = {
                id: 101,
                user_id: 7,
                revoked_at: null
            };

            userSessionRepository
                .findByRefreshTokenHash
                .mockResolvedValue(session);

            userSessionRepository.revoke.mockResolvedValue({
                ...session,
                revoked_at: new Date()
            });

            const result = await logout({
                refreshToken: 'valid-refresh-token'
            });

            expect(
                userSessionRepository.findByRefreshTokenHash
            ).toHaveBeenCalledWith(
                expect.stringMatching(/^[a-f0-9]{64}$/)
            );

            expect(
                userSessionRepository.revoke
            ).toHaveBeenCalledWith(101);

            expect(result).toEqual({
                message: 'Logout successful'
            });

            expect(jwt.sign).not.toHaveBeenCalled();

            expect(
                userSessionRepository.create
            ).not.toHaveBeenCalled();
        });
    });

    describe('setupTwoFactor', () => {
        it('starts two-factor setup and returns the secret and QR code', async () => {
            const userTwoFactor = {
                id: 7,
                email: 'gustavo@example.com',
                two_factor_secret: null,
                two_factor_enabled: false,
                two_factor_enabled_at: null
            };

            userRepository
                .findTwoFactorByUserId
                .mockResolvedValue(userTwoFactor);

            generateSecret.mockReturnValue(
                'generated-two-factor-secret'
            );

            userRepository
                .updateTwoFactorSecret
                .mockResolvedValue({
                    ...userTwoFactor,
                    two_factor_secret:
                        'generated-two-factor-secret'
                });

            generateURI.mockReturnValue(
                'otpauth://totp/POS-System'
            );

            QRCode.toDataURL.mockResolvedValue(
                'data:image/png;base64,mock-qr-code'
            );

            const result = await setupTwoFactor(7);

            expect(
                userRepository.findTwoFactorByUserId
            ).toHaveBeenCalledWith(7);

            expect(generateSecret).toHaveBeenCalledTimes(1);

            expect(
                userRepository.updateTwoFactorSecret
            ).toHaveBeenCalledWith(
                7,
                'generated-two-factor-secret'
            );

            expect(generateURI).toHaveBeenCalledWith({
                issuer: 'POS System',
                label: 'gustavo@example.com',
                secret: 'generated-two-factor-secret'
            });

            expect(QRCode.toDataURL).toHaveBeenCalledWith(
                'otpauth://totp/POS-System'
            );

            expect(result).toEqual({
                secret: 'generated-two-factor-secret',
                otpauthUrl: 'otpauth://totp/POS-System',
                qrCodeDataUrl:
                    'data:image/png;base64,mock-qr-code'
            });
        });

        it('rejects setup when two-factor authentication is already enabled', async () => {
            userRepository
                .findTwoFactorByUserId
                .mockResolvedValue({
                    id: 7,
                    email: 'gustavo@example.com',
                    two_factor_secret: 'stored-secret',
                    two_factor_enabled: true,
                    two_factor_enabled_at: new Date()
                });

            await expect(
                setupTwoFactor(7)
            ).rejects.toMatchObject({
                message:
                    'Two-factor authentication is already enabled',
                statusCode: 400
            });

            expect(generateSecret).not.toHaveBeenCalled();

            expect(
                userRepository.updateTwoFactorSecret
            ).not.toHaveBeenCalled();

            expect(generateURI).not.toHaveBeenCalled();
            expect(QRCode.toDataURL).not.toHaveBeenCalled();
        });
    });

    describe('verifyTwoFactorSetup', () => {
        it('enables two-factor authentication and creates backup codes', async () => {
            const enabledAt = new Date(
                '2026-07-28T12:00:00.000Z'
            );

            userRepository
                .findTwoFactorByUserId
                .mockResolvedValue({
                    id: 7,
                    email: 'gustavo@example.com',
                    two_factor_secret:
                        'stored-two-factor-secret',
                    two_factor_enabled: false,
                    two_factor_enabled_at: null
                });

            verify.mockResolvedValue({
                valid: true
            });

            userRepository.enableTwoFactor.mockResolvedValue({
                id: 7,
                email: 'gustavo@example.com',
                two_factor_enabled: true,
                two_factor_enabled_at: enabledAt
            });

            userBackupCodeRepository
                .deleteByUserId
                .mockResolvedValue([]);

            userBackupCodeRepository
                .createMany
                .mockResolvedValue([]);

            const result = await verifyTwoFactorSetup(7, {
                token: '123456'
            });

            expect(
                userRepository.findTwoFactorByUserId
            ).toHaveBeenCalledWith(7);

            expect(verify).toHaveBeenCalledWith({
                secret: 'stored-two-factor-secret',
                token: '123456'
            });

            expect(
                userRepository.enableTwoFactor
            ).toHaveBeenCalledWith(7);

            expect(
                userBackupCodeRepository.deleteByUserId
            ).toHaveBeenCalledWith(7);

            expect(
                userBackupCodeRepository.createMany
            ).toHaveBeenCalledTimes(1);

            const [
                createManyUserId,
                storedBackupCodeHashes
            ] =
                userBackupCodeRepository
                    .createMany
                    .mock.calls[0];

            expect(createManyUserId).toBe(7);
            expect(storedBackupCodeHashes).toHaveLength(10);

            storedBackupCodeHashes.forEach((hash) => {
                expect(hash).toMatch(/^[a-f0-9]{64}$/);
            });

            expect(result.backupCodes).toHaveLength(10);

            result.backupCodes.forEach(
                (backupCode, index) => {
                    expect(backupCode).toMatch(
                        /^[A-F0-9]{4}-[A-F0-9]{4}$/
                    );

                    const expectedHash = crypto
                        .createHash('sha256')
                        .update(backupCode)
                        .digest('hex');

                    expect(
                        storedBackupCodeHashes[index]
                    ).toBe(expectedHash);
                }
            );

            expect(result).toEqual({
                id: 7,
                email: 'gustavo@example.com',
                two_factor_enabled: true,
                two_factor_enabled_at: enabledAt,
                backupCodes: expect.any(Array)
            });
        });

        it('rejects an invalid setup token without enabling two-factor authentication', async () => {
            userRepository
                .findTwoFactorByUserId
                .mockResolvedValue({
                    id: 7,
                    email: 'gustavo@example.com',
                    two_factor_secret:
                        'stored-two-factor-secret',
                    two_factor_enabled: false,
                    two_factor_enabled_at: null
                });

            verify.mockResolvedValue({
                valid: false
            });

            await expect(
                verifyTwoFactorSetup(7, {
                    token: 'invalid-token'
                })
            ).rejects.toMatchObject({
                message: 'Invalid two-factor token',
                statusCode: 401
            });

            expect(verify).toHaveBeenCalledWith({
                secret: 'stored-two-factor-secret',
                token: 'invalid-token'
            });

            expect(
                userRepository.enableTwoFactor
            ).not.toHaveBeenCalled();

            expect(
                userBackupCodeRepository.deleteByUserId
            ).not.toHaveBeenCalled();

            expect(
                userBackupCodeRepository.createMany
            ).not.toHaveBeenCalled();
        });

        it('rejects verification when setup has not been started', async () => {
            userRepository
                .findTwoFactorByUserId
                .mockResolvedValue({
                    id: 7,
                    email: 'gustavo@example.com',
                    two_factor_secret: null,
                    two_factor_enabled: false,
                    two_factor_enabled_at: null
                });

            await expect(
                verifyTwoFactorSetup(7, {
                    token: '123456'
                })
            ).rejects.toMatchObject({
                message:
                    'Two-factor authentication setup has not been started',
                statusCode: 400
            });

            expect(verify).not.toHaveBeenCalled();

            expect(
                userRepository.enableTwoFactor
            ).not.toHaveBeenCalled();

            expect(
                userBackupCodeRepository.deleteByUserId
            ).not.toHaveBeenCalled();

            expect(
                userBackupCodeRepository.createMany
            ).not.toHaveBeenCalled();
        });

        it('rejects verification when two-factor authentication is already enabled', async () => {
            userRepository
                .findTwoFactorByUserId
                .mockResolvedValue({
                    id: 7,
                    email: 'gustavo@example.com',
                    two_factor_secret:
                        'stored-two-factor-secret',
                    two_factor_enabled: true,
                    two_factor_enabled_at: new Date()
                });

            await expect(
                verifyTwoFactorSetup(7, {
                    token: '123456'
                })
            ).rejects.toMatchObject({
                message:
                    'Two-factor authentication is already enabled',
                statusCode: 400
            });

            expect(verify).not.toHaveBeenCalled();

            expect(
                userRepository.enableTwoFactor
            ).not.toHaveBeenCalled();

            expect(
                userBackupCodeRepository.deleteByUserId
            ).not.toHaveBeenCalled();

            expect(
                userBackupCodeRepository.createMany
            ).not.toHaveBeenCalled();
        });
    });

    describe('verifyTwoFactorLogin', () => {
        it('creates a session after a valid TOTP login', async () => {
            userRepository
                .findTwoFactorByUserId
                .mockResolvedValue({
                    id: 7,
                    two_factor_secret:
                        'stored-two-factor-secret',
                    two_factor_enabled: true
                });

            verify.mockResolvedValue({
                valid: true
            });

            userRepository.findById.mockResolvedValue({
                id: 7,
                name: 'Gustavo',
                email: 'gustavo@example.com',
                role: 'ADMIN',
                active: true,
                created_at: new Date('2026-07-01'),
                updated_at: new Date('2026-07-20')
            });

            userSessionRepository.create.mockResolvedValue({
                id: 101
            });

            const result = await verifyTwoFactorLogin(
                {
                    userId: 7,
                    token: '123456'
                },
                {
                    userAgent: 'Jest test client',
                    ipAddress: '127.0.0.1'
                }
            );

            expect(
                userRepository.findTwoFactorByUserId
            ).toHaveBeenCalledWith(7);

            expect(verify).toHaveBeenCalledWith({
                secret: 'stored-two-factor-secret',
                token: '123456'
            });

            expect(
                userRepository.findById
            ).toHaveBeenCalledWith(7);

            expect(
                userSessionRepository.create
            ).toHaveBeenCalledWith({
                userId: 7,
                refreshTokenHash: expect.stringMatching(
                    /^[a-f0-9]{64}$/
                ),
                userAgent: 'Jest test client',
                ipAddress: '127.0.0.1',
                expiresAt: expect.any(Date)
            });

            expect(result).toMatchObject({
                user: {
                    id: 7,
                    name: 'Gustavo',
                    email: 'gustavo@example.com',
                    role: 'ADMIN',
                    active: true
                },
                accessToken: 'mock-access-token',
                refreshToken: expect.any(String)
            });
        });

        it('creates a session with a backup code and prevents its reuse', async () => {
            const normalizedBackupCode = 'AB12-CD34';

            const backupCodeHash = crypto
                .createHash('sha256')
                .update(normalizedBackupCode)
                .digest('hex');

            userRepository
                .findTwoFactorByUserId
                .mockResolvedValue({
                    id: 7,
                    two_factor_secret:
                        'stored-two-factor-secret',
                    two_factor_enabled: true
                });

            userBackupCodeRepository
                .findUnusedByUserId
                .mockResolvedValueOnce([
                    {
                        id: 55,
                        user_id: 7,
                        code_hash: backupCodeHash,
                        used_at: null
                    }
                ])
                .mockResolvedValueOnce([]);

            userBackupCodeRepository
                .markAsUsed
                .mockResolvedValue({
                    id: 55,
                    used_at: new Date()
                });

            userRepository.findById.mockResolvedValue({
                id: 7,
                name: 'Gustavo',
                email: 'gustavo@example.com',
                role: 'ADMIN',
                active: true,
                created_at: new Date('2026-07-01'),
                updated_at: new Date('2026-07-20')
            });

            userSessionRepository.create.mockResolvedValue({
                id: 101
            });

            const loginData = {
                userId: 7,
                backupCode: ' ab12-cd34 '
            };

            const metadata = {
                userAgent: 'Jest test client',
                ipAddress: '127.0.0.1'
            };

            const result = await verifyTwoFactorLogin(
                loginData,
                metadata
            );

            expect(
                userBackupCodeRepository.findUnusedByUserId
            ).toHaveBeenNthCalledWith(1, 7);

            expect(
                userBackupCodeRepository.markAsUsed
            ).toHaveBeenCalledWith(55);

            expect(result).toMatchObject({
                user: {
                    id: 7,
                    email: 'gustavo@example.com'
                },
                accessToken: 'mock-access-token',
                refreshToken: expect.any(String)
            });

            await expect(
                verifyTwoFactorLogin(loginData, metadata)
            ).rejects.toMatchObject({
                message: 'Invalid two-factor token or backup code',
                statusCode: 401
            });

            expect(
                userBackupCodeRepository.findUnusedByUserId
            ).toHaveBeenCalledTimes(2);

            expect(
                userBackupCodeRepository.markAsUsed
            ).toHaveBeenCalledTimes(1);

            expect(
                userSessionRepository.create
            ).toHaveBeenCalledTimes(1);

            expect(verify).not.toHaveBeenCalled();
        });

        it('rejects an invalid two-factor token without creating a session', async () => {
            userRepository
                .findTwoFactorByUserId
                .mockResolvedValue({
                    id: 7,
                    two_factor_secret:
                        'stored-two-factor-secret',
                    two_factor_enabled: true
                });

            verify.mockResolvedValue({
                valid: false
            });

            await expect(
                verifyTwoFactorLogin({
                    userId: 7,
                    token: 'invalid-token'
                })
            ).rejects.toMatchObject({
                message: 'Invalid two-factor token or backup code',
                statusCode: 401
            });

            expect(verify).toHaveBeenCalledWith({
                secret: 'stored-two-factor-secret',
                token: 'invalid-token'
            });

            expect(
                userRepository.findById
            ).not.toHaveBeenCalled();

            expect(
                userSessionRepository.create
            ).not.toHaveBeenCalled();
        });

        it('rejects an inactive user after valid two-factor verification', async () => {
            userRepository
                .findTwoFactorByUserId
                .mockResolvedValue({
                    id: 7,
                    two_factor_secret:
                        'stored-two-factor-secret',
                    two_factor_enabled: true
                });

            verify.mockResolvedValue({
                valid: true
            });

            userRepository.findById.mockResolvedValue({
                id: 7,
                name: 'Gustavo',
                email: 'gustavo@example.com',
                role: 'ADMIN',
                active: false
            });

            await expect(
                verifyTwoFactorLogin({
                    userId: 7,
                    token: '123456'
                })
            ).rejects.toMatchObject({
                message: 'User is inactive',
                statusCode: 403
            });

            expect(verify).toHaveBeenCalledWith({
                secret: 'stored-two-factor-secret',
                token: '123456'
            });

            expect(
                userRepository.findById
            ).toHaveBeenCalledWith(7);

            expect(
                userSessionRepository.create
            ).not.toHaveBeenCalled();
        });

        it('rejects login when the user does not exist', async () => {
            userRepository
                .findTwoFactorByUserId
                .mockResolvedValue(undefined);

            await expect(
                verifyTwoFactorLogin({
                    userId: 999,
                    token: '123456'
                })
            ).rejects.toMatchObject({
                message: 'User not found',
                statusCode: 404
            });

            expect(
                userRepository.findTwoFactorByUserId
            ).toHaveBeenCalledWith(999);

            expect(verify).not.toHaveBeenCalled();

            expect(
                userRepository.findById
            ).not.toHaveBeenCalled();

            expect(
                userSessionRepository.create
            ).not.toHaveBeenCalled();
        });
    });

    describe('disableTwoFactor', () => {
        it('disables two-factor authentication and deletes backup codes', async () => {
            userRepository
                .findTwoFactorByUserId
                .mockResolvedValue({
                    id: 7,
                    email: 'gustavo@example.com',
                    two_factor_secret:
                        'stored-two-factor-secret',
                    two_factor_enabled: true,
                    two_factor_enabled_at: new Date(
                        '2026-07-28T12:00:00.000Z'
                    )
                });

            verify.mockResolvedValue({
                valid: true
            });

            userRepository.disableTwoFactor.mockResolvedValue({
                id: 7,
                email: 'gustavo@example.com',
                two_factor_secret: null,
                two_factor_enabled: false,
                two_factor_enabled_at: null
            });

            userBackupCodeRepository
                .deleteByUserId
                .mockResolvedValue([]);

            const result = await disableTwoFactor(7, {
                token: '123456'
            });

            expect(
                userRepository.findTwoFactorByUserId
            ).toHaveBeenCalledWith(7);

            expect(verify).toHaveBeenCalledWith({
                secret: 'stored-two-factor-secret',
                token: '123456'
            });

            expect(
                userRepository.disableTwoFactor
            ).toHaveBeenCalledWith(7);

            expect(
                userBackupCodeRepository.deleteByUserId
            ).toHaveBeenCalledWith(7);

            expect(result).toEqual({
                id: 7,
                email: 'gustavo@example.com',
                two_factor_enabled: false,
                two_factor_enabled_at: null
            });

            expect(result).not.toHaveProperty(
                'two_factor_secret'
            );
        });

        it('rejects an invalid token without disabling two-factor authentication', async () => {
            userRepository
                .findTwoFactorByUserId
                .mockResolvedValue({
                    id: 7,
                    email: 'gustavo@example.com',
                    two_factor_secret:
                        'stored-two-factor-secret',
                    two_factor_enabled: true
                });

            verify.mockResolvedValue({
                valid: false
            });

            await expect(
                disableTwoFactor(7, {
                    token: 'invalid-token'
                })
            ).rejects.toMatchObject({
                message: 'Invalid two-factor token',
                statusCode: 401
            });

            expect(verify).toHaveBeenCalledWith({
                secret: 'stored-two-factor-secret',
                token: 'invalid-token'
            });

            expect(
                userRepository.disableTwoFactor
            ).not.toHaveBeenCalled();

            expect(
                userBackupCodeRepository.deleteByUserId
            ).not.toHaveBeenCalled();
        });

        it('rejects disabling two-factor authentication when it is not enabled', async () => {
            userRepository
                .findTwoFactorByUserId
                .mockResolvedValue({
                    id: 7,
                    email: 'gustavo@example.com',
                    two_factor_secret:
                        'stored-two-factor-secret',
                    two_factor_enabled: false,
                    two_factor_enabled_at: null
                });

            await expect(
                disableTwoFactor(7, {
                    token: '123456'
                })
            ).rejects.toMatchObject({
                message:
                    'Two-factor authentication is not enabled',
                statusCode: 400
            });

            expect(verify).not.toHaveBeenCalled();

            expect(
                userRepository.disableTwoFactor
            ).not.toHaveBeenCalled();

            expect(
                userBackupCodeRepository.deleteByUserId
            ).not.toHaveBeenCalled();
        });
    });

    describe('loginWithGoogle', () => {
        it('creates a session for an already linked Google identity', async () => {
            mockVerifyIdToken.mockResolvedValue({
                getPayload: () => ({
                    sub: 'google-user-123',
                    email: 'gustavo@example.com',
                    email_verified: true,
                    name: 'Gustavo',
                    picture: 'https://example.com/profile.jpg'
                })
            });

            userIdentityRepository
                .findByProviderAndProviderUserId
                .mockResolvedValue({
                    id: 20,
                    user_id: 7,
                    provider: AUTH_PROVIDERS.GOOGLE,
                    provider_user_id: 'google-user-123',
                    email: 'gustavo@example.com'
                });

            userRepository.findById.mockResolvedValue({
                id: 7,
                name: 'Gustavo',
                email: 'gustavo@example.com',
                role: 'ADMIN',
                active: true,
                created_at: new Date('2026-07-01'),
                updated_at: new Date('2026-07-20')
            });

            userSessionRepository.create.mockResolvedValue({
                id: 101
            });

            const result = await loginWithGoogle(
                {
                    idToken: 'valid-google-id-token'
                },
                {
                    userAgent: 'Jest test client',
                    ipAddress: '127.0.0.1'
                }
            );

            expect(mockVerifyIdToken).toHaveBeenCalledWith({
                idToken: 'valid-google-id-token',
                audience: 'test-google-client-id'
            });

            expect(
                userIdentityRepository
                    .findByProviderAndProviderUserId
            ).toHaveBeenCalledWith(
                AUTH_PROVIDERS.GOOGLE,
                'google-user-123'
            );

            expect(userRepository.findById).toHaveBeenCalledWith(7);

            expect(
                userSessionRepository.create
            ).toHaveBeenCalledWith({
                userId: 7,
                refreshTokenHash: expect.stringMatching(
                    /^[a-f0-9]{64}$/
                ),
                userAgent: 'Jest test client',
                ipAddress: '127.0.0.1',
                expiresAt: expect.any(Date)
            });

            expect(result).toMatchObject({
                user: {
                    id: 7,
                    name: 'Gustavo',
                    email: 'gustavo@example.com',
                    role: 'ADMIN',
                    active: true
                },
                accessToken: 'mock-access-token',
                refreshToken: expect.any(String)
            });

            expect(
                userRepository.findByEmail
            ).not.toHaveBeenCalled();

            expect(
                userIdentityRepository.findByUserIdAndProvider
            ).not.toHaveBeenCalled();

            expect(
                userIdentityRepository.create
            ).not.toHaveBeenCalled();
        });

        it('links an existing user by verified email and creates a session', async () => {
            mockVerifyIdToken.mockResolvedValue({
                getPayload: () => ({
                    sub: 'google-user-456',
                    email: 'gustavo@example.com',
                    email_verified: true,
                    name: 'Gustavo',
                    picture: 'https://example.com/profile.jpg'
                })
            });

            userIdentityRepository
                .findByProviderAndProviderUserId
                .mockResolvedValue(null);

            const user = {
                id: 7,
                name: 'Gustavo',
                email: 'gustavo@example.com',
                role: 'ADMIN',
                active: true,
                created_at: new Date('2026-07-01'),
                updated_at: new Date('2026-07-20')
            };

            userRepository.findByEmail.mockResolvedValue(user);

            userIdentityRepository
                .findByUserIdAndProvider
                .mockResolvedValue(null);

            userIdentityRepository.create.mockResolvedValue({
                id: 21,
                user_id: 7,
                provider: AUTH_PROVIDERS.GOOGLE,
                provider_user_id: 'google-user-456',
                email: 'gustavo@example.com'
            });

            userSessionRepository.create.mockResolvedValue({
                id: 102
            });

            const result = await loginWithGoogle(
                {
                    idToken: 'valid-google-id-token'
                },
                {
                    userAgent: 'Jest test client',
                    ipAddress: '127.0.0.1'
                }
            );

            expect(mockVerifyIdToken).toHaveBeenCalledWith({
                idToken: 'valid-google-id-token',
                audience: 'test-google-client-id'
            });

            expect(
                userIdentityRepository
                    .findByProviderAndProviderUserId
            ).toHaveBeenCalledWith(
                AUTH_PROVIDERS.GOOGLE,
                'google-user-456'
            );

            expect(userRepository.findByEmail).toHaveBeenCalledWith(
                'gustavo@example.com'
            );

            expect(
                userIdentityRepository.findByUserIdAndProvider
            ).toHaveBeenCalledWith(
                7,
                AUTH_PROVIDERS.GOOGLE
            );

            expect(
                userIdentityRepository.create
            ).toHaveBeenCalledWith({
                userId: 7,
                provider: AUTH_PROVIDERS.GOOGLE,
                providerUserId: 'google-user-456',
                email: 'gustavo@example.com'
            });

            expect(userRepository.findById).not.toHaveBeenCalled();

            expect(
                userSessionRepository.create
            ).toHaveBeenCalledWith({
                userId: 7,
                refreshTokenHash: expect.stringMatching(
                    /^[a-f0-9]{64}$/
                ),
                userAgent: 'Jest test client',
                ipAddress: '127.0.0.1',
                expiresAt: expect.any(Date)
            });

            expect(result).toMatchObject({
                user: {
                    id: 7,
                    name: 'Gustavo',
                    email: 'gustavo@example.com',
                    role: 'ADMIN',
                    active: true
                },
                accessToken: 'mock-access-token',
                refreshToken: expect.any(String)
            });
        });

        it('rejects an invalid Google ID token without creating a session', async () => {
            mockVerifyIdToken.mockRejectedValue(
                new Error('Google verification failed')
            );

            await expect(
                loginWithGoogle({
                    idToken: 'invalid-google-id-token'
                })
            ).rejects.toMatchObject({
                message: 'Invalid Google ID token',
                statusCode: 401
            });

            expect(mockVerifyIdToken).toHaveBeenCalledWith({
                idToken: 'invalid-google-id-token',
                audience: 'test-google-client-id'
            });

            expect(
                userIdentityRepository
                    .findByProviderAndProviderUserId
            ).not.toHaveBeenCalled();

            expect(userRepository.findByEmail).not.toHaveBeenCalled();
            expect(userRepository.findById).not.toHaveBeenCalled();
            expect(userIdentityRepository.create).not.toHaveBeenCalled();
            expect(userSessionRepository.create).not.toHaveBeenCalled();
        });

        it('rejects an unverified Google email without creating a session', async () => {
            mockVerifyIdToken.mockResolvedValue({
                getPayload: () => ({
                    sub: 'google-user-789',
                    email: 'gustavo@example.com',
                    email_verified: false,
                    name: 'Gustavo',
                    picture: 'https://example.com/profile.jpg'
                })
            });

            await expect(
                loginWithGoogle({
                    idToken: 'unverified-email-id-token'
                })
            ).rejects.toMatchObject({
                message: 'Google account email is not verified',
                statusCode: 403
            });

            expect(mockVerifyIdToken).toHaveBeenCalledWith({
                idToken: 'unverified-email-id-token',
                audience: 'test-google-client-id'
            });

            expect(
                userIdentityRepository
                    .findByProviderAndProviderUserId
            ).not.toHaveBeenCalled();

            expect(userRepository.findByEmail).not.toHaveBeenCalled();
            expect(userRepository.findById).not.toHaveBeenCalled();

            expect(
                userIdentityRepository.create
            ).not.toHaveBeenCalled();

            expect(
                userSessionRepository.create
            ).not.toHaveBeenCalled();
        });

        it('rejects login when no local user exists for the verified email', async () => {
            mockVerifyIdToken.mockResolvedValue({
                getPayload: () => ({
                    sub: 'google-user-999',
                    email: 'unknown@example.com',
                    email_verified: true,
                    name: 'Unknown User',
                    picture: 'https://example.com/profile.jpg'
                })
            });

            userIdentityRepository
                .findByProviderAndProviderUserId
                .mockResolvedValue(null);

            userRepository.findByEmail.mockResolvedValue(null);

            await expect(
                loginWithGoogle({
                    idToken: 'valid-google-id-token'
                })
            ).rejects.toMatchObject({
                message: 'User account does not exist',
                statusCode: 404
            });

            expect(
                userIdentityRepository
                    .findByProviderAndProviderUserId
            ).toHaveBeenCalledWith(
                AUTH_PROVIDERS.GOOGLE,
                'google-user-999'
            );

            expect(userRepository.findByEmail).toHaveBeenCalledWith(
                'unknown@example.com'
            );

            expect(userRepository.findById).not.toHaveBeenCalled();

            expect(
                userIdentityRepository.findByUserIdAndProvider
            ).not.toHaveBeenCalled();

            expect(
                userIdentityRepository.create
            ).not.toHaveBeenCalled();

            expect(
                userSessionRepository.create
            ).not.toHaveBeenCalled();
        });

        it('rejects login when the user already has a different Google identity linked', async () => {
            mockVerifyIdToken.mockResolvedValue({
                getPayload: () => ({
                    sub: 'new-google-user-123',
                    email: 'gustavo@example.com',
                    email_verified: true,
                    name: 'Gustavo',
                    picture: 'https://example.com/profile.jpg'
                })
            });

            userIdentityRepository
                .findByProviderAndProviderUserId
                .mockResolvedValue(null);

            userRepository.findByEmail.mockResolvedValue({
                id: 7,
                name: 'Gustavo',
                email: 'gustavo@example.com',
                role: 'ADMIN',
                active: true
            });

            userIdentityRepository
                .findByUserIdAndProvider
                .mockResolvedValue({
                    id: 20,
                    user_id: 7,
                    provider: AUTH_PROVIDERS.GOOGLE,
                    provider_user_id: 'different-google-user'
                });

            await expect(
                loginWithGoogle({
                    idToken: 'valid-google-id-token'
                })
            ).rejects.toMatchObject({
                message: 'User already has a Google account linked',
                statusCode: 409
            });

            expect(
                userIdentityRepository
                    .findByProviderAndProviderUserId
            ).toHaveBeenCalledWith(
                AUTH_PROVIDERS.GOOGLE,
                'new-google-user-123'
            );

            expect(userRepository.findByEmail).toHaveBeenCalledWith(
                'gustavo@example.com'
            );

            expect(
                userIdentityRepository.findByUserIdAndProvider
            ).toHaveBeenCalledWith(
                7,
                AUTH_PROVIDERS.GOOGLE
            );

            expect(userRepository.findById).not.toHaveBeenCalled();
            expect(userIdentityRepository.create).not.toHaveBeenCalled();
            expect(userSessionRepository.create).not.toHaveBeenCalled();
        });

        it('rejects an inactive user without creating a session', async () => {
            mockVerifyIdToken.mockResolvedValue({
                getPayload: () => ({
                    sub: 'google-user-inactive',
                    email: 'inactive@example.com',
                    email_verified: true,
                    name: 'Inactive User',
                    picture: 'https://example.com/profile.jpg'
                })
            });

            userIdentityRepository
                .findByProviderAndProviderUserId
                .mockResolvedValue({
                    id: 22,
                    user_id: 8,
                    provider: AUTH_PROVIDERS.GOOGLE,
                    provider_user_id: 'google-user-inactive',
                    email: 'inactive@example.com'
                });

            userRepository.findById.mockResolvedValue({
                id: 8,
                name: 'Inactive User',
                email: 'inactive@example.com',
                role: 'EMPLOYEE',
                active: false
            });

            await expect(
                loginWithGoogle({
                    idToken: 'valid-google-id-token'
                })
            ).rejects.toMatchObject({
                message: 'User is inactive',
                statusCode: 403
            });

            expect(
                userIdentityRepository
                    .findByProviderAndProviderUserId
            ).toHaveBeenCalledWith(
                AUTH_PROVIDERS.GOOGLE,
                'google-user-inactive'
            );

            expect(userRepository.findById).toHaveBeenCalledWith(8);

            expect(userRepository.findByEmail).not.toHaveBeenCalled();

            expect(
                userIdentityRepository.findByUserIdAndProvider
            ).not.toHaveBeenCalled();

            expect(
                userIdentityRepository.create
            ).not.toHaveBeenCalled();

            expect(
                userSessionRepository.create
            ).not.toHaveBeenCalled();
        });
    });
});
