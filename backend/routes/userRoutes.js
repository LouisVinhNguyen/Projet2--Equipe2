const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { 
    verifyToken,
    verifyAvocatToken, 
    verifyClientToken, 
    verifyAvocatOrClientToken, 
    verifyAdminToken, 
    verifyAvocatOrAdminToken, 
    verifyAnyUserToken
} = require('../middleware/authMiddleware');

// GET check if email exists
router.get('/check-email', userController.checkEmailExists);

// GET all users
router.get('/', verifyAdminToken, userController.getAllUsers);

// GET user by ID
router.get('/:id', verifyAvocatOrClientToken, userController.getUserById);

// POST create a new user
router.post('/', verifyAdminToken, userController.createUser);

// PUT update a user
router.put('/:id', verifyAvocatOrClientToken, userController.updateUser);

// DELETE a user
router.delete('/:id', verifyAdminToken, userController.deleteUser);

// PUT change user password
router.put('/password/:id', verifyAvocatOrClientToken, userController.changePassword);

// GET users by role
router.get('/role/:role', verifyAdminToken, userController.getUsersByRole);

module.exports = router;