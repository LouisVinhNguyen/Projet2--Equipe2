const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { 
    verifyToken,
    verifyAvocatToken, 
    verifyClientToken, 
    verifyAvocatOrClientToken, 
    verifyAdminToken, 
    verifyAvocatOrAdminToken, 
    verifyAnyUserToken
} = require('../middleware/authMiddleware');

// GET all sessions
router.get('/', verifyAvocatToken, sessionController.getAllSessions);

// GET session by ID
router.get('/:id', verifyAvocatToken, sessionController.getSessionById);

// POST create a new session
router.post('/', verifyAvocatToken, sessionController.createSession);

// PUT update a session
router.put('/:id', verifyAvocatToken, sessionController.updateSession);

// DELETE a session
router.delete('/:id', verifyAvocatToken, sessionController.deleteSession);

// POST end a session
router.post('/end/:id', verifyAvocatToken, sessionController.endSession);

module.exports = router;