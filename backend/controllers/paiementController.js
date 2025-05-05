const db = require("../config/db");
const procedures = require("../models/procedures/proceduresPaiement");

async function getAllPaiements(req, res) {
  try {
    const paiements = await db("paiement").select("*");
    res.status(200).json(paiements);
  } catch (error) {
    console.error("Error in getAllPaiements:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des paiements.",
      error: error.message,
    });
  }
}

async function getPaiementById(req, res) {
  const { paiementID } = req.params;
  try {
    const paiement = await db("paiement").where({ paiementID }).first();
    if (!paiement) {
      return res.status(404).json({ message: "Paiement introuvable." });
    }
    res.status(200).json(paiement);
  } catch (error) {
    console.error("Erreur lors de la récupération du paiement:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du paiement." });
  }
}

// Get all payments for a facture
async function getPaiementsByFacture(req, res) {
  try {
    const { factureID } = req.params;
    const paiements = await db("paiement").where({ factureID });
    res.status(200).json(paiements);
  } catch (error) {
    console.error("Erreur lors de la récupération des paiements:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des paiements." });
  }
}
async function getPaiementsByClient(req, res) {
  try {
    const { userID } = req.params;
    const paiements = await db("paiement")
      .join("facture", "paiement.factureID", "facture.factureID")
      .where("facture.clientID", userID)
      .select(
        "paiement.paiementID",
        "paiement.factureID",
        "paiement.montant",
        "paiement.paiementDate",
        "paiement.methode",
        "paiement.status"
      )
      .orderBy("paiement.paiementDate", "desc");

    res.status(200).json(paiements);
  } catch (error) {
    console.error("Erreur lors de la récupération des paiements:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des paiements.",
      error: error.message,
    });
  }
}

// Get all payments for a client (via client_dossier and facture)
async function getPaiementsByClient(req, res) {
  try {
    const { clientUserID } = req.params;
    console.log("Client ID reçu :", clientUserID);

    const paiements = await db("paiement")
      .join("facture", "paiement.factureID", "facture.factureID")
      .join("dossier", "facture.dossierID", "dossier.dossierID")
      .join("client_dossier", "dossier.dossierID", "client_dossier.dossierID")
      .where("client_dossier.clientUserId", clientUserID)
      .select("paiement.*");

    res.status(200).json(paiements);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des paiements du client:",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des paiements du client.",
    });
  }
}

// Update payment status
async function updatePaiementStatus(paiementID, status) {
  try {
    const allowedStatuses = [
      "En attente",
      "Terminé",
      "Échoué",
      "Remboursé",
      "Annulé",
    ];
    if (!allowedStatuses.includes(status)) {
      throw new Error(
        `Statut de paiement invalide. Statuts valides: ${allowedStatuses.join(
          ", "
        )}`
      );
    }
    const paiement = await db("paiement").where({ paiementID }).first();
    if (!paiement) {
      throw new Error("Paiement introuvable.");
    }
    await db("paiement").where({ paiementID }).update({ status });
    return { message: "Statut du paiement mis à jour." };
  } catch (error) {
    console.error("Error in updatePaiementStatus:", error);
    throw new Error(
      `Échec de mise à jour du statut du paiement: ${error.message}`
    );
  }
}

// Create a new payment
const createPaiement = async (req, res) => {
  console.error("DEBUG: Received POST /paiement", req.body); // Debug log
  const { factureID, montant, paiementDate, methode, status } = req.body;

  // List of allowed status values
  const allowedStatuses = [
    "En attente",
    "Terminé",
    "Échoué",
    "Remboursé",
    "Annulé",
  ];

  // Check if the status is valid
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      error: `Le statut fourni est invalide. Les statuts valides sont : ${allowedStatuses.join(
        ", "
      )}.`,
    });
  }

  if (!factureID || !montant || !paiementDate || !methode || !status) {
    console.error("DEBUG: Missing required fields", {
      factureID,
      montant,
      paiementDate,
      methode,
      status,
    });
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  try {
    // Use the createPaiement function from proceduresPaiement.js
    const result = await procedures.createPaiement(
      factureID,
      montant,
      paiementDate,
      methode,
      status
    );
    console.error("DEBUG: Paiement created successfully", result); // Debug log
    res.status(201).json({ paiementID: result.paiementID });
  } catch (error) {
    console.error("DEBUG: Error in createPaiement", error);
    if (error.message.includes("Facture introuvable")) {
      return res
        .status(404)
        .json({ error: "La facture spécifiée n'existe pas." });
    }
    res.status(500).json({
      message: "Erreur lors de la création du paiement.",
      error: error.message,
    });
  }
};

// Delete a payment
async function deletePaiement(paiementID) {
  try {
    const paiement = await db("paiement").where({ paiementID }).first();
    if (!paiement) {
      throw new Error("Paiement introuvable.");
    }
    await db("paiement").where({ paiementID }).del();
    return { message: "Paiement supprimé avec succès." };
  } catch (error) {
    console.error("Error in deletePaiement:", error);
    throw new Error(`Échec de suppression du paiement: ${error.message}`);
  }
}

module.exports = {
  getAllPaiements,
  getPaiementById,
  getPaiementsByFacture,
  getPaiementsByClient,
  updatePaiementStatus,
  createPaiement,
  deletePaiement,
  getPaiementsByClient,
};
