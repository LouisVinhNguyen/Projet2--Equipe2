const db = require('../config/db');
const procedures = require('../models/procedures/proceduresFacture');

// Get all invoices (factures)
const getAllFactures = async (req, res) => {
  try {
    const factures = await db("facture").select("*");
    res.status(200).json(factures);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des factures.",
      error: error.message,
    });
  }
};

// Get invoice by ID
const getFactureById = async (req, res) => {
  const { id } = req.params;

  try {
    const facture = await db("facture")
      .where({ factureID: id })
      .first();

    if (!facture) {
      return res.status(404).json({ message: "Facture introuvable." });
    }

    res.status(200).json(facture);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération de la facture.",
      error: error.message,
    });
  }
};

const getFactureByClientId = async (req, res) => {
  const { clientUserID } = req.params;

  try {
    const factures = await db("facture")
      .join("dossier", "facture.dossierID", "dossier.dossierID")
      .join("client_dossier", "dossier.dossierID", "client_dossier.dossierID")
      .where("client_dossier.clientUserID", clientUserID)
      .select("facture.*");

    if (factures.length === 0) {
      return res.status(404).json({ message: "Aucune facture trouvée pour ce client." });
    }

    res.status(200).json(factures);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des factures.",
      error: error.message,
    });
  }
}

// Create a new invoice
const createFacture = async (req, res) => {
  const { dossierID, timeWorked, hourlyRate } = req.body;
  
  if (!dossierID || !timeWorked || !hourlyRate) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  try {
    // Use the createFacture function from procedures.js
    const result = await procedures.createFacture(
      dossierID,
      timeWorked,
      hourlyRate
    );

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    
    // Handle specific error messages with appropriate status codes
    if (error.message.includes("ID de dossier inexistant")) {
      return res.status(404).json({ error: "Le dossier spécifié n'existe pas." });
    }
    
    res.status(500).json({
      message: "Erreur lors de la création de la facture.",
      error: error.message,
    });
  }
};

// Update an invoice status
const updateFactureStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // List of allowed status values
  const allowedStatuses = [
    "Non payée",
    "Payée partiellement",
    "Payée",
    "Annulée"
  ];

  // Check if the status is valid
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      error: `Le statut fourni est invalide. Les statuts valides sont : ${allowedStatuses.join(", ")}.`,
    });
  }

  try {
    const existingFacture = await db("facture")
      .where({ factureID: id })
      .first();
    if (!existingFacture) {
      return res.status(404).json({ message: "Facture introuvable." });
    }

    await db("facture")
      .where({ factureID: id })
      .update({ status });
      
    res.status(200).json({ message: "Statut de la facture modifié avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la modification du statut de la facture.",
      error: error.message,
    });
  }
};

// Delete an invoice
const deleteFacture = async (req, res) => {
  const { id } = req.params;

  try {
    const existingFacture = await db("facture")
      .where({ factureID: id })
      .first();
    if (!existingFacture) {
      return res.status(404).json({ message: "Facture introuvable." });
    }

    // Check if there are any payments linked to this invoice
    const payments = await db("paiement").where({ factureID: id });
    if (payments.length > 0) {
      return res.status(400).json({ 
        message: "Impossible de supprimer cette facture car elle a des paiements associés."
      });
    }

    await db("facture").where({ factureID: id }).delete();
    res.status(200).json({ message: "Facture supprimée avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la suppression de la facture.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllFactures,
  getFactureById,
  getFactureByClientId,
  createFacture,
  updateFactureStatus,
  deleteFacture
};