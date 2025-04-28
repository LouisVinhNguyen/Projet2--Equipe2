const express = require('express');
const router = express.Router();
const dossierController = require('../controllers/dossierController');
const { 
    verifyToken,
    verifyAvocatToken, 
    verifyClientToken, 
    verifyAvocatOrClientToken, 
    verifyAdminToken, 
    verifyAvocatOrAdminToken, 
    verifyAnyUserToken
} = require('../middleware/authMiddleware');

// GET all dossiers
router.get('/', verifyAvocatOrAdminToken, dossierController.getAllDossiers);

// GET dossier by ID
router.get('/:id', verifyAnyUserToken, dossierController.getDossierById);

// GET dossiers by avocat ID
router.get('/avocat/:avocatUserID', verifyAvocatToken, dossierController.getDossierByAvocatId);

// POST create a new dossier
router.post('/', verifyAvocatOrAdminToken, dossierController.createDossier);

// PUT update a dossier
router.put('/:id', verifyAvocatOrAdminToken, dossierController.updateDossier);

// DELETE a dossier
router.delete('/:id', verifyAvocatOrAdminToken, dossierController.deleteDossier);

// POST close a dossier
router.post('/close/:id', verifyAvocatOrAdminToken, dossierController.closeDossier);

// POST link client to dossier
router.post('/link-client', verifyAvocatToken, dossierController.linkClientToDossier);

module.exports = router;