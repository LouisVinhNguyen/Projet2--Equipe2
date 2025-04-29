const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { 
    verifyToken,
    verifyAvocatToken, 
    verifyClientToken, 
    verifyAvocatOrClientToken, 
    verifyAdminToken, 
    verifyAvocatOrAdminToken, 
    verifyAnyUserToken
} = require('../middleware/authMiddleware');

// GET all admins
router.get('/', verifyAdminToken, adminController.getAllAdmins);

// GET admin by ID
router.get('/:id', verifyAdminToken, adminController.getAdminById);

// PUT update an admin
router.put('/:id', verifyAdminToken, adminController.updateAdmin);

// DELETE an admin
router.delete('/:id', verifyAdminToken, adminController.deleteAdmin);

// PUT change admin password
router.put('/password/:id', verifyAdminToken, adminController.changePassword);

// GET system statistics for admin dashboard
router.get('/stats/system', verifyAdminToken, adminController.getSystemStats);


// --- Nouvelles Routes Reporting & Analytics ---

// Total Clients
router.get('/stats/total-clients', verifyAdminToken, adminController.getTotalClients);

// Total Dossiers
router.get('/stats/total-dossiers', verifyAdminToken, adminController.getTotalDossiers);

// Total Paiements
router.get('/stats/total-paiements', verifyAdminToken, adminController.getTotalPaiements);

// Dossiers par Mois
router.get('/stats/dossiers-par-mois', verifyAdminToken, adminController.getDossiersParMois);

// Dossiers Ouverts
router.get('/stats/dossiers-ouverts', verifyAdminToken, adminController.getDossiersOuverts);


module.exports = router;
