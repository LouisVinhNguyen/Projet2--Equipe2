const db = require('../config/db');
const procedures = require('../models/procedures');

// Get all documents
const getAllDocuments = async (req, res) => {
  try {
    const documents = await db("document").select("*");
    res.status(200).json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des documents.",
      error: error.message,
    });
  }
};

// Get document by ID
const getDocumentById = async (req, res) => {
  const { id } = req.params;

  try {
    const document = await db("document")
      .where({ documentID: id })
      .first();

    if (!document) {
      return res.status(404).json({ message: "Document introuvable." });
    }

    res.status(200).json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération du document.",
      error: error.message,
    });
  }
};

// Create a new document
const createDocument = async (req, res) => {
  const { userID, documentNom, description, fichier, dossierID } = req.body;

  if (!userID || !documentNom || !description || !fichier) {
    return res
      .status(400)
      .json({ error: "Tous les champs sauf dossierID sont requis." });
  }

  try {
    // Use the createDocument function from procedures.js
    const result = await procedures.createDocument(
      userID,
      documentNom,
      description,
      fichier,
      dossierID || null
    );

    res.status(201).json({ documentID: result.documentID });
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
      message: "Erreur lors de la création du document.",
      error: error.message,
    });
  }
};

// Update a document
const updateDocument = async (req, res) => {
  const { id } = req.params;
  const { userID, documentNom, description, fichier } = req.body;

  if (!userID || !documentNom || !description || !fichier) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if document exists
    const existingDocument = await db("document")
      .where({ documentID: id })
      .first();
    if (!existingDocument) {
      return res.status(404).json({ message: "Document introuvable." });
    }

    // Check if the user exists
    const existingUser = await db("users").where({ userID }).first();
    if (!existingUser) {
      return res.status(404).json({ error: "L'utilisateur spécifié n'existe pas." });
    }

    // Check if a document with the same name already exists (excluding the current document)
    const duplicateDocument = await db("document")
      .where({ documentNom })
      .whereNot({ documentID: id })
      .first();
    if (duplicateDocument) {
      return res
        .status(409)
        .json({ error: "Un document avec ce nom existe déjà." });
    }

    // Update the document
    await db("document")
      .where({ documentID: id })
      .update({ 
        userID, 
        documentNom, 
        description, 
        fichier 
      });
    
    res.status(200).json({ message: "Document modifié avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la modification du document.",
      error: error.message,
    });
  }
};

// Delete a document
const deleteDocument = async (req, res) => {
  const { id } = req.params;

  try {
    // Call the deleteDocument function from procedures.js
    const result = await procedures.deleteDocument(id);
    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error(error);
    
    // Handle specific error messages
    if (error.message.includes('Document introuvable')) {
      return res.status(404).json({ message: "Document introuvable." });
    }
    
    res.status(500).json({
      message: "Erreur lors de la suppression du document.",
      error: error.message,
    });
  }
};

// Link a document to a dossier
const linkDocumentToDossier = async (req, res) => {
  const { documentID, dossierID } = req.body;
  
  if (!documentID || !dossierID) {
    return res
      .status(400)
      .json({ error: "Les ID de document et dossier sont requis" });
  }
  
  try {
    const result = await procedures.linkDocumentToDossier(documentID, dossierID);
    res.status(200).json({
      message: "Liaison établie avec succès",
      data: result,
    });
  } catch (error) {
    console.error(error);
    
    // Handle specific errors with appropriate status codes
    if (error.message.includes('ID de document inexistant')) {
      return res.status(404).json({
        message: "Erreur lors de la liaison",
        error: "Le document spécifié n'existe pas."
      });
    } 
    else if (error.message.includes('ID de dossier inexistant')) {
      return res.status(404).json({
        message: "Erreur lors de la liaison",
        error: "Le dossier spécifié n'existe pas."
      });
    }
    else if (error.message.includes('déjà lié')) {
      return res.status(409).json({
        message: "Erreur lors de la liaison",
        error: "Le document est déjà lié à ce dossier."
      });
    }
    
    res.status(500).json({
      message: "Erreur lors de la liaison",
      error: error.message,
    });
  }
};

module.exports = {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  linkDocumentToDossier
};