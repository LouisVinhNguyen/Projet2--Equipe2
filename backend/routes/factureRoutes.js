const express = require("express");
const router = express.Router();
const factureController = require("../controllers/factureController");
const {
  verifyToken,
  verifyAvocatToken,
  verifyClientToken,
  verifyAvocatOrClientToken,
  verifyAdminToken,
  verifyAvocatOrAdminToken,
  verifyAnyUserToken,
} = require("../middleware/authMiddleware");

router.get(
  "/pdf/:id",
  verifyAnyUserToken,
  factureController.generatePdfFacture
);
// GET all invoices
router.get("/", verifyAvocatOrAdminToken, factureController.getAllFactures);

// GET invoice by ID
router.get("/:id", verifyAnyUserToken, factureController.getFactureById);

// GET invoices by client ID
router.get(
  "/client/:clientUserID",
  verifyAnyUserToken,
  factureController.getFacturesByClient
);

// GET invoices by avocat ID
router.get(
  "/avocat/:avocatUserID",
  verifyAnyUserToken,
  factureController.getFactureByAvocatId
);

// POST create a new invoice
router.post("/", verifyAvocatOrAdminToken, factureController.createFacture);

// PUT update an invoice status
router.put(
  "/status/:id",
  verifyAnyUserToken,
  factureController.updateFactureStatus
);

// DELETE an invoice
router.delete(
  "/:id",
  verifyAvocatOrAdminToken,
  factureController.deleteFacture
);

module.exports = router;
