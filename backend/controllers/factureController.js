const db = require("../config/db");
const procedures = require("../models/procedures/proceduresFacture");
const PDFDocument = require("pdfkit");

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
    const facture = await db("facture").where({ factureID: id }).first();

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

const getFactureByAvocatId = async (req, res) => {
  const { avocatUserID } = req.params;
  try {
    const factures = await db("facture")
      .join("dossier", "facture.dossierID", "dossier.dossierID")
      .join("users", "dossier.avocatUserID", "users.userID")
      .where("dossier.avocatUserID", avocatUserID)
      .select(
        "facture.*",
        "users.nom as avocatNom",
        "users.prenom as avocatPrenom",
        "dossier.dossierNom",
        "dossier.dossierType"
      );
    res.status(200).json(factures);
  } catch (error) {
    console.error("Erreur lors de la récupération des factures :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des factures." });
  }
};

const getFacturesByClient = async (req, res) => {
  const { clientUserID } = req.params;

  try {
    const factures = await db("facture")
      .join("dossier", "facture.dossierID", "dossier.dossierID")
      .join("client_dossier", "dossier.dossierID", "client_dossier.dossierID")
      .join("users", "client_dossier.clientUserID", "users.userID") // Assure-toi que la table s'appelle bien 'users'
      .where("client_dossier.clientUserID", clientUserID)
      .select(
        "facture.*",
        "users.nom as clientNom",
        "users.prenom as clientPrenom"
      );

    res.status(200).json(factures);
  } catch (error) {
    console.error("Erreur lors de la récupération des factures :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des factures." });
  }
};

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
      return res
        .status(404)
        .json({ error: "Le dossier spécifié n'existe pas." });
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
  const { status, montantPaye } = req.body; // ← ajouter montantPaye
  const user = req.user;

  const allowedStatuses = [
    "Non payée",
    "Partiellement payée",
    "Payée",
    "En retard",
    "Annulée",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      error: `Le statut fourni est invalide. Les statuts valides sont : ${allowedStatuses.join(
        ", "
      )}`,
    });
  }

  try {
    const existingFacture = await db("facture")
      .where({ factureID: id })
      .first();
    if (!existingFacture) {
      return res.status(404).json({ message: "Facture introuvable." });
    }

    // Restrictions client
    if (user.role === "client") {
      if (status === "Annulée") {
        return res.status(403).json({
          error: "Interdit : un client ne peut pas annuler une facture.",
        });
      }

      if (!["Payée", "Partiellement payée"].includes(status)) {
        return res.status(403).json({
          error: "Interdit : un client ne peut définir ce statut.",
        });
      }
    }

    // 💸 Nouveau montant si paiement partiel
    const updateData = { status };

    if (status === "Partiellement payée" && montantPaye) {
      const nouveauMontant = existingFacture.montant - parseFloat(montantPaye);
      if (nouveauMontant < 0) {
        return res.status(400).json({ error: "Montant payé trop élevé." });
      }
      updateData.montant = nouveauMontant;
    }

    await db("facture").where({ factureID: id }).update(updateData);

    res
      .status(200)
      .json({ message: "Statut (et montant) de la facture mis à jour." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour de la facture.",
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
        message:
          "Impossible de supprimer cette facture car elle a des paiements associés.",
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
const generatePdfFacture = async (req, res) => {
  const { id } = req.params;

  try {
    const facture = await db("facture").where({ factureID: id }).first();
    if (!facture) {
      return res.status(404).send("Facture introuvable.");
    }

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=facture_${id}.pdf`);
    doc.pipe(res);

    doc
      .fontSize(18)
      .text("Facture LégalConnect", { align: "center" })
      .moveDown();
    doc.fontSize(12).text(`Facture ID : ${facture.factureID}`);
    doc.text(`Dossier ID : ${facture.dossierID}`);
    doc.text(`Montant : $${facture.montant.toFixed(2)}`);
    doc.text(`Statut : ${facture.status}`);
    doc.text(`Date : ${new Date(facture.dateCreated).toLocaleDateString()}`);

    doc.end();
  } catch (error) {
    console.error("Erreur PDF :", error);
    res.status(500).send("Erreur lors de la génération du PDF.");
  }
};
module.exports = {
  getAllFactures,
  getFactureById,
  getFactureByAvocatId,
  getFacturesByClient,
  createFacture,
  updateFactureStatus,
  deleteFacture,
  generatePdfFacture,
};
