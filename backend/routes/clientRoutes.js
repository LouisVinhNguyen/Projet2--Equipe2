const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { verifyAvocatToken, verifyClientToken, verifyAvocatOrClientToken } = require('../middleware/authMiddleware');

// GET all clients
router.get('/', verifyAvocatToken, clientController.getAllClients);

// GET client by ID
router.get('/:id', verifyAvocatOrClientToken, clientController.getClientById);

// PUT update a client
router.put('/:id', verifyAvocatOrClientToken, clientController.updateClient);

// DELETE a client
router.delete('/:id', verifyAvocatToken, clientController.deleteClient);

// PUT change client password
router.put('/password/:id', verifyClientToken, clientController.changePassword);

// GET client dossiers
router.get('/:id/dossiers', verifyAvocatOrClientToken, clientController.getClientDossiers);

module.exports = router;