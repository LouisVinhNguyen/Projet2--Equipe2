const express = require('express');
const router = express.Router();
const dossierController = require('../controllers/dossierController');
const { verifyAvocatToken, verifyAvocatOrClientToken } = require('../middleware/authMiddleware');

// GET all dossiers
router.get('/', verifyAvocatToken, dossierController.getAllDossiers);

// GET dossier by ID
router.get('/:id', verifyAvocatOrClientToken, dossierController.getDossierById);

// POST create a new dossier
router.post('/', verifyAvocatToken, dossierController.createDossier);

// PUT update a dossier
router.put('/:id', verifyAvocatToken, dossierController.updateDossier);

// DELETE a dossier
router.delete('/:id', verifyAvocatToken, dossierController.deleteDossier);

// POST close a dossier
router.post('/close/:id', verifyAvocatToken, dossierController.closeDossier);

// POST link client to dossier
router.post('/link-client', verifyAvocatToken, dossierController.linkClientToDossier);

module.exports = router;