// ==============================
// External libraries
// ==============================
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { OAuth2Client } = require('google-auth-library');
const {
    generateSecret,
    generateURI,
    verify
} = require('otplib');

// ==============================
// Constants
// ==============================
const { AUTH_PROVIDERS } = require('../constants/authProviders');

// ==============================
// Repositories
// ==============================
const userRepository = require('../repositories/user.repository');
const userSessionRepository = require('../repositories/userSession.repository');
const userBackupCodeRepository = require('../repositories/userBackupCode.repository');
const userIdentityRepository = require('../repositories/userIdentity.repository');

// ==============================
// Errors and validators
// ==============================
const AppError = require('../errors/AppError');
const { validateLoginInput } = require('../validators/auth.validator');

// ==============================
// External clients
// ==============================
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ==============================
// Token helpers
// ==============================
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '1d'
        }
    );
};

const generateRefreshToken = () => {
    return crypto.randomBytes(64).toString('hex');
};

const hashRefreshToken = (refreshToken) => {
    return crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');
};

const getRefreshTokenExpiresAt = () => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    return expiresAt;
};

const buildAuthUserResponse = (user) => {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        created_at: user.created_at,
        updated_at: user.updated_at
    };
};

const createSessionAndTokens = async (user, metadata = {}) => {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);

    await userSessionRepository.create({
        userId: user.id,
        refreshTokenHash,
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
        expiresAt: getRefreshTokenExpiresAt()
    });

    return {
        user: buildAuthUserResponse(user),
        accessToken,
        refreshToken
    };
};

// ==============================
// Backup code helpers
// ==============================
const generateBackupCode = () => {
    const partOne = crypto.randomBytes(2).toString('hex').toUpperCase();
    const partTwo = crypto.randomBytes(2).toString('hex').toUpperCase();

    return `${partOne}-${partTwo}`;
};

const generateBackupCodes = (amount = 10) => {
    return Array.from({ length: amount }, () => generateBackupCode());
};

const hashBackupCode = (backupCode) => {
    return crypto
        .createHash('sha256')
        .update(backupCode)
        .digest('hex');
};

const verifyBackupCode = async (userId, backupCode) => {
    const normalizedBackupCode = backupCode.trim().toUpperCase();
    const backupCodeHash = hashBackupCode(normalizedBackupCode);

    const unusedBackupCodes = await userBackupCodeRepository.findUnusedByUserId(userId);

    const matchingBackupCode = unusedBackupCodes.find((storedBackupCode) => {
        return storedBackupCode.code_hash === backupCodeHash;
    });

    if (!matchingBackupCode) {
        return false;
    }

    await userBackupCodeRepository.markAsUsed(matchingBackupCode.id);

    return true;
};

// ==============================
// Google helpers
// ==============================
const verifyGoogleIdToken = async (idToken) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
        throw new AppError('Google client id is not configured', 500);
    }

    let ticket;

    try {
        ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
    } catch (error) {
        throw new AppError('Invalid Google ID token', 401);
    }

    const payload = ticket.getPayload();

    if (!payload) {
        throw new AppError('Invalid Google ID token', 401);
    }

    if (!payload.email) {
        throw new AppError('Google account email is required', 400);
    }

    if (!payload.email_verified) {
        throw new AppError('Google account email is not verified', 403);
    }

    return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
    };
};

// ======================================================
// LOGIN FLOW #1: Email/password login
// ======================================================
const login = async (data, metadata = {}) => {
    validateLoginInput(data);

    const user = await userRepository.findByEmailWithPassword(data.email);

    if (!user) {
        throw new AppError('Invalid email or password', 401);
    }

    if (!user.active) {
        throw new AppError('User is inactive', 403);
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password_hash);

    if (!passwordMatches) {
        throw new AppError('Invalid email or password', 401);
    }

    if (user.two_factor_enabled) {
        return {
            requiresTwoFactor: true,
            userId: user.id
        };
    }

    return createSessionAndTokens(user, metadata);
};

// ======================================================
// Session flow: refresh token and logout
// ======================================================
const refreshAccessToken = async (data) => {
    const refreshTokenHash = hashRefreshToken(data.refreshToken);

    const session = await userSessionRepository.findByRefreshTokenHash(refreshTokenHash);

    if (!session) {
        throw new AppError('Invalid refresh token', 401);
    }

    if (session.revoked_at) {
        throw new AppError('Refresh token has been revoked', 401);
    }

    if (new Date(session.expires_at) < new Date()) {
        throw new AppError('Refresh token has expired', 401);
    }

    const user = await userRepository.findById(session.user_id);

    if (!user) {
        throw new AppError('User not found', 401);
    }

    if (!user.active) {
        throw new AppError('User is inactive', 403);
    }

    return {
        accessToken: generateAccessToken(user)
    };
};

const logout = async (data) => {
    const refreshTokenHash = hashRefreshToken(data.refreshToken);

    const session = await userSessionRepository.findByRefreshTokenHash(refreshTokenHash);

    if (!session) {
        throw new AppError('Invalid refresh token', 401);
    }

    if (session.revoked_at) {
        throw new AppError('Refresh token has already been revoked', 401);
    }

    await userSessionRepository.revoke(session.id);

    return {
        message: 'Logout successful'
    };
};

// ======================================================
// 2FA setup flow: enable/disable TOTP authentication
// ======================================================
const setupTwoFactor = async (userId) => {
    const userTwoFactor = await userRepository.findTwoFactorByUserId(userId);

    if (!userTwoFactor) {
        throw new AppError('User not found', 404);
    }

    if (userTwoFactor.two_factor_enabled) {
        throw new AppError('Two-factor authentication is already enabled', 400);
    }

    const secret = generateSecret();

    await userRepository.updateTwoFactorSecret(userId, secret);

    const otpauthUrl = generateURI({
        issuer: 'POS System',
        label: userTwoFactor.email,
        secret
    });

    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    return {
        secret,
        otpauthUrl,
        qrCodeDataUrl
    };
};

const verifyTwoFactorSetup = async (userId, data) => {
    const userTwoFactor = await userRepository.findTwoFactorByUserId(userId);

    if (!userTwoFactor) {
        throw new AppError('User not found', 404);
    }

    if (!userTwoFactor.two_factor_secret) {
        throw new AppError('Two-factor authentication setup has not been started', 400);
    }

    if (userTwoFactor.two_factor_enabled) {
        throw new AppError('Two-factor authentication is already enabled', 400);
    }

    const result = await verify({
        secret: userTwoFactor.two_factor_secret,
        token: data.token
    });

    if (!result.valid) {
        throw new AppError('Invalid two-factor token', 401);
    }

    const updatedUser = await userRepository.enableTwoFactor(userId);

    await userBackupCodeRepository.deleteByUserId(userId);

    const backupCodes = generateBackupCodes();
    const backupCodeHashes = backupCodes.map(hashBackupCode);

    await userBackupCodeRepository.createMany(userId, backupCodeHashes);

    return {
        id: updatedUser.id,
        email: updatedUser.email,
        two_factor_enabled: updatedUser.two_factor_enabled,
        two_factor_enabled_at: updatedUser.two_factor_enabled_at,
        backupCodes
    };
};

const disableTwoFactor = async (userId, data) => {
    const userTwoFactor = await userRepository.findTwoFactorByUserId(userId);

    if (!userTwoFactor) {
        throw new AppError('User not found', 404);
    }

    if (!userTwoFactor.two_factor_enabled) {
        throw new AppError('Two-factor authentication is not enabled', 400);
    }

    if (!userTwoFactor.two_factor_secret) {
        throw new AppError('Two-factor authentication is not configured', 400);
    }

    const result = await verify({
        secret: userTwoFactor.two_factor_secret,
        token: data.token
    });

    if (!result.valid) {
        throw new AppError('Invalid two-factor token', 401);
    }

    const updatedUser = await userRepository.disableTwoFactor(userId);

    await userBackupCodeRepository.deleteByUserId(userId);

    return {
        id: updatedUser.id,
        email: updatedUser.email,
        two_factor_enabled: updatedUser.two_factor_enabled,
        two_factor_enabled_at: updatedUser.two_factor_enabled_at
    };
};

// ======================================================
// LOGIN FLOW #2: Finish login with 2FA or backup code
// ======================================================
const verifyTwoFactorLogin = async (data, metadata = {}) => {
    const userTwoFactor = await userRepository.findTwoFactorByUserId(data.userId);

    if (!userTwoFactor) {
        throw new AppError('User not found', 404);
    }

    if (!userTwoFactor.two_factor_enabled) {
        throw new AppError('Two-factor authentication is not enabled', 400);
    }

    if (!userTwoFactor.two_factor_secret) {
        throw new AppError('Two-factor authentication is not configured', 400);
    }

    let isValidSecondFactor = false;

    if (data.token) {
        const result = await verify({
            secret: userTwoFactor.two_factor_secret,
            token: data.token
        });

        isValidSecondFactor = result.valid;
    }

    if (data.backupCode) {
        isValidSecondFactor = await verifyBackupCode(data.userId, data.backupCode);
    }

    if (!isValidSecondFactor) {
        throw new AppError('Invalid two-factor token or backup code', 401);
    }

    const user = await userRepository.findById(data.userId);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (!user.active) {
        throw new AppError('User is inactive', 403);
    }

    return createSessionAndTokens(user, metadata);
};

// ======================================================
// LOGIN FLOW #3: Google login
// ======================================================
const loginWithGoogle = async (data, metadata = {}) => {
    const googleUser = await verifyGoogleIdToken(data.idToken);

    let identity = await userIdentityRepository.findByProviderAndProviderUserId(
        AUTH_PROVIDERS.GOOGLE,
        googleUser.googleId
    );

    let user;

    if (identity) {
        user = await userRepository.findById(identity.user_id);
    } else {
        user = await userRepository.findByEmail(googleUser.email);

        if (!user) {
            throw new AppError('User account does not exist', 404);
        }

        const existingGoogleIdentity = await userIdentityRepository.findByUserIdAndProvider(
            user.id,
            AUTH_PROVIDERS.GOOGLE
        );

        if (existingGoogleIdentity) {
            throw new AppError('User already has a Google account linked', 409);
        }

        identity = await userIdentityRepository.create({
            userId: user.id,
            provider: AUTH_PROVIDERS.GOOGLE,
            providerUserId: googleUser.googleId,
            email: googleUser.email
        });
    }

    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (!user.active) {
        throw new AppError('User is inactive', 403);
    }

    return createSessionAndTokens(user, metadata);
};

// ==============================
// Exports
// ==============================
module.exports = {
    login,
    refreshAccessToken,
    logout,
    setupTwoFactor,
    verifyTwoFactorSetup,
    verifyTwoFactorLogin,
    disableTwoFactor,
    loginWithGoogle
};