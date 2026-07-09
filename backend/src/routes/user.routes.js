const express = require('express');
const userController = require('../controllers/user.controller');
const {
    validateCreateUserData,
    validateUpdateUserData
} = require('../middlewares/userValidation.middleware');

const router = express.Router();

router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.post('/', validateCreateUserData, userController.createUser);
router.put('/:id', validateUpdateUserData, userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.patch('/:id/activate', userController.activateUser);

module.exports = router;