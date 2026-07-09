const userService = require('../services/user.service');
const asyncHandler = require('../utils/asyncHandler');

const getUsers = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers();

    res.json({
        success: true,
        data: users
    });
});

const getUser = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);

    res.json({
        success: true,
        data: user
    });
});

const createUser = asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body);

    res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
    });
});

const updateUser = asyncHandler(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);

    res.json({
        success: true,
        data: user,
        message: 'User updated successfully'
    });
});

const deleteUser = asyncHandler(async (req, res) => {
    const result = await userService.deleteUser(req.params.id);

    res.json({
        success: true,
        data: result,
        message: 'User deactivated successfully'
    });
});

const activateUser = asyncHandler(async (req, res) => {
    const result = await userService.activateUser(req.params.id);

    res.json({
        success: true,
        data: result,
        message: 'User activated successfully'
    });
});
module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUser,
    activateUser,
    deleteUser
};