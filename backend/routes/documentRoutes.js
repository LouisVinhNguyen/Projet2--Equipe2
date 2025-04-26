const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { verifyAvocatToken, verifyAvocatOrClientToken } = require('../middleware/authMiddleware');

// GET all documents
router.get('/', verifyAvocatOrClientToken, documentController.getAllDocuments);

// GET document by ID
router.get('/:id', verifyAvocatOrClientToken, documentController.getDocumentById);

// POST create a new document
router.post('/', verifyAvocatToken, documentController.createDocument);

// PUT update a document
router.put('/:id', verifyAvocatToken, documentController.updateDocument);

// DELETE a document
router.delete('/:id', verifyAvocatToken, documentController.deleteDocument);

// POST link document to dossier
router.post('/link-dossier', verifyAvocatToken, documentController.linkDocumentToDossier);

router.get('/byDossier/:dossierID', verifyAvocatToken, documentController.getDocumentByDossierID);


module.exports = router;