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
router.get('/', verifyAvocatOrClientToken, factureController.getAllFactures);

// GET invoice by ID
router.get('/:id', verifyAvocatOrClientToken, factureController.getFactureById);

// POST create a new invoice
router.post('/', verifyAvocatToken, factureController.createFacture);

// PUT update an invoice status
router.put('/status/:id', verifyAvocatToken, factureController.updateFactureStatus);

// DELETE an invoice
router.delete('/:id', verifyAvocatToken, factureController.deleteFacture);

module.exports = router;