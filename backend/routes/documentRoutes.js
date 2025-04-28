const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { 
    verifyToken,
    verifyAvocatToken, 
    verifyClientToken, 
    verifyAvocatOrClientToken, 
    verifyAdminToken, 
    verifyAvocatOrAdminToken, 
    verifyAnyUserToken
} = require('../middleware/authMiddleware');

// GET all documents
router.get('/', verifyAnyUserToken, documentController.getAllDocuments);

// GET document by ID
router.get('/:id', verifyAnyUserToken, documentController.getDocumentById);

// POST create a new document
router.post('/', verifyAvocatOrAdminToken, documentController.createDocument);

// PUT update a document
router.put('/:id', verifyAvocatOrAdminToken, documentController.updateDocument);

// DELETE a document
router.delete('/:id', verifyAvocatOrAdminToken, documentController.deleteDocument);

// POST link document to dossier
router.post('/link-dossier', verifyAvocatToken, documentController.linkDocumentToDossier);

router.get('/byDossier/:dossierID', verifyAvocatOrAdminToken, documentController.getDocumentByDossierID);


module.exports = router;