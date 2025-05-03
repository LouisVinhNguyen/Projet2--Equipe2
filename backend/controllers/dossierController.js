const db = require('../config/db');
const procedures = require('../models/procedures/proceduresDossier');

// Get all dossiers
const getAllDossiers = async (req, res) => {
  try {
    const dossiers = await db("dossier").select("*");
    res.status(200).json(dossiers);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des dossiers.",
      error: error.message,
    });
  }
};

// Get dossier by ID
const getDossierById = async (req, res) => {
  const { id } = req.params;

  try {
    const dossier = await db("dossier")
      .where({ dossierID: id })
      .first();

    if (!dossier) {
      return res.status(404).json({ message: "Dossier introuvable." });
    }

    res.status(200).json(dossier);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération du dossier.",
      error: error.message,
    });
  }
};

const getDossierByAvocatId = async (req, res) => {
  const { avocatUserID } = req.params;

  try {
    const dossiers = await db("dossier")
      .where({ avocatUserID })
      .select("*");
      res.status(200).json(dossiers);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des dossiers.",
      error: error.message,
    });
  }
};

// Get dossier by Client ID
const getDossierByClientId = async (req, res) => {
  const { clientUserID } = req.params;
  try {
    // Join client_dossier and dossier to get all dossiers for the client
    const dossiers = await db("client_dossier")
      .where({ clientUserID })
      .join("dossier", "client_dossier.dossierID", "dossier.dossierID")
      .select("dossier.*");
    res.status(200).json(dossiers);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des dossiers du client.",
      error: error.message,
    });
  }
};

// Create a new dossier
const createDossier = async (req, res) => {
  const { avocatUserID, dossierNom, dossierType, description, clientUserID } = req.body;

  if (!avocatUserID || !dossierNom || !dossierType || !description) {
    return res
      .status(400)
      .json({ error: "Tous les champs sauf clientUserID sont requis." });
  }

  try {
    // Use the createDossier function from procedures.js
    const result = await procedures.createDossier(
      avocatUserID,
      dossierNom,
      dossierType,
      description,
      clientUserID || null
    );

    res.status(201).json({ dossierID: result.dossierID });
  } catch (error) {
    console.error(error);
    
    // Handle specific error messages with appropriate status codes
    if (error.message.includes("L'utilisateur spécifié n'existe pas ou n'est pas un avocat")) {
      return res.status(404).json({ error: "L'avocat spécifié n'existe pas." });
    }
    if (error.message.includes("L'utilisateur spécifié n'existe pas ou n'est pas un client")) {
      return res.status(404).json({ error: "Le client spécifié n'existe pas." });
    }
    
    res.status(500).json({
      message: "Erreur lors de la création du dossier.",
      error: error.message,
    });
  }
};

// Update a dossier
const updateDossier = async (req, res) => {
  const { id } = req.params;
  const { avocatUserID, dossierNom, status, dossierType, description, clientUserID } = req.body;

  // List of allowed status values
  const allowedStatuses = [
    "En cours",
    "En attente",
    "Terminé",
    "Annulé",
    "En attente d'approbation",
  ];

  // Check if the status is valid
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      error: `Le statut fourni est invalide. Les statuts valides sont : ${allowedStatuses.join(", ")}.`,
    });
  }

  if (!avocatUserID || !dossierNom || !status || !dossierType || !description) {
    return res
      .status(400)
      .json({ error: "Tous les champs sauf clientUserID sont requis" });
  }

  try {
    // Begin a transaction to ensure data consistency
    await db.transaction(async (trx) => {
      // Check if the dossier exists
      const existingDossier = await trx("dossier")
        .where({ dossierID: id })
        .first();
        
      if (!existingDossier) {
        throw new Error("Dossier introuvable.");
      }

      // Check if the avocatUserID exists
      const existingAvocat = await trx("users")
        .where({ userID: avocatUserID, role: 'avocat' })
        .first();
      if (!existingAvocat) {
        throw new Error("L'avocat spécifié n'existe pas.");
      }

      // Update the dossier table
      await trx("dossier").where({ dossierID: id }).update({
        avocatUserID,
        dossierNom,
        status,
        dossierType,
        description
      });

      // Handle client relationship in client_dossier junction table
      if (clientUserID) {
        // Check if the clientUserID exists
        const existingClient = await trx("users")
          .where({ userID: clientUserID, role: 'client' })
          .first();
        if (!existingClient) {
          throw new Error("Le client spécifié n'existe pas.");
        }

        // Check if relationship already exists
        const existingRelation = await trx("client_dossier")
          .where({ dossierID: id, clientUserID })
          .first();

        if (!existingRelation) {
          // Remove any existing client associations for this dossier first
          await trx("client_dossier").where({ dossierID: id }).delete();
          
          // Add the new client-dossier relationship
          await trx("client_dossier").insert({
            clientUserID,
            dossierID: id
          });
        }
      }
    });

    res.status(200).json({ message: "Dossier modifié avec succès." });
  } catch (error) {
    console.error(error);
    
    // Return appropriate error messages based on error type
    if (error.message === "Dossier introuvable.") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "L'avocat spécifié n'existe pas." || 
        error.message === "Le client spécifié n'existe pas.") {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({
      message: "Erreur lors de la modification du dossier.",
      error: error.message,
    });
  }
};

// Delete a dossier
const deleteDossier = async (req, res) => {
  const { id } = req.params;

  try {
    // First check if the dossier exists
    const existingDossier = await db("dossier")
      .where({ dossierID: id })
      .first();
      
    if (!existingDossier) {
      return res.status(404).json({ message: "Dossier introuvable." });
    }

    // Use a transaction to ensure all related records are properly deleted
    await db.transaction(async (trx) => {
      // Delete related records in client_dossier junction table
      await trx("client_dossier")
        .where({ dossierID: id })
        .delete();
      
      // Delete related records in dossier_document junction table
      await trx("dossier_document")
        .where({ dossierID: id })
        .delete();
        
      // Delete related tasks
      await trx("tache")
        .where({ dossierID: id })
        .delete();
        
      // Delete related sessions
      await trx("session")
        .where({ dossierID: id })
        .delete();
        
      // Delete related invoices
      await trx("facture")
        .where({ dossierID: id })
        .delete();
        
      // Finally delete the dossier itself
      await trx("dossier")
        .where({ dossierID: id })
        .delete();
    });

    res.status(200).json({ message: "Dossier supprimé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la suppression du dossier.",
      error: error.message,
    });
  }
};

// Close a dossier and generate invoice
const closeDossier = async (req, res) => {
  const { id } = req.params;
  try {
    // Ensure all sessions for this dossier are closed
    const activeSessions = await db("session")
      .where({ dossierID: id })
      .andWhere("clockOutTime", null);
      
    if (activeSessions.length > 0) {
      return res.status(400).json({
        message: "Veuillez clôturer toutes les sessions actives avant de fermer le dossier.",
      });
    }

    // Call the closeDossier function from procedures.js
    const result = await procedures.closeDossier(id);
    
    return res.status(200).json({
      message: "Dossier fermé avec succès.",
      totalHours: result.totalHours,
      factureID: result.factureID
    });
  } catch (error) {
    // Check for errors from the function
    if (error.message && error.message.includes("Le dossier est déjà fermé")) {
      return res.status(400).json({ message: "Le dossier est déjà fermé." });
    }
    if (error.message && error.message.includes("n'existe pas")) {
      return res
        .status(404)
        .json({ message: "Le dossier spécifié n'existe pas." });
    }
    console.error(error);
    return res.status(500).json({
      message: "Erreur lors de la fermeture du dossier.",
      error: error.message,
    });
  }
};

// Link a client to a dossier
const linkClientToDossier = async (req, res) => {
  const { clientUserID, dossierID } = req.body;

  if (!clientUserID || !dossierID) {
    return res
      .status(400)
      .json({ error: "ID de client et dossier sont requis" });
  }
  
  try {
    const result = await procedures.linkClientToDossier(clientUserID, dossierID);

    res.status(200).json({
      message: "Le client a été lié au dossier avec succès",
      data: result,
    });
  } catch (error) {
    console.error(error);
    
    // Return appropriate status codes based on the error message
    if (error.message.includes('ID de client inexistant')) {
      return res.status(404).json({
        message: "Erreur lors du lien client-dossier.",
        error: "Le client spécifié n'existe pas."
      });
    } 
    else if (error.message.includes('ID de dossier inexistant')) {
      return res.status(404).json({
        message: "Erreur lors du lien client-dossier.",
        error: "Le dossier spécifié n'existe pas."
      });
    }
    else if (error.message.includes('déjà lié')) {
      return res.status(409).json({
        message: "Erreur lors du lien client-dossier.",
        error: "Le client est déjà lié à ce dossier."
      });
    }
    
    res.status(500).json({
      message: "Erreur lors du lien client-dossier.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllDossiers,
  getDossierById,
  getDossierByAvocatId,
  createDossier,
  updateDossier,
  deleteDossier,
  closeDossier,
  linkClientToDossier,
  getDossierByClientId
};