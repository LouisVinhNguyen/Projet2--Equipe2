const db = require('../config/db');
const procedures = require('../models/procedures/proceduresTache');

// Get all tasks
const getAllTaches = async (req, res) => {
  try {
    const taches = await db("tache").select("*");
    res.status(200).json(taches);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des tâches.",
      error: error.message,
    });
  }
};

// Get task by ID
const getTacheById = async (req, res) => {
  const { id } = req.params;

  try {
    const tache = await db("tache")
      .where({ tacheID: id })
      .first();

    if (!tache) {
      return res.status(404).json({ message: "Tâche introuvable." });
    }

    res.status(200).json(tache);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération de la tâche.",
      error: error.message,
    });
  }
};

// Create a new task
const createTache = async (req, res) => {
  const { userID, dossierID, documentNom, description, status } = req.body;

  // List of allowed status values
  const allowedStatuses = [
    "Non commencée",
    "En cours",
    "Terminée",
    "Bloquée",
    "Annulée",
  ];

  // Check if the status is valid
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      error: `Le statut fourni est invalide. Les statuts valides sont : ${allowedStatuses.join(", ")}.`,
    });
  }

  if (!userID || !dossierID || !documentNom || !description || !status) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  try {
    // Use the createTache function from procedures.js
    const result = await procedures.createTache(
      userID,
      dossierID,
      documentNom,
      description,
      status
    );

    res.status(201).json({ tacheID: result.tacheID });
  } catch (error) {
    console.error(error);
    
    // Handle specific error messages with appropriate status codes
    if (error.message.includes("L'utilisateur spécifié n'existe pas")) {
      return res.status(404).json({ error: "L'utilisateur spécifié n'existe pas." });
    }
    if (error.message.includes("Le dossier spécifié n'existe pas")) {
      return res.status(404).json({ error: "Le dossier spécifié n'existe pas." });
    }
    
    res.status(500).json({
      message: "Erreur lors de la création de la tâche.",
      error: error.message,
    });
  }
};

// Update a task
const updateTache = async (req, res) => {
  const { id } = req.params;
  const { userID, dossierID, documentNom, description, status } = req.body;

  // List of allowed status values
  const allowedStatuses = [
    "Non commencée",
    "En cours",
    "Terminée",
    "Bloquée",
    "Annulée",
  ];

  // Check if the status is valid
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      error: `Le statut fourni est invalide. Les statuts valides sont : ${allowedStatuses.join(", ")}.`,
    });
  }

  if (!userID || !dossierID || !documentNom || !description || !status) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  try {
    // Use the updateTache function from procedures.js
    const result = await procedures.updateTache(
      id,
      userID,
      dossierID,
      documentNom,
      description,
      status
    );
    
    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error(error);
    
    // Handle specific error messages with appropriate status codes
    if (error.message.includes('Tâche introuvable')) {
      return res.status(404).json({ message: "Tâche introuvable." });
    }
    if (error.message.includes('L\'utilisateur spécifié n\'existe pas')) {
      return res.status(404).json({ error: "L'utilisateur spécifié n'existe pas." });
    }
    if (error.message.includes('Le dossier spécifié n\'existe pas')) {
      return res.status(404).json({ error: "Le dossier spécifié n'existe pas." });
    }
    
    res.status(500).json({
      message: "Erreur lors de la modification de la tâche.",
      error: error.message,
    });
  }
};

// Delete a task
const deleteTache = async (req, res) => {
  const { id } = req.params;

  try {
    const existingTache = await db("tache").where({ tacheID: id }).first();
    if (!existingTache) {
      return res.status(404).json({ message: "Tâche introuvable." });
    }

    await db("tache").where({ tacheID: id }).delete();
    res.status(200).json({ message: "Tâche supprimée avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la suppression de la tâche.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllTaches,
  getTacheById,
  createTache,
  updateTache,
  deleteTache
};