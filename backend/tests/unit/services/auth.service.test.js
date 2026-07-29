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
        verifyIdToken: jest.fn()
    }))
}));

jest.mock('../../../src/repositories/user.repository', () => ({
    findByEmailWithPassword: jest.fn(),
    findById: jest.fn()
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
    () => ({})
);

jest.mock(
    '../../../src/repositories/userIdentity.repository',
    () => ({})
);

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userRepository =
    require('../../../src/repositories/user.repository');

const userSessionRepository =
    require('../../../src/repositories/userSession.repository');

const {
    login,
    refreshAccessToken,
    logout
} = require('../../../src/services/auth.service');

describe('auth.service', () => {
    beforeEach(() => {
        jest.clearAllMocks();

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
});
