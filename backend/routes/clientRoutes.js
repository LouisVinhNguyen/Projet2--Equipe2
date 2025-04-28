const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { 
    verifyToken,
  verifyAvocatToken,
  verifyClientToken,
  verifyAdminToken,
  verifyAvocatOrClientToken,
  verifyAvocatOrAdminToken,
  verifyAnyUserToken
 } = require('../middleware/authMiddleware');

// GET all clients
router.get('/', verifyAvocatOrAdminToken, clientController.getAllClients);

// GET clients by avocat ID
router.get('/avocat/:avocatUserID', verifyAvocatOrAdminToken, clientController.getClientsByAvocatId);

// GET client by ID
router.get('/:id', verifyAnyUserToken, clientController.getClientById);

// PUT update a client
router.put('/:id', verifyAnyUserToken, clientController.updateClient);

// DELETE a client
router.delete('/:id', verifyAnyUserToken, clientController.deleteClient);

// PUT change client password
router.put('/password/:id', verifyClientToken, clientController.changePassword);

// GET client dossiers
router.get('/:id/dossiers', verifyAvocatOrClientToken, clientController.getClientDossiers);

module.exports = router;