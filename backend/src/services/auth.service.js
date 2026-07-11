const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/user.repository');
const userSessionRepository = require('../repositories/userSession.repository');
const AppError = require('../errors/AppError');
const { validateLoginInput } = require('../validators/auth.validator');

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
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            active: user.active,
            created_at: user.created_at,
            updated_at: user.updated_at
        },
        accessToken,
        refreshToken
    };
};

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

    const accessToken = generateAccessToken(user);

    return {
        accessToken
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

module.exports = {
    login,
    refreshAccessToken,
    logout
};