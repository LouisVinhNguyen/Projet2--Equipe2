const express = require('express');
const router = express.Router();
const tacheController = require('../controllers/tacheController');
const { 
    verifyToken,
    verifyAvocatToken, 
    verifyClientToken, 
    verifyAvocatOrClientToken, 
    verifyAdminToken, 
    verifyAvocatOrAdminToken, 
    verifyAnyUserToken
} = require('../middleware/authMiddleware');

// GET all tasks
router.get('/', verifyAvocatOrClientToken, tacheController.getAllTaches);

// GET task by ID
router.get('/:id', verifyAvocatOrClientToken, tacheController.getTacheById);

// POST create a new task
router.post('/', verifyAvocatToken, tacheController.createTache);

// PUT update a task
router.put('/:id', verifyAvocatToken, tacheController.updateTache);

// DELETE a task
router.delete('/:id', verifyAvocatToken, tacheController.deleteTache);

module.exports = router;