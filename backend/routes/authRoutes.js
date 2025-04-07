const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST register a new avocat
router.post('/register/avocat', authController.registerAvocat);

// POST register a new client
router.post('/register/client', authController.registerClient);

// POST login for avocat
router.post('/login/avocat', authController.loginAvocat);

// POST login for client
router.post('/login/client', authController.loginClient);

// POST login for admin
router.post('/login/admin', authController.loginAdmin);

module.exports = router;