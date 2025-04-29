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
router.get('/', verifyAvocatOrAdminToken, sessionController.getAllSessions);

// GET session by ID
router.get('/:id', verifyAvocatOrAdminToken, sessionController.getSessionById);

// GET sessions by Avocat ID
router.get('/avocat/:avocatUserID', verifyAvocatOrAdminToken, sessionController.getSessionByAvocatId);

router.get('/dossier/:dossierID', verifyAvocatOrAdminToken, sessionController.getSessionByDossierId);

// POST create a new session
router.post('/', verifyAvocatOrAdminToken, sessionController.createSession);

// PUT update a session
router.put('/:id', verifyAvocatOrAdminToken, sessionController.updateSession);

// DELETE a session
router.delete('/:id', verifyAvocatOrAdminToken, sessionController.deleteSession);

// POST end a session
router.post('/end/:id', verifyAvocatOrAdminToken, sessionController.endSession);

module.exports = router;