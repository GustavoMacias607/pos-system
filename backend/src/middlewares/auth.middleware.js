const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const AppError = require('../errors/AppError');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new AppError('Authorization token is required', 401);
        }

        const [type, token] = authHeader.split(' ');

        if (type !== 'Bearer' || !token) {
            throw new AppError('Invalid authorization format', 401);
        }

        let decoded;
        if (!process.env.JWT_SECRET) {
            throw new AppError('JWT secret is not configured', 500);
        }
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new AppError('Invalid or expired token', 401);
        }

        const user = await userRepository.findById(decoded.id);

        if (!user) {
            throw new AppError('User not found', 401);
        }

        if (!user.active) {
            throw new AppError('User is inactive', 403);
        }

        req.user = user;

        next();
    } catch (error) {
        next(error);
    }
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            if (!allowedRoles.includes(req.user.role)) {
                throw new AppError('You do not have permission to perform this action', 403);
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    authenticate,
    authorizeRoles

};