const db = require('../config/db');
const procedures = require('../models/procedures');
const { validateEmail, validateTelephone } = require('../utils/validators');
const bcrypt = require('bcrypt');

// Get all avocats
const getAllAvocats = async (req, res) => {
  try {
    const avocats = await db("users").where({ role: 'avocat' }).select("*");
    res.status(200).json(avocats);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des avocats.",
      error: error.message,
    });
  }
};

// Get avocat by ID
const getAvocatById = async (req, res) => {
  const { id } = req.params;

  try {
    const avocat = await db("users")
      .where({ userID: id, role: 'avocat' })
      .first();

    if (!avocat) {
      return res.status(404).json({ message: "Avocat introuvable." });
    }

    // Remove sensitive information
    delete avocat.password;
    
    res.status(200).json(avocat);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération de l'avocat.",
      error: error.message,
    });
  }
};

// Update an avocat
const updateAvocat = async (req, res) => {
  const { id } = req.params;
  const { prenom, nom, email, telephone } = req.body;

  if (!prenom || !nom || !email || !telephone) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Format d'email invalide" });
  }

  if (!validateTelephone(telephone)) {
    return res.status(400).json({ error: "Format de téléphone invalide" });
  }

  try {
    // Check if the avocat exists
    const existingAvocat = await db("users")
      .where({ userID: id, role: 'avocat' })
      .first();
      
    if (!existingAvocat) {
      return res.status(404).json({ message: "Avocat introuvable." });
    }

    // Check if email is already in use by another user
    const duplicateEmail = await db("users")
      .where({ email })
      .whereNot({ userID: id })
      .first();
      
    if (duplicateEmail) {
      return res.status(409).json({ message: "Cet email est déjà utilisé." });
    }

    // Update the avocat
    await db("users")
      .where({ userID: id, role: 'avocat' })
      .update({ prenom, nom, email, telephone });
      
    res.status(200).json({ message: "Avocat modifié avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la modification de l'avocat.",
      error: error.message,
    });
  }
};

// Delete an avocat
const deleteAvocat = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the avocat exists
    const existingAvocat = await db("users")
      .where({ userID: id, role: 'avocat' })
      .first();
      
    if (!existingAvocat) {
      return res.status(404).json({ message: "Avocat introuvable." });
    }

    // Check if the avocat has any related dossiers
    const relatedDossiers = await db("dossier").where({ avocatUserID: id });
    if (relatedDossiers.length > 0) {
      return res.status(400).json({ 
        message: "Impossible de supprimer l'avocat car il est associé à des dossiers existants." 
      });
    }

    // Delete the avocat
    await db("users").where({ userID: id, role: 'avocat' }).delete();
    res.status(200).json({ message: "Avocat supprimé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la suppression de l'avocat.",
      error: error.message,
    });
  }
};

// Change avocat password
const changePassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Mot de passe actuel et nouveau sont requis" });
  }

  try {
    // Check if the avocat exists
    const avocat = await db("users")
      .where({ userID: id, role: 'avocat' })
      .first();
      
    if (!avocat) {
      return res.status(404).json({ message: "Avocat introuvable." });
    }

    // Verify the current password
    const isMatch = await bcrypt.compare(currentPassword, avocat.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe actuel incorrect." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    await db("users")
      .where({ userID: id, role: 'avocat' })
      .update({ password: hashedPassword });
      
    res.status(200).json({ message: "Mot de passe modifié avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la modification du mot de passe.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllAvocats,
  getAvocatById,
  updateAvocat,
  deleteAvocat,
  changePassword
};