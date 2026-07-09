const userRepository = require('../repositories/user.repository');
const AppError = require('../errors/AppError');
const {
    validateCreateUserInput,
    validateUpdateUserInput
} = require('../validators/user.validator');

const getAllUsers = async () => {
    return await userRepository.findAll();
};

const getUserById = async (id) => {
    const user = await userRepository.findById(id);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return user;
};

const createUser = async (data) => {
    validateCreateUserInput(data);

    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
        throw new AppError('Email already exists', 409);
    }

    // TODO: replace with bcrypt hash in Auth ticket
    const passwordHash = data.password;

    const userData = {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role
    };

    return await userRepository.create(userData);
};

const updateUser = async (id, data) => {
    validateUpdateUserInput(data);

    const existingUser = await userRepository.findById(id);

    if (!existingUser) {
        throw new AppError('User not found', 404);
    }

    if (data.email !== undefined) {
        const userWithEmail = await userRepository.findByEmail(data.email);

        if (userWithEmail && userWithEmail.id !== Number(id)) {
            throw new AppError('Email already exists', 409);
        }
    }

    const userData = {};

    if (data.name !== undefined) {
        userData.name = data.name;
    }

    if (data.email !== undefined) {
        userData.email = data.email;
    }

    if (data.password !== undefined) {
        // TODO: replace with bcrypt hash in Auth ticket
        userData.passwordHash = data.password;
    }

    if (data.role !== undefined) {
        userData.role = data.role;
    }

    return await userRepository.update(id, userData);
};

const deleteUser = async (id) => {
    const user = await userRepository.deactivate(id);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return user;
};

const activateUser = async (id) => {
    const user = await userRepository.activate(id);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return user;
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    activateUser
};