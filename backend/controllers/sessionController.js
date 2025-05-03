const db = require('../config/db');
const procedures = require('../models/procedures/proceduresSession');
const { formatTempsTotal } = require('../utils/formatters');

// Get all sessions
const getAllSessions = async (req, res) => {
  try {
    const sessions = await db("session").select("*");
    const formatted = sessions.map(s => ({
      ...s,
      tempsTotal: formatTempsTotal(s.tempsTotal)
    }));
    res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des sessions.",
      error: error.message,
    });
  }
};

// Get session by ID
const getSessionById = async (req, res) => {
  const { id } = req.params;

  try {
    const session = await db("session")
      .where({ sessionID: id })
      .first();

    if (!session) {
      return res.status(404).json({ message: "Session introuvable." });
    }

    res.status(200).json({
      ...session,
      tempsTotal: formatTempsTotal(session.tempsTotal)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération de la session.",
      error: error.message,
    });
  }
};

const getSessionByAvocatId = async (req, res) => {
  const { avocatUserID } = req.params;

  try {
    const sessions = await db("session")
      .join("dossier", "session.dossierID", "dossier.dossierID")
      .where("dossier.avocatUserID", avocatUserID)
      .select("session.*");

    const formatted = sessions.map(s => ({
      ...s,
      tempsTotal: formatTempsTotal(s.tempsTotal)
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des sessions.",
      error: error.message,
    });
  }
};

const getSessionByDossierId = async (req, res) => {
  const { dossierID } = req.params;

  try {
    const sessions = await db("session")
      .where({ dossierID })
      .select("*");

    const formatted = sessions.map(s => ({
      ...s,
      tempsTotal: formatTempsTotal(s.tempsTotal)
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des sessions.",
      error: error.message,
    });
  }
};

// Create a new session
const createSession = async (req, res) => {
  const { userID, dossierID, description } = req.body;

  if (!userID || !dossierID || !description) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  try {
    // Use the createSession function from procedures.js
    const result = await procedures.createSession(
      userID,
      dossierID, 
      description
    );

    res.status(201).json({ sessionID: result.sessionID });
  } catch (error) {
    console.error(error);
    
    // Handle specific error messages with appropriate status codes
    if (error.message.includes("L'utilisateur spécifié n'existe pas")) {
      return res.status(404).json({ error: "L'utilisateur spécifié n'existe pas." });
    }
    if (error.message.includes("Le dossier spécifié n'existe pas")) {
      return res.status(404).json({ error: "Le dossier spécifié n'existe pas." });
    }
    if (error.message.includes("Une session active existe déjà")) {
      return res.status(400).json({ error: "Une session active existe déjà pour cet utilisateur et ce dossier." });
    }
    
    
    res.status(500).json({
      message: "Erreur lors de la création de la session.",
      error: error.message,
    });
  }
};

// Update a session
const updateSession = async (req, res) => {
  const { id } = req.params;
  const { userID, dossierID, description } = req.body;

  if (!userID || !dossierID || !description) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  try {
    const existingSession = await db("session")
      .where({ sessionID: id })
      .first();
    if (!existingSession) {
      return res.status(404).json({ message: "Session introuvable." });
    }

    // Check if the user exists
    const existingUser = await db("users").where({ userID }).first();
    if (!existingUser) {
      return res.status(404).json({ error: "L'utilisateur spécifié n'existe pas." });
    }

    // Check if the dossier exists
    const existingDossier = await db("dossier").where({ dossierID }).first();
    if (!existingDossier) {
      return res.status(404).json({ error: "Le dossier spécifié n'existe pas." });
    }

    // Check if the session is already ended
    if (existingSession.clockOutTime) {
      return res.status(400).json({ message: "Impossible de modifier une session clôturée." });
    }

    await db("session")
      .where({ sessionID: id })
      .update({ userID, dossierID, description });
    res.status(200).json({ message: "Session modifiée avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la modification de la session.",
      error: error.message,
    });
  }
};

// Delete a session
const deleteSession = async (req, res) => {
  const { id } = req.params;

  try {
    const existingSession = await db("session")
      .where({ sessionID: id })
      .first();
    if (!existingSession) {
      return res.status(404).json({ message: "Session introuvable." });
    }

    await db("session").where({ sessionID: id }).delete();
    res.status(200).json({ message: "Session supprimée avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la suppression de la session.",
      error: error.message,
    });
  }
};

// End a session
const endSession = async (req, res) => {
  const { id } = req.params;

  try {
    // Use the endSession function from procedures.js
    const updatedSession = await procedures.endSession(id);

    return res.status(200).json({
      message: "Session clôturée avec succès.",
      session: updatedSession,
    });
  } catch (error) {
    // Handle specific error cases with appropriate status codes
    if (error.message.includes('déjà terminée')) {
      return res.status(400).json({ message: "Cette session a déjà été clôturée." });
    }
    if (error.message.includes('ID de session inexistant')) {
      return res.status(404).json({ message: "Session introuvable." });
    }
    console.error(error);
    return res.status(500).json({
      message: "Erreur lors de la clôture de la session.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllSessions,
  getSessionById,
  getSessionByAvocatId,
  getSessionByDossierId,
  createSession,
  updateSession,
  deleteSession,
  endSession
};