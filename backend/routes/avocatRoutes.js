const express = require('express');
const router = express.Router();
const avocatController = require('../controllers/avocatController');
const { 
    verifyToken,
    verifyAvocatToken, 
    verifyClientToken, 
    verifyAvocatOrClientToken, 
    verifyAdminToken, 
    verifyAvocatOrAdminToken, 
    verifyAnyUserToken
} = require('../middleware/authMiddleware');

// GET all avocats
router.get('/', verifyAdminToken, avocatController.getAllAvocats);

// GET avocat by ID
router.get('/:id', verifyAvocatToken, avocatController.getAvocatById);

// PUT update an avocat
router.put('/:id', verifyAvocatToken, avocatController.updateAvocat);

// DELETE an avocat
router.delete('/:id', verifyAdminToken, avocatController.deleteAvocat);

// PUT change avocat password
router.put('/password/:id', verifyAvocatToken, avocatController.changePassword);

module.exports = router;