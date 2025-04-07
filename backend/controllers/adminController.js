// filepath: c:\Users\Home\Desktop\School\Cegep\Session Hiver 2025\Projet2--Equipe2\backend\controllers\adminController.js
const db = require('../config/db');
const procedures = require('../models/procedures');
const { validateEmail, validateTelephone } = require('../utils/validators');
const bcrypt = require('bcrypt');

// Get all admins
const getAllAdmins = async (req, res) => {
  try {
    const admins = await db("users").where({ role: 'admin' }).select("*");
    
    // Remove sensitive information
    admins.forEach(admin => delete admin.password);
    
    res.status(200).json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des administrateurs.",
      error: error.message,
    });
  }
};

// Get admin by ID
const getAdminById = async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await db("users")
      .where({ userID: id, role: 'admin' })
      .first();

    if (!admin) {
      return res.status(404).json({ message: "Administrateur introuvable." });
    }

    // Remove sensitive information
    delete admin.password;
    
    res.status(200).json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération de l'administrateur.",
      error: error.message,
    });
  }
};

// Update an admin
const updateAdmin = async (req, res) => {
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
    // Check if the admin exists
    const existingAdmin = await db("users")
      .where({ userID: id, role: 'admin' })
      .first();
      
    if (!existingAdmin) {
      return res.status(404).json({ message: "Administrateur introuvable." });
    }

    // Check if email is already in use by another user
    const duplicateEmail = await db("users")
      .where({ email })
      .whereNot({ userID: id })
      .first();
      
    if (duplicateEmail) {
      return res.status(409).json({ message: "Cet email est déjà utilisé." });
    }

    // Update the admin
    await db("users")
      .where({ userID: id, role: 'admin' })
      .update({ prenom, nom, email, telephone });
      
    res.status(200).json({ message: "Administrateur modifié avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la modification de l'administrateur.",
      error: error.message,
    });
  }
};

// Delete an admin
const deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the admin exists
    const existingAdmin = await db("users")
      .where({ userID: id, role: 'admin' })
      .first();
      
    if (!existingAdmin) {
      return res.status(404).json({ message: "Administrateur introuvable." });
    }

    // Prevent deletion of the last admin
    const adminCount = await db("users")
      .where({ role: 'admin' })
      .count('userID as count')
      .first();
      
    if (adminCount.count <= 1) {
      return res.status(400).json({ 
        message: "Impossible de supprimer le dernier administrateur du système." 
      });
    }

    // Delete the admin
    await db("users").where({ userID: id, role: 'admin' }).delete();
    res.status(200).json({ message: "Administrateur supprimé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la suppression de l'administrateur.",
      error: error.message,
    });
  }
};

// Change admin password
const changePassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Mot de passe actuel et nouveau sont requis" });
  }

  try {
    // Check if the admin exists
    const admin = await db("users")
      .where({ userID: id, role: 'admin' })
      .first();
      
    if (!admin) {
      return res.status(404).json({ message: "Administrateur introuvable." });
    }

    // Verify the current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe actuel incorrect." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    await db("users")
      .where({ userID: id, role: 'admin' })
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

// Get system stats for admin dashboard
const getSystemStats = async (req, res) => {
  try {
    // Get counts from database
    const [
      userCount, 
      avocatCount, 
      clientCount, 
      dossierCount, 
      factureCount
    ] = await Promise.all([
      db('users').count('userID as count').first(),
      db('users').where('role', 'avocat').count('userID as count').first(),
      db('users').where('role', 'client').count('userID as count').first(),
      db('dossier').count('dossierID as count').first(),
      db('facture').count('factureID as count').first()
    ]);

    res.status(200).json({
      userCount: userCount.count,
      avocatCount: avocatCount.count,
      clientCount: clientCount.count,
      dossierCount: dossierCount.count,
      factureCount: factureCount.count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des statistiques du système",
      error: error.message
    });
  }
};

module.exports = {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  changePassword,
  getSystemStats
};