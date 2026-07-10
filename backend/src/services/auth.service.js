const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
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

const login = async (data) => {
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

    const token = generateAccessToken(user);

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
        token
    };
};

module.exports = {
    login
};