const express = require('express');
const router = express.Router();
const factureController = require('../controllers/factureController');
const { 
    verifyToken,
    verifyAvocatToken, 
    verifyClientToken, 
    verifyAvocatOrClientToken, 
    verifyAdminToken, 
    verifyAvocatOrAdminToken, 
    verifyAnyUserToken
} = require('../middleware/authMiddleware');

// GET all invoices
router.get('/', verifyAvocatOrAdminToken, factureController.getAllFactures);

// GET invoice by ID
router.get('/:id', verifyAnyUserToken, factureController.getFactureById);

// GET invoices by client ID
router.get('/client/:clientUserID', verifyAnyUserToken, factureController.getFactureByClientId);

// POST create a new invoice
router.post('/', verifyAvocatOrAdminToken, factureController.createFacture);

// PUT update an invoice status
router.put('/status/:id', verifyAvocatOrAdminToken, factureController.updateFactureStatus);

// DELETE an invoice
router.delete('/:id', verifyAvocatOrAdminToken, factureController.deleteFacture);

module.exports = router;