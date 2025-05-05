const express = require("express");
const router = express.Router();
const paiementController = require("../controllers/paiementController");
const {
  verifyToken,
  verifyAvocatToken,
  verifyClientToken,
  verifyAvocatOrClientToken,
  verifyAdminToken,
  verifyAvocatOrAdminToken,
  verifyAnyUserToken,
} = require("../middleware/authMiddleware");

// GET all payments
router.get("/", verifyAvocatOrAdminToken, paiementController.getAllPaiements);

// GET payment by ID
router.get(
  "/:paiementID",
  verifyAnyUserToken,
  paiementController.getPaiementById
);

// GET all payments for a facture
router.get(
  "/facture/:factureID",
  verifyAnyUserToken,
  paiementController.getPaiementsByFacture
);

// GET all payments for a client
router.get(
  "/client/:clientUserID",
  verifyAnyUserToken,
  paiementController.getPaiementsByClient
);

router.get(
  "/historique/client/:clientUserID",
  verifyAnyUserToken,
  paiementController.getPaiementsByClient
);

// POST create a new payment
router.post("/", verifyAnyUserToken, paiementController.createPaiement);

// PUT update a payment status
router.put(
  "/status/:paiementID",
  verifyAnyUserToken,
  paiementController.updatePaiementStatus
);

// DELETE a payment
router.delete(
  "/:paiementID",
  verifyAnyUserToken,
  paiementController.deletePaiement
);

module.exports = router;
